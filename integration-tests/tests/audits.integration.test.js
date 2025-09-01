import axios from 'axios';

describe('Pruebas de Integración - Auditorías', () => {
  const baseURL = global.testConfig.backendUrl;
  let authUser;
  let authHeaders;

  beforeEach(async () => {
    // Crear y registrar usuario para autenticación
    authUser = await global.testUtils.createTestUser({
      email: 'auditor@test.com',
      password: 'auditor123',
      role: 'auditor'
    });

    await axios.post(`${baseURL}/api/register`, authUser);
    
    const loginResponse = await axios.post(`${baseURL}/api/login`, {
      user: authUser.email,
      password: authUser.password
    });

    // Configurar headers de autenticación (si es necesario)
    authHeaders = {
      'Authorization': `Bearer ${loginResponse.data.token || 'mock-token'}`,
      'Content-Type': 'application/json'
    };
  });

  describe('CRUD completo de auditorías', () => {
    test('crea, lee, actualiza y elimina auditoría exitosamente', async () => {
      const testAudit = await global.testUtils.createTestAudit({
        name: 'Auditoría Integración Test',
        type: 'Inventario',
        location: 'Almacén Central',
        priority: 'Alta',
        auditor: 'Auditor de Prueba',
        createdBy: authUser.email
      });

      // 1. CREAR auditoría
      const createResponse = await axios.post(`${baseURL}/api/audits/create`, testAudit);
      
      expect(createResponse.status).toBe(201);
      expect(createResponse.data.success).toBe(true);
      expect(createResponse.data.audit.name).toBe(testAudit.name);
      expect(createResponse.data.audit.auditId).toMatch(/^AUD-\d+$/);
      
      const auditId = createResponse.data.audit.auditId;

      // 2. Verificar que existe en la base de datos
      const auditInDb = await global.testDb.collection('audits').findOne({
        auditId: auditId
      });
      expect(auditInDb).toBeTruthy();
      expect(auditInDb.name).toBe(testAudit.name);
      expect(auditInDb.status).toBe('Pendiente');

      // 3. LEER auditoría por ID
      const readResponse = await axios.get(`${baseURL}/api/audits/${auditId}`);
      
      expect(readResponse.status).toBe(200);
      expect(readResponse.data.success).toBe(true);
      expect(readResponse.data.audit.auditId).toBe(auditId);
      expect(readResponse.data.audit.name).toBe(testAudit.name);

      // 4. ACTUALIZAR auditoría
      const updateData = {
        status: 'En Progreso',
        description: 'Auditoría actualizada en prueba de integración'
      };
      
      const updateResponse = await axios.put(`${baseURL}/api/audits/${auditId}`, updateData);
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.success).toBe(true);
      expect(updateResponse.data.audit.status).toBe('En Progreso');
      expect(updateResponse.data.audit.description).toBe(updateData.description);

      // 5. Verificar actualización en base de datos
      const updatedAuditInDb = await global.testDb.collection('audits').findOne({
        auditId: auditId
      });
      expect(updatedAuditInDb.status).toBe('En Progreso');
      expect(updatedAuditInDb.description).toBe(updateData.description);

      // 6. ELIMINAR auditoría
      const deleteResponse = await axios.delete(`${baseURL}/api/audits/${auditId}`);
      
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.data.success).toBe(true);
      expect(deleteResponse.data.message).toContain('eliminada exitosamente');

      // 7. Verificar eliminación
      const deletedAuditInDb = await global.testDb.collection('audits').findOne({
        auditId: auditId
      });
      expect(deletedAuditInDb).toBeNull();
    });

    test('obtiene lista de auditorías con filtros', async () => {
      // Crear múltiples auditorías con diferentes características
      const audits = [
        await global.testUtils.createTestAudit({
          name: 'Auditoría Inventario 1',
          type: 'Inventario',
          priority: 'Alta',
          auditor: 'Auditor A'
        }),
        await global.testUtils.createTestAudit({
          name: 'Auditoría Financiera 1',
          type: 'Financiero',
          priority: 'Media',
          auditor: 'Auditor B'
        }),
        await global.testUtils.createTestAudit({
          name: 'Auditoría Inventario 2',
          type: 'Inventario',
          priority: 'Baja',
          auditor: 'Auditor A'
        })
      ];

      // Crear las auditorías
      const createdAudits = [];
      for (const audit of audits) {
        const response = await axios.post(`${baseURL}/api/audits/create`, audit);
        createdAudits.push(response.data.audit);
      }

      // Obtener todas las auditorías
      const allAuditsResponse = await axios.get(`${baseURL}/api/audits`);
      expect(allAuditsResponse.status).toBe(200);
      expect(allAuditsResponse.data.success).toBe(true);
      expect(allAuditsResponse.data.audits).toHaveLength(3);

      // Filtrar por tipo
      const inventoryAuditsResponse = await axios.get(`${baseURL}/api/audits?type=Inventario`);
      expect(inventoryAuditsResponse.data.audits).toHaveLength(2);
      inventoryAuditsResponse.data.audits.forEach(audit => {
        expect(audit.type).toBe('Inventario');
      });

      // Filtrar por prioridad
      const highPriorityResponse = await axios.get(`${baseURL}/api/audits?priority=Alta`);
      expect(highPriorityResponse.data.audits).toHaveLength(1);
      expect(highPriorityResponse.data.audits[0].priority).toBe('Alta');

      // Filtrar por auditor
      const auditorAResponse = await axios.get(`${baseURL}/api/audits?auditor=Auditor A`);
      expect(auditorAResponse.data.audits).toHaveLength(2);
      auditorAResponse.data.audits.forEach(audit => {
        expect(audit.auditor).toBe('Auditor A');
      });
    });

    test('obtiene estadísticas de auditorías correctamente', async () => {
      // Crear auditorías con diferentes estados y prioridades
      const auditData = [
        { status: 'Pendiente', priority: 'Alta', type: 'Inventario' },
        { status: 'Pendiente', priority: 'Media', type: 'Financiero' },
        { status: 'Activa', priority: 'Alta', type: 'Inventario' },
        { status: 'Completada', priority: 'Baja', type: 'Operacional' },
        { status: 'En Revisión', priority: 'Media', type: 'Financiero' }
      ];

      for (const data of auditData) {
        const audit = await global.testUtils.createTestAudit(data);
        await axios.post(`${baseURL}/api/audits/create`, audit);
        
        // Actualizar status si no es 'Pendiente'
        if (data.status !== 'Pendiente') {
          const createdAudit = await global.testDb.collection('audits').findOne({
            name: audit.name
          });
          await axios.put(`${baseURL}/api/audits/${createdAudit.auditId}`, {
            status: data.status
          });
        }
      }

      // Obtener estadísticas
      const statsResponse = await axios.get(`${baseURL}/api/audits/stats/summary`);
      
      expect(statsResponse.status).toBe(200);
      expect(statsResponse.data.success).toBe(true);
      
      const stats = statsResponse.data.stats;
      expect(stats.total).toBe(5);
      expect(stats.pending).toBe(2);
      expect(stats.active).toBe(1);
      expect(stats.completed).toBe(1);
      expect(stats.inReview).toBe(1);
      
      // Verificar estadísticas por prioridad
      expect(stats.byPriority.alta).toBe(2);
      expect(stats.byPriority.media).toBe(2);
      expect(stats.byPriority.baja).toBe(1);
      
      // Verificar estadísticas por tipo
      expect(stats.byType['Inventario']).toBe(2);
      expect(stats.byType['Financiero']).toBe(2);
      expect(stats.byType['Operacional']).toBe(1);
    });
  });

  describe('Validaciones y manejo de errores', () => {
    test('falla al crear auditoría con campos faltantes', async () => {
      try {
        await axios.post(`${baseURL}/api/audits/create`, {
          name: 'Auditoría Incompleta'
          // Faltan campos requeridos
        });
        fail('Debería haber lanzado error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.message).toContain('requeridos');
      }
    });

    test('retorna 404 para auditoría inexistente', async () => {
      try {
        await axios.get(`${baseURL}/api/audits/AUD-INEXISTENTE`);
        fail('Debería haber lanzado error');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(false);
        expect(error.response.data.message).toBe('Auditoría no encontrada');
      }
    });

    test('falla al actualizar auditoría inexistente', async () => {
      try {
        await axios.put(`${baseURL}/api/audits/AUD-INEXISTENTE`, {
          status: 'Completada'
        });
        fail('Debería haber lanzado error');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(false);
      }
    });

    test('falla al eliminar auditoría inexistente', async () => {
      try {
        await axios.delete(`${baseURL}/api/audits/AUD-INEXISTENTE`);
        fail('Debería haber lanzado error');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(false);
      }
    });
  });

  describe('Integridad de datos', () => {
    test('auditorías mantienen integridad referencial', async () => {
      const audit = await global.testUtils.createTestAudit({
        createdBy: authUser.email,
        auditor: authUser.email
      });

      const createResponse = await axios.post(`${baseURL}/api/audits/create`, audit);
      const auditId = createResponse.data.audit.auditId;

      // Verificar que la auditoría referencia correctamente al usuario
      const auditInDb = await global.testDb.collection('audits').findOne({
        auditId: auditId
      });

      expect(auditInDb.createdBy).toBe(authUser.email);
      expect(auditInDb.auditor).toBe(authUser.email);
      expect(auditInDb.createdAt).toBeInstanceOf(Date);
      expect(auditInDb.updatedAt).toBeInstanceOf(Date);
    });
  });
});
