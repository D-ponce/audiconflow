// Comandos personalizados para AudiconFlow
import './commands'

// Configuración global
Cypress.on('uncaught:exception', (err, runnable) => {
  // Evitar que errores de la aplicación fallen las pruebas
  return false
})

// Limpiar datos antes de cada prueba
beforeEach(() => {
  // Limpiar localStorage
  cy.clearLocalStorage()
  
  // Limpiar cookies
  cy.clearCookies()
  
  // Resetear base de datos (si es necesario)
  cy.task('resetDatabase', null, { timeout: 10000 })
})
