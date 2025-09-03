// Comandos personalizados para AudiconFlow

// Comando para login
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('include', '/dashboard')
})

// Comando para registro de usuario
Cypress.Commands.add('register', (userData) => {
  const defaultUser = {
    email: 'newuser@example.com',
    password: 'password123',
    role: 'auditor'
  }
  const user = { ...defaultUser, ...userData }
  
  cy.request('POST', `${Cypress.env('backendUrl')}/api/register`, user)
})

// Comando para crear auditoría
Cypress.Commands.add('createAudit', (auditData) => {
  const defaultAudit = {
    name: 'Auditoría de Prueba E2E',
    type: 'Inventario',
    location: 'Almacén Test',
    priority: 'Media',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    auditor: 'Test Auditor',
    description: 'Auditoría creada por prueba E2E'
  }
  const audit = { ...defaultAudit, ...auditData }
  
  cy.request('POST', `${Cypress.env('backendUrl')}/api/audits/create`, audit)
})

// Comando para limpiar base de datos
Cypress.Commands.add('resetDatabase', () => {
  cy.request('POST', `${Cypress.env('backendUrl')}/api/test/reset-db`)
})

// Comando para esperar elemento con retry
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible')
})

// Comando para verificar notificación
Cypress.Commands.add('checkNotification', (message, type = 'success') => {
  cy.get(`[data-testid="notification-${type}"]`)
    .should('be.visible')
    .and('contain.text', message)
})

// Comando para realizar cruce de datos completo
Cypress.Commands.add('performDataCross', (auditId, file1, file2) => {
  cy.visit(`/file-upload-and-processing?auditId=${auditId}`)
  
  // Cargar primer archivo
  cy.fixture(file1).then(fileContent => {
    cy.get('input[type="file"]').selectFile({
      contents: fileContent,
      fileName: file1
    })
  })
  cy.get('[data-testid="process-button"]').click()
  cy.contains('Archivo procesado exitosamente', { timeout: 10000 }).should('be.visible')
  
  // Cargar segundo archivo
  cy.fixture(file2).then(fileContent => {
    cy.get('input[type="file"]').selectFile({
      contents: fileContent,
      fileName: file2
    })
  })
  cy.get('[data-testid="process-button"]').click()
  cy.contains('Archivo procesado exitosamente', { timeout: 10000 }).should('be.visible')
  
  // Realizar cruce
  cy.get('[data-testid="cross-data-button"]').click()
  cy.get('select[name="file1"]').select(file1)
  cy.get('select[name="file2"]').select(file2)
  cy.get('select[name="key1"]').select(0)
  cy.get('select[name="key2"]').select(0)
  cy.get('[data-testid="execute-cross-button"]').click()
  
  cy.contains('Cruce completado exitosamente', { timeout: 15000 }).should('be.visible')
})
