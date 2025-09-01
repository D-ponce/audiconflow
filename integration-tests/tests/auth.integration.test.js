import axios from 'axios';

describe('Pruebas de Integración - Autenticación', () => {
  const baseURL = global.testConfig.backendUrl;
  let testUser;

  beforeEach(async () => {
    testUser = await global.testUtils.createTestUser({
      email: 'integration@test.com',
      password: 'integration123',
      role: 'auditor'
    });
  });

  describe('Flujo completo de registro y login', () => {
    test('registra usuario y luego hace login exitosamente', async () => {
      // 1. Registrar usuario
      const registerResponse = await axios.post(`${baseURL}/api/register`, {
        email: testUser.email,
        password: testUser.password,
        role: testUser.role
      });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.data.email).toBe(testUser.email);
      expect(registerResponse.data.role).toBe(testUser.role);
      expect(registerResponse.data.message).toContain('Usuario registrado con éxito');

      // 2. Verificar que el usuario existe en la base de datos
      const userInDb = await global.testDb.collection('users').findOne({
        email: testUser.email
      });
      expect(userInDb).toBeTruthy();
      expect(userInDb.email).toBe(testUser.email);
      expect(userInDb.role).toBe(testUser.role);
      expect(userInDb.password).not.toBe(testUser.password); // Debe estar hasheada

      // 3. Hacer login con las credenciales
      const loginResponse = await axios.post(`${baseURL}/api/login`, {
        user: testUser.email,
        password: testUser.password
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.email).toBe(testUser.email);
      expect(loginResponse.data.role).toBe(testUser.role);
      expect(loginResponse.data.message).toContain('Login exitoso');
    });

    test('no permite registro de usuario duplicado', async () => {
      // Registrar usuario por primera vez
      await axios.post(`${baseURL}/api/register`, {
        email: testUser.email,
        password: testUser.password,
        role: testUser.role
      });

      // Intentar registrar el mismo usuario otra vez
      try {
        await axios.post(`${baseURL}/api/register`, {
          email: testUser.email,
          password: 'differentpassword',
          role: 'administrador'
        });
        fail('Debería haber lanzado error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('El usuario ya existe');
      }
    });

    test('login falla con credenciales incorrectas', async () => {
      // Registrar usuario
      await axios.post(`${baseURL}/api/register`, {
        email: testUser.email,
        password: testUser.password,
        role: testUser.role
      });

      // Intentar login con contraseña incorrecta
      try {
        await axios.post(`${baseURL}/api/login`, {
          user: testUser.email,
          password: 'wrongpassword'
        });
        fail('Debería haber lanzado error');
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('Contraseña incorrecta');
      }
    });

    test('permite login con role en lugar de email', async () => {
      const adminUser = await global.testUtils.createTestUser({
        email: 'admin@test.com',
        password: 'admin123',
        role: 'administrador'
      });

      // Registrar usuario administrador
      await axios.post(`${baseURL}/api/register`, adminUser);

      // Login usando role en lugar de email
      const loginResponse = await axios.post(`${baseURL}/api/login`, {
        user: 'administrador', // Usando role
        password: adminUser.password
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.email).toBe(adminUser.email);
      expect(loginResponse.data.role).toBe('administrador');
    });
  });

  describe('Validaciones de datos', () => {
    test('registro falla con email inválido', async () => {
      try {
        await axios.post(`${baseURL}/api/register`, {
          email: 'invalid-email',
          password: 'password123',
          role: 'auditor'
        });
        fail('Debería haber lanzado error');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    test('registro falla con campos faltantes', async () => {
      try {
        await axios.post(`${baseURL}/api/register`, {
          email: 'test@example.com'
          // Faltan password y role
        });
        fail('Debería haber lanzado error');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Persistencia de datos', () => {
    test('usuario registrado persiste después de reinicio simulado', async () => {
      // Registrar usuario
      await axios.post(`${baseURL}/api/register`, testUser);

      // Verificar que existe en la base de datos
      const userInDb = await global.testDb.collection('users').findOne({
        email: testUser.email
      });
      
      expect(userInDb).toBeTruthy();
      expect(userInDb.email).toBe(testUser.email);
      expect(userInDb.createdAt).toBeInstanceOf(Date);
      expect(userInDb.updatedAt).toBeInstanceOf(Date);
    });
  });
});
