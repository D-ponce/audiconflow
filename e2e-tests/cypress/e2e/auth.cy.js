describe('Pruebas E2E - Autenticación (MEJORADO)', () => {
  beforeEach(() => {
    // Setup mejorado con limpieza de datos
    cy.task('db:seed')
    
    // Registrar usuario de prueba con datos únicos
    cy.register({
      email: `e2e-${Date.now()}@test.com`,
      password: 'e2etest123',
      role: 'auditor'
    })
    
    // Interceptar llamadas API para mejor control
    cy.intercept('POST', '/api/auth/login').as('loginRequest')
    cy.intercept('POST', '/api/auth/logout').as('logoutRequest')
    cy.intercept('GET', '/api/dashboard*').as('getDashboard')
  })
  
  afterEach(() => {
    // Limpieza automática post-prueba
    cy.task('db:clean')
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('permite login exitoso y navegación al dashboard', () => {
    const testEmail = `e2e-${Date.now()}@test.com`
    
    // Registrar usuario específico para esta prueba
    cy.register({
      email: testEmail,
      password: 'e2etest123',
      role: 'auditor'
    })
    
    cy.visit('/login')
    
    // Verificar elementos de la página con selectores robustos
    cy.get('[data-cy="app-title"]').should('contain', 'AudiconFlow')
    cy.get('[data-cy="login-subtitle"]').should('contain', 'Inicia sesión para acceder')
    cy.get('[data-cy="login-form"]').should('be.visible')
    
    // Realizar login con validaciones mejoradas
    cy.get('[data-cy="email-input"]').should('be.visible').type(testEmail)
    cy.get('[data-cy="password-input"]').should('be.visible').type('e2etest123')
    cy.get('[data-cy="login-btn"]').should('be.enabled').click()
    
    // Esperar respuesta de login
    cy.wait('@loginRequest')
    
    // Verificar redirección al dashboard
    cy.url().should('include', '/dashboard')
    cy.wait('@getDashboard')
    cy.get('[data-cy="dashboard-title"]').should('be.visible')
    cy.get('[data-cy="loading-spinner"]').should('not.exist')
    
    // Verificar que la sesión se guardó correctamente
    cy.window().then((win) => {
      const authToken = win.localStorage.getItem('authToken')
      const userRole = win.localStorage.getItem('userRole')
      expect(authToken).to.exist
      expect(userRole).to.equal('auditor')
    })
    
    // Verificar elementos del dashboard
    cy.get('[data-cy="user-welcome"]').should('contain', testEmail)
    cy.get('[data-cy="navigation-menu"]').should('be.visible')
  })

  it('muestra errores de validación en el formulario', () => {
    cy.visit('/login')
    
    // Verificar estado inicial del formulario
    cy.get('[data-cy="login-form"]').should('be.visible')
    cy.get('[data-cy="login-btn"]').should('be.enabled')
    
    // Intentar enviar formulario vacío
    cy.get('[data-cy="login-btn"]').click()
    
    // Verificar mensajes de error con selectores específicos
    cy.get('[data-cy="email-error"]').should('contain', 'El correo electrónico es requerido')
    cy.get('[data-cy="password-error"]').should('contain', 'La contraseña es requerida')
    cy.get('[data-cy="form-errors"]').should('be.visible')
    
    // Probar email inválido
    cy.get('[data-cy="email-input"]').type('email-invalido')
    cy.get('[data-cy="login-btn"]').click()
    cy.get('[data-cy="email-error"]').should('contain', 'Formato de correo electrónico inválido')
    
    // Probar contraseña muy corta
    cy.get('[data-cy="email-input"]').clear().type('test@example.com')
    cy.get('[data-cy="password-input"]').type('123')
    cy.get('[data-cy="login-btn"]').click()
    cy.get('[data-cy="password-error"]').should('contain', 'La contraseña debe tener al menos 6 caracteres')
    
    // Verificar que los errores se limpian al corregir
    cy.get('[data-cy="email-input"]').clear().type('valid@email.com')
    cy.get('[data-cy="password-input"]').clear().type('validpassword')
    cy.get('[data-cy="email-error"]').should('not.exist')
    cy.get('[data-cy="password-error"]').should('not.exist')
  })

  it('maneja credenciales incorrectas con reintentos', () => {
    const testEmail = `e2e-${Date.now()}@test.com`
    
    // Registrar usuario para la prueba
    cy.register({
      email: testEmail,
      password: 'correctpassword',
      role: 'auditor'
    })
    
    cy.visit('/login')
    
    // Probar con contraseña incorrecta
    cy.get('[data-cy="email-input"]').type(testEmail)
    cy.get('[data-cy="password-input"]').type('contraseña-incorrecta')
    cy.get('[data-cy="login-btn"]').click()
    
    cy.wait('@loginRequest')
    
    // Verificar mensaje de error
    cy.get('[data-cy="login-error"]').should('contain', 'Credenciales incorrectas')
    cy.get('[data-cy="error-alert"]').should('be.visible')
    
    // Verificar que no se redirigió
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-form"]').should('be.visible')
    
    // Probar con email inexistente
    cy.get('[data-cy="email-input"]').clear().type('noexiste@test.com')
    cy.get('[data-cy="password-input"]').clear().type('anypassword')
    cy.get('[data-cy="login-btn"]').click()
    
    cy.wait('@loginRequest')
    cy.get('[data-cy="login-error"]').should('contain', 'Usuario no encontrado')
    
    // Verificar que el formulario permite reintentos
    cy.get('[data-cy="email-input"]').should('be.enabled')
    cy.get('[data-cy="password-input"]').should('be.enabled')
    cy.get('[data-cy="login-btn"]').should('be.enabled')
  })

  it('permite logout y limpia la sesión completamente', () => {
    const testEmail = `e2e-${Date.now()}@test.com`
    
    // Registrar y hacer login
    cy.register({
      email: testEmail,
      password: 'e2etest123',
      role: 'auditor'
    })
    
    cy.login(testEmail, 'e2etest123')
    cy.visit('/dashboard')
    cy.wait('@getDashboard')
    
    // Verificar que estamos autenticados
    cy.get('[data-cy="dashboard-title"]').should('be.visible')
    cy.get('[data-cy="user-menu"]').should('be.visible')
    
    // Hacer logout
    cy.get('[data-cy="user-menu"]').click()
    cy.get('[data-cy="user-dropdown"]').should('be.visible')
    cy.get('[data-cy="logout-btn"]').click()
    
    // Esperar respuesta de logout
    cy.wait('@logoutRequest')
    
    // Verificar redirección al login
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-form"]').should('be.visible')
    
    // Verificar que la sesión se limpió completamente
    cy.window().then((win) => {
      const authToken = win.localStorage.getItem('authToken')
      const userRole = win.localStorage.getItem('userRole')
      const session = win.localStorage.getItem('audiconflow_session')
      
      expect(authToken).to.be.null
      expect(userRole).to.be.null
      expect(session).to.be.null
    })
    
    // Verificar que no se puede acceder a rutas protegidas
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('funciona el enlace de olvido de contraseña', () => {
    cy.visit('/login')
    
    // Verificar que el enlace existe
    cy.get('[data-cy="forgot-password-link"]').should('be.visible')
    cy.get('[data-cy="forgot-password-link"]').should('contain', '¿Olvidaste tu contraseña?')
    
    // Interceptar alert para verificar funcionalidad
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert')
    })
    
    cy.get('[data-cy="forgot-password-link"]').click()
    
    // Verificar que se muestra el mensaje correcto
    cy.get('@windowAlert').should('have.been.calledWith', 
      'Funcionalidad de recuperación de contraseña próximamente disponible')
    
    // Verificar que permanecemos en la página de login
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-form"]').should('be.visible')
  })
  
  it('maneja estados de carga y timeouts', () => {
    const testEmail = `e2e-${Date.now()}@test.com`
    
    cy.register({
      email: testEmail,
      password: 'e2etest123',
      role: 'auditor'
    })
    
    cy.visit('/login')
    
    // Simular respuesta lenta del servidor
    cy.intercept('POST', '/api/auth/login', { delay: 3000 }).as('slowLogin')
    
    cy.get('[data-cy="email-input"]').type(testEmail)
    cy.get('[data-cy="password-input"]').type('e2etest123')
    cy.get('[data-cy="login-btn"]').click()
    
    // Verificar estado de carga
    cy.get('[data-cy="login-btn"]').should('be.disabled')
    cy.get('[data-cy="login-loading"]').should('be.visible')
    cy.get('[data-cy="login-spinner"]').should('be.visible')
    
    // Esperar respuesta
    cy.wait('@slowLogin')
    
    // Verificar que el estado de carga desaparece
    cy.get('[data-cy="login-loading"]').should('not.exist')
    cy.url().should('include', '/dashboard')
  })
  
  it('valida campos en tiempo real', () => {
    cy.visit('/login')
    
    // Probar validación de email en tiempo real
    cy.get('[data-cy="email-input"]').type('invalid')
    cy.get('[data-cy="email-input"]').blur()
    cy.get('[data-cy="email-error"]').should('be.visible')
    
    cy.get('[data-cy="email-input"]').clear().type('valid@email.com')
    cy.get('[data-cy="email-input"]').blur()
    cy.get('[data-cy="email-error"]').should('not.exist')
    
    // Probar validación de contraseña en tiempo real
    cy.get('[data-cy="password-input"]').type('12')
    cy.get('[data-cy="password-input"]').blur()
    cy.get('[data-cy="password-error"]').should('be.visible')
    
    cy.get('[data-cy="password-input"]').clear().type('validpassword')
    cy.get('[data-cy="password-input"]').blur()
    cy.get('[data-cy="password-error"]').should('not.exist')
  })
})
