describe('Pruebas E2E - Autenticación', () => {
  beforeEach(() => {
    // Registrar usuario de prueba
    cy.register({
      email: 'e2e@test.com',
      password: 'e2etest123',
      role: 'auditor'
    })
  })

  it('permite login exitoso y navegación al dashboard', () => {
    cy.visit('/login')
    
    // Verificar elementos de la página de login
    cy.contains('AudiconFlow').should('be.visible')
    cy.contains('Inicia sesión para acceder').should('be.visible')
    
    // Realizar login
    cy.get('input[name="email"]').type('e2e@test.com')
    cy.get('input[name="password"]').type('e2etest123')
    cy.get('button[type="submit"]').click()
    
    // Verificar redirección al dashboard
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
    
    // Verificar que la sesión se guardó
    cy.window().then((win) => {
      const session = JSON.parse(win.localStorage.getItem('audiconflow_session'))
      expect(session).to.have.property('email', 'e2e@test.com')
      expect(session).to.have.property('role', 'auditor')
    })
  })

  it('muestra errores de validación en el formulario', () => {
    cy.visit('/login')
    
    // Intentar enviar formulario vacío
    cy.get('button[type="submit"]').click()
    
    // Verificar mensajes de error
    cy.contains('El correo electrónico es requerido').should('be.visible')
    cy.contains('La contraseña es requerida').should('be.visible')
    
    // Probar email inválido
    cy.get('input[name="email"]').type('email-invalido')
    cy.get('button[type="submit"]').click()
    cy.contains('Formato de correo electrónico inválido').should('be.visible')
    
    // Probar contraseña muy corta
    cy.get('input[name="email"]').clear().type('test@example.com')
    cy.get('input[name="password"]').type('123')
    cy.get('button[type="submit"]').click()
    cy.contains('La contraseña debe tener al menos 6 caracteres').should('be.visible')
  })

  it('maneja credenciales incorrectas', () => {
    cy.visit('/login')
    
    cy.get('input[name="email"]').type('e2e@test.com')
    cy.get('input[name="password"]').type('contraseña-incorrecta')
    cy.get('button[type="submit"]').click()
    
    // Verificar mensaje de error
    cy.contains('Credenciales incorrectas').should('be.visible')
    
    // Verificar que no se redirigió
    cy.url().should('include', '/login')
  })

  it('permite logout y limpia la sesión', () => {
    // Login primero
    cy.login('e2e@test.com', 'e2etest123')
    
    // Verificar que estamos en el dashboard
    cy.url().should('include', '/dashboard')
    
    // Hacer logout
    cy.get('[data-testid="user-menu"]').click()
    cy.get('[data-testid="logout-button"]').click()
    
    // Verificar redirección al login
    cy.url().should('include', '/login')
    
    // Verificar que la sesión se limpió
    cy.window().then((win) => {
      const session = win.localStorage.getItem('audiconflow_session')
      expect(session).to.be.null
    })
  })

  it('funciona el enlace de olvido de contraseña', () => {
    cy.visit('/login')
    
    cy.contains('¿Olvidaste tu contraseña?').click()
    
    // Verificar que se muestra el mensaje (como es un alert, verificamos que se ejecute)
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert')
    })
    
    cy.contains('¿Olvidaste tu contraseña?').click()
    cy.get('@windowAlert').should('have.been.calledWith', 
      'Funcionalidad de recuperación de contraseña próximamente disponible')
  })
})
