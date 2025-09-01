# 🔗 Guía de Pruebas de Integración - AudiconFlow

## 📋 Resumen

Esta guía describe la configuración y ejecución de **pruebas de integración** y **pruebas End-to-End (E2E)** para AudiconFlow, que prueban la interacción real entre frontend, backend y base de datos.

## 🎯 Tipos de Pruebas Implementadas

### **1. Pruebas de Integración** 
- Prueban la interacción real entre **backend y base de datos**
- Usan **MongoDB real** (base de datos de prueba)
- Verifican **flujos completos** de API
- **Sin mocks** - todo es real excepto el entorno

### **2. Pruebas End-to-End (E2E)**
- Prueban la **aplicación completa** en el navegador
- Simulan **interacciones reales del usuario**
- Verifican **frontend + backend + base de datos**
- Usan **Cypress** para automatización del navegador

## 🏗️ Estructura del Proyecto

```
audiconflow/
├── integration-tests/          # Pruebas de integración (Backend + DB)
│   ├── tests/
│   │   ├── auth.integration.test.js
│   │   ├── audits.integration.test.js
│   │   └── fullWorkflow.integration.test.js
│   ├── setup/
│   │   ├── setupTests.js
│   │   └── setupTestEnv.js
│   ├── package.json
│   ├── jest.config.js
│   └── babel.config.js
├── e2e-tests/                  # Pruebas End-to-End (Cypress)
│   ├── cypress/
│   │   ├── e2e/
│   │   │   ├── auth.cy.js
│   │   │   └── dashboard.cy.js
│   │   └── support/
│   │       ├── commands.js
│   │       └── e2e.js
│   ├── package.json
│   └── cypress.config.js
└── TESTING.md                  # Pruebas unitarias
```

## 🚀 Configuración y Ejecución

### **Pruebas de Integración**

#### Requisitos Previos
- MongoDB ejecutándose en `localhost:27017`
- Backend ejecutándose en `localhost:5000`
- Node.js instalado

#### Instalación
```bash
cd integration-tests
npm install
```

#### Ejecución
```bash
# Ejecutar todas las pruebas de integración
npm test

# Ejecutar en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage

# Configurar entorno de prueba
npm run setup
```

### **Pruebas End-to-End (E2E)**

#### Requisitos Previos
- Frontend ejecutándose en `localhost:3000`
- Backend ejecutándose en `localhost:5000`
- MongoDB ejecutándose

#### Instalación
```bash
cd e2e-tests
npm install
```

#### Ejecución
```bash
# Abrir interfaz de Cypress
npm run cypress:open

# Ejecutar todas las pruebas E2E en modo headless
npm run cypress:run

# Ejecutar pruebas específicas
npm run test:e2e

# Ejecutar con interfaz visible
npm run test:e2e:headed
```

## 🧪 Pruebas de Integración Implementadas

### **1. Autenticación (`auth.integration.test.js`)**
- ✅ **Flujo completo**: Registro → Login → Verificación en DB
- ✅ **Validaciones**: Usuarios duplicados, credenciales incorrectas
- ✅ **Persistencia**: Datos se mantienen en base de datos
- ✅ **Seguridad**: Contraseñas hasheadas, login con role

### **2. Auditorías (`audits.integration.test.js`)**
- ✅ **CRUD completo**: Crear → Leer → Actualizar → Eliminar
- ✅ **Filtros**: Por tipo, prioridad, auditor, estado
- ✅ **Estadísticas**: Conteos por estado, tipo, prioridad
- ✅ **Validaciones**: Campos requeridos, auditorías inexistentes
- ✅ **Integridad**: Referencias entre usuarios y auditorías

### **3. Flujo Completo (`fullWorkflow.integration.test.js`)**
- ✅ **Workflow real**: Usuario → Auditoría → Gestión completa
- ✅ **Concurrencia**: Múltiples usuarios simultáneos
- ✅ **Manejo de errores**: Recuperación después de fallos
- ✅ **Estados**: Pendiente → En Progreso → Completada → En Revisión

## 🌐 Pruebas End-to-End Implementadas

### **1. Autenticación (`auth.cy.js`)**
- ✅ **Login exitoso**: Formulario → Dashboard → Sesión guardada
- ✅ **Validaciones**: Campos vacíos, email inválido, contraseña corta
- ✅ **Errores**: Credenciales incorrectas, mensajes de error
- ✅ **Logout**: Limpieza de sesión, redirección

