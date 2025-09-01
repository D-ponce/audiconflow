import axios from 'axios';

describe('Pruebas de Integración - Flujo Completo de Trabajo', () => {
  const baseURL = global.testConfig.backendUrl;

  describe('Flujo completo: Usuario → Auditoría → Gestión', () => {
    test('flujo completo desde registro hasta gestión de auditorías', async () => {
      // 1. REGISTRO DE USUARIOS
      const adminUser = {
        email: 'admin@audiconflow.com',
        password: 'admin123',
        role: 'administrador'
      };

      const auditorUser = {
        email: 'auditor@audiconflow.com',
        password: 'auditor123',
        role: 'auditor'
      };

      // Registrar administrador
      const adminRegisterResponse = await axios.post(`${baseURL}/api/register`, adminUser);
      expect(adminRegisterResponse.status).toBe(201);
      expect(adminRegisterResponse.data.role).toBe('administrador');

      // Registrar auditor
      const auditorRegisterResponse = await axios.post(`${baseURL}/api/register`, auditorUser);
      expect(auditorRegisterResponse.status).toBe(201);
      expect(auditorRegisterResponse.data.role).toBe('auditor');

      // 2. LOGIN DE USUARIOS
      const adminLoginResponse = await axios.post(`${baseURL}/api/login`, {
        user: adminUser.email,
        password: adminUser.password
      });
      expect(adminLoginResponse.status).toBe(200);

      const auditorLoginResponse = await axios.post(`${baseURL}/api/login`, {
        user: auditorUser.email,
        password: auditorUser.password
      });
      expect(auditorLoginResponse.status).toBe(200);

      // 3. CREACIÓN DE AUDITORÍAS (por administrador)
      const auditorias = [
        {
          name: 'Auditoría Inventario Q1',
          type: 'Inventario',
          location: 'Almacén Principal',
          priority: 'Alta',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          auditor: auditorUser.email,
          description: 'Auditoría trimestral de inventario',
          createdBy: adminUser.email
        },
        {
          name: 'Auditoría Financiera Mensual',
          type: 'Financiero',
          location: 'Oficina Central',
          priority: 'Media',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          auditor: auditorUser.email,
          description: 'Revisión financiera mensual',
          createdBy: adminUser.email
        }
      ];

      const auditoriasCreadas = [];
      for (const auditoria of auditorias) {
        const createResponse = await axios.post(`${baseURL}/api/audits/create`, auditoria);
        expect(createResponse.status).toBe(201);
        auditoriasCreadas.push(createResponse.data.audit);
      }

      // 4. CONSULTA DE AUDITORÍAS ASIGNADAS
      const auditoriasAsignadasResponse = await axios.get(`${baseURL}/api/audits?auditor=${auditorUser.email}`);
      expect(auditoriasAsignadasResponse.status).toBe(200);
      expect(auditoriasAsignadasResponse.data.audits).toHaveLength(2);

      // 5. INICIO DE TRABAJO EN AUDITORÍA (cambio de estado)
      const primeraAuditoria = auditoriasCreadas[0];
      const iniciarTrabajoResponse = await axios.put(`${baseURL}/api/audits/${primeraAuditoria.auditId}`, {
        status: 'En Progreso',
        description: 'Iniciando trabajo de auditoría - revisión preliminar completada'
      });
      expect(iniciarTrabajoResponse.status).toBe(200);
      expect(iniciarTrabajoResponse.data.audit.status).toBe('En Progreso');

      // 6. PROGRESO DE AUDITORÍA
      const progresoResponse = await axios.put(`${baseURL}/api/audits/${primeraAuditoria.auditId}`, {
        status: 'En Progreso',
        description: 'Auditoría 50% completada - se encontraron 3 discrepancias menores'
      });
      expect(progresoResponse.status).toBe(200);

      // 7. FINALIZACIÓN DE AUDITORÍA
      const finalizarResponse = await axios.put(`${baseURL}/api/audits/${primeraAuditoria.auditId}`, {
        status: 'Completada',
        description: 'Auditoría completada exitosamente - informe final generado'
      });
      expect(finalizarResponse.status).toBe(200);
      expect(finalizarResponse.data.audit.status).toBe('Completada');

      // 8. REVISIÓN POR ADMINISTRADOR
      const revisionResponse = await axios.put(`${baseURL}/api/audits/${primeraAuditoria.auditId}`, {
        status: 'En Revisión',
        description: 'Auditoría en revisión por administrador'
      });
      expect(revisionResponse.status).toBe(200);

      // 9. CONSULTA DE ESTADÍSTICAS FINALES
      const estadisticasResponse = await axios.get(`${baseURL}/api/audits/stats/summary`);
      expect(estadisticasResponse.status).toBe(200);
      
      const stats = estadisticasResponse.data.stats;
      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1); // Segunda auditoría
      expect(stats.inReview).toBe(1); // Primera auditoría
      expect(stats.byType['Inventario']).toBe(1);
      expect(stats.byType['Financiero']).toBe(1);

      // 10. VERIFICACIÓN EN BASE DE DATOS
      const auditoriasEnDb = await global.testDb.collection('audits').find({}).toArray();
      expect(auditoriasEnDb).toHaveLength(2);
      
      const auditoriaCompletada = auditoriasEnDb.find(a => a.auditId === primeraAuditoria.auditId);
      expect(auditoriaCompletada.status).toBe('En Revisión');
      expect(auditoriaCompletada.auditor).toBe(auditorUser.email);
      expect(auditoriaCompletada.createdBy).toBe(adminUser.email);

      const usuariosEnDb = await global.testDb.collection('users').find({}).toArray();
      expect(usuariosEnDb).toHaveLength(2);
      expect(usuariosEnDb.map(u => u.role)).toContain('administrador');
      expect(usuariosEnDb.map(u => u.role)).toContain('auditor');
    });

    test('flujo de manejo de errores y recuperación', async () => {
      // 1. Crear usuario y auditoría
      const testUser = {
        email: 'error@test.com',
        password: 'test123',
        role: 'auditor'
      };

      await axios.post(`${baseURL}/api/register`, testUser);
      
      const auditoria = await global.testUtils.createTestAudit({
        name: 'Auditoría Error Test',
        auditor: testUser.email
      });

      const createResponse = await axios.post(`${baseURL}/api/audits/create`, auditoria);
      const auditId = createResponse.data.audit.auditId;

      // 2. Intentar operaciones inválidas y verificar manejo de errores
      
      // Actualizar auditoría inexistente
      try {
        await axios.put(`${baseURL}/api/audits/AUD-FAKE`, { status: 'Completada' });
        fail('Debería haber fallado');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }

      // Login con credenciales incorrectas
      try {
        await axios.post(`${baseURL}/api/login`, {
          user: testUser.email,
          password: 'wrongpassword'
        });
        fail('Debería haber fallado');
      } catch (error) {
        expect(error.response.status).toBe(401);
      }

      // 3. Recuperación exitosa después de errores
      const loginResponse = await axios.post(`${baseURL}/api/login`, {
        user: testUser.email,
        password: testUser.password
      });
      expect(loginResponse.status).toBe(200);

      const updateResponse = await axios.put(`${baseURL}/api/audits/${auditId}`, {
        status: 'Completada'
      });
      expect(updateResponse.status).toBe(200);
    });

    test('flujo de concurrencia - múltiples usuarios simultáneos', async () => {
      // Crear múltiples usuarios
      const usuarios = [
        { email: 'user1@test.com', password: 'pass1', role: 'auditor' },
        { email: 'user2@test.com', password: 'pass2', role: 'auditor' },
        { email: 'admin@test.com', password: 'admin', role: 'administrador' }
      ];

      // Registrar usuarios en paralelo
      const registroPromises = usuarios.map(user => 
        axios.post(`${baseURL}/api/register`, user)
      );
      const registroResponses = await Promise.all(registroPromises);
      
      registroResponses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Crear auditorías en paralelo
      const auditorias = usuarios.slice(0, 2).map((user, index) => ({
        name: `Auditoría Concurrente ${index + 1}`,
        type: 'Inventario',
        location: `Ubicación ${index + 1}`,
        priority: 'Media',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        auditor: user.email,
        createdBy: usuarios[2].email
      }));

      const creacionPromises = auditorias.map(audit => 
        axios.post(`${baseURL}/api/audits/create`, audit)
      );
      const creacionResponses = await Promise.all(creacionPromises);
      
      creacionResponses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verificar que todas las auditorías se crearon correctamente
      const todasAuditoriasResponse = await axios.get(`${baseURL}/api/audits`);
      expect(todasAuditoriasResponse.data.audits).toHaveLength(2);

      // Verificar integridad de datos después de operaciones concurrentes
      const usuariosEnDb = await global.testDb.collection('users').countDocuments();
      expect(usuariosEnDb).toBe(3);

      const auditoriasEnDb = await global.testDb.collection('audits').countDocuments();
      expect(auditoriasEnDb).toBe(2);
    });
  });
});
