# GUÍA DE MEJORES PRÁCTICAS DE TESTING - AUDICONFLOW

**Fecha:** 2 de septiembre de 2025  
**Versión:** AudiconFlow v1.0 - Testing Framework  
**Estado:** ✅ **IMPLEMENTADO**

---

## ESTÁNDARES DE TESTING

### **Nomenclatura de Archivos**
```
backend/models/__tests__/[ModelName].test.js
backend/routes/__tests__/[routeName].test.js
e2e-tests/cypress/e2e/[feature-name].cy.js
integration-tests/tests/[feature].integration.test.js
```

### **Estructura de Pruebas**
```javascript
describe('Componente Principal', () => {
  beforeEach(() => {
    // Setup común
  })
  
  afterEach(() => {
    // Limpieza
  })
  
  describe('Funcionalidad Específica', () => {
    it('debe realizar acción esperada', () => {
      // Arrange, Act, Assert
    })
  })
})
```

---

## SELECTORES ROBUSTOS

### **Atributos data-cy Recomendados**
```html
<!-- Elementos de navegación -->
<button data-cy="create-user-btn">Crear Usuario</button>
<input data-cy="email-input" type="email" />
<select data-cy="role-filter">...</select>

<!-- Estados y mensajes -->
<div data-cy="loading-spinner">...</div>
<div data-cy="error-message">...</div>
<div data-cy="success-message">...</div>

<!-- Tablas y listas -->
<table data-cy="users-table">
  <tr data-cy="user-row-${email}">...</tr>
</table>
```

### **Jerarquía de Selectores**
1. **Preferido:** `[data-cy="elemento"]`
2. **Aceptable:** `[data-testid="elemento"]`
3. **Evitar:** Clases CSS, IDs, texto

---

## PATRONES DE INTERCEPTORES

### **APIs Comunes**
```javascript
beforeEach(() => {
  // Interceptores estándar
  cy.intercept('GET', '/api/users*').as('getUsers')
  cy.intercept('POST', '/api/users').as('createUser')
  cy.intercept('PUT', '/api/users/*').as('updateUser')
  cy.intercept('DELETE', '/api/users/*').as('deleteUser')
  
  // Autenticación
  cy.intercept('POST', '/api/auth/login').as('loginRequest')
  cy.intercept('POST', '/api/auth/logout').as('logoutRequest')
})
```

### **Manejo de Errores**
```javascript
// Simular errores de red
cy.intercept('GET', '/api/users*', { forceNetworkError: true }).as('networkError')

// Simular respuestas lentas
cy.intercept('POST', '/api/users', { delay: 3000 }).as('slowResponse')

// Simular errores del servidor
cy.intercept('GET', '/api/users*', { statusCode: 500 }).as('serverError')
```

---

## GESTIÓN DE DATOS DE PRUEBA

### **Setup y Cleanup**
```javascript
beforeEach(() => {
  // Limpiar base de datos
  cy.task('db:seed')
  
  // Datos únicos por prueba
  const timestamp = Date.now()
  const testEmail = `test-${timestamp}@example.com`
})

afterEach(() => {
  // Limpieza automática
  cy.task('db:clean')
  cy.clearLocalStorage()
  cy.clearCookies()
})
```

### **Comandos Personalizados**
```javascript
// cypress/support/commands.js
Cypress.Commands.add('register', (userData) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: userData,
    failOnStatusCode: false
  })
})

Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: { email, password }
    }).then((response) => {
      window.localStorage.setItem('authToken', response.body.token)
    })
  })
})
```

---

## CASOS DE PRUEBA ESENCIALES

### **Casos Happy Path**
- ✅ Flujo principal exitoso
- ✅ Navegación estándar
- ✅ Operaciones CRUD básicas

### **Casos Edge**
- ✅ Campos vacíos
- ✅ Datos inválidos
- ✅ Límites de caracteres
- ✅ Caracteres especiales

### **Casos de Error**
- ✅ Errores de red
- ✅ Timeouts
- ✅ Errores del servidor
- ✅ Datos corruptos

### **Casos de Concurrencia**
- ✅ Operaciones simultáneas
- ✅ Estados de carga
- ✅ Bloqueo de UI

---

## MÉTRICAS Y UMBRALES

### **Cobertura Mínima**
- **Modelos:** 85%+
- **Rutas:** 80%+
- **Servicios:** 75%+
- **Componentes:** 70%+

### **Rendimiento**
- **Tiempo de ejecución:** < 30 segundos por suite
- **Casos por archivo:** < 20 casos
- **Timeout máximo:** 10 segundos

### **Calidad**
- **Tasa de éxito:** > 95%
- **Casos edge:** > 20% del total
- **Manejo de errores:** 100% de endpoints

---

## CONFIGURACIÓN CI/CD

### **Pipeline de Testing**
```yaml
# .github/workflows/testing.yml
name: Testing Pipeline
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run E2E tests
        uses: cypress-io/github-action@v5
        with:
          start: npm start
          wait-on: 'http://localhost:3000'
```

### **Configuración de Calidad**
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/serviceWorker.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

---

## COMANDOS ÚTILES

### **Desarrollo**
```bash
# Ejecutar pruebas en modo watch
npm test -- --watch

# Ejecutar pruebas específicas
npx jest --testNamePattern="User"

# Generar cobertura
npm test -- --coverage --watchAll=false

# E2E en modo interactivo
npx cypress open

# E2E en modo headless
npx cypress run
```

### **Depuración**
```bash
# Ejecutar con logs detallados
npm test -- --verbose

# Ejecutar sin caché
npx jest --no-cache

# Cypress con logs de red
npx cypress run --env CYPRESS_LOG_LEVEL=debug
```

---

## CHECKLIST DE CALIDAD

### **Antes de Commit**
- [ ] Todas las pruebas pasan
- [ ] Cobertura > 80%
- [ ] Sin warnings de linting
- [ ] Documentación actualizada

### **Antes de Deploy**
- [ ] Suite completa ejecutada
- [ ] Pruebas E2E exitosas
- [ ] Métricas de rendimiento validadas
- [ ] Casos de regresión verificados

### **Revisión de Código**
- [ ] Casos edge cubiertos
- [ ] Manejo de errores implementado
- [ ] Selectores robustos utilizados
- [ ] Cleanup automático configurado

---

**Guía implementada el 2 de septiembre de 2025**  
**Sistema:** AudiconFlow Testing Standards  
**Responsable:** Framework de Calidad Automatizado