### **2. Dashboard (`dashboard.cy.js`)**
- ✅ **Métricas**: Tarjetas de estadísticas, valores numéricos
- ✅ **Gráficos**: Tendencias, visualizaciones
- ✅ **Navegación**: Menú, secciones, rutas
- ✅ **Responsive**: Móvil, tablet, desktop
- ✅ **Acciones rápidas**: Botones, funcionalidades

## 🔧 Configuración Técnica

### **Base de Datos de Prueba**
```javascript
// Configuración automática
mongoUrl: 'mongodb://localhost:27017/audiconflow_integration_test'

// Limpieza antes de cada prueba
beforeEach(async () => {
  await global.testDb.collection('users').deleteMany({});
  await global.testDb.collection('audits').deleteMany({});
});
```

### **Servidor de Prueba**
```javascript
// Puerto separado para pruebas
const BACKEND_PORT = 5001;
const env = {
  NODE_ENV: 'test',
  PORT: BACKEND_PORT,
  MONGODB_URI: MONGO_URL
};
```

### **Comandos Cypress Personalizados**
```javascript
// Login automático
cy.login('email@test.com', 'password123')

// Crear datos de prueba
cy.register({ email, password, role })
cy.createAudit({ name, type, location })

// Utilidades
cy.resetDatabase()
cy.waitForElement('[data-testid="element"]')
```

## 📊 Cobertura de Pruebas

### **Integración**
- ✅ **APIs**: Todos los endpoints principales
- ✅ **Base de datos**: Operaciones CRUD reales
- ✅ **Validaciones**: Reglas de negocio
- ✅ **Estados**: Transiciones de auditorías
- ✅ **Concurrencia**: Operaciones simultáneas

### **End-to-End**
- ✅ **Flujos de usuario**: Login, navegación, acciones
- ✅ **Interfaz**: Formularios, botones, mensajes
- ✅ **Responsive**: Diferentes dispositivos
- ✅ **Errores**: Manejo de fallos en UI

## 🚨 Solución de Problemas

### **Errores Comunes**

1. **"Connection refused" en pruebas de integración**
   ```bash
   # Verificar que MongoDB esté corriendo
   mongod --version
   
   # Verificar que el backend esté en puerto 5000
   curl http://localhost:5000/health
   ```

2. **"Timeout" en pruebas E2E**
   ```bash
   # Verificar que frontend esté corriendo
   curl http://localhost:3000
   
   # Aumentar timeout en cypress.config.js
   defaultCommandTimeout: 15000
   ```

3. **"Database not found"**
   ```bash
   # Crear base de datos de prueba manualmente
   mongo audiconflow_integration_test
   ```

### **Debugging**

```bash
# Ver logs detallados de integración
npm test -- --verbose

# Ejecutar Cypress en modo debug
npm run cypress:open
```

## 📈 Métricas y Reportes

### **Cobertura de Código**
```bash
cd integration-tests
npm run test:coverage
# Genera reporte en coverage/lcov-report/index.html
```

### **Videos y Screenshots (Cypress)**
- Videos automáticos en `cypress/videos/`
- Screenshots de fallos en `cypress/screenshots/`

## 🔄 Integración Continua

### **Scripts de CI/CD**
```yaml
# Ejemplo para GitHub Actions
- name: Run Integration Tests
  run: |
    cd integration-tests
    npm install
    npm test

- name: Run E2E Tests
  run: |
    cd e2e-tests
    npm install
    npm run cypress:run
```

## 🎯 Próximos Pasos

- [ ] **Pruebas de carga**: Rendimiento con múltiples usuarios
- [ ] **Pruebas de seguridad**: Vulnerabilidades, inyecciones
- [ ] **Pruebas de accesibilidad**: WCAG compliance
- [ ] **Pruebas móviles**: Dispositivos reales
- [ ] **Monitoreo**: Alertas automáticas de fallos

---

## 🎉 ¡Las Pruebas de Integración están Listas!

**Comandos rápidos:**
```bash
# Integración
cd integration-tests && npm install && npm test

# E2E
cd e2e-tests && npm install && npm run cypress:run
```

Las pruebas de integración verifican que **todos los componentes trabajen juntos correctamente** en un entorno real, complementando las pruebas unitarias para una cobertura completa del sistema.
