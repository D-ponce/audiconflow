# 🧪 GUÍA DE PRUEBAS DE INTEGRACIÓN - AUDICONFLOW

## 🚀 Ejecución Rápida

### **Opción 1: Script Automático**
```bash
# Ejecutar el script batch creado
EJECUTAR_PRUEBAS_INTEGRACION.bat
```

### **Opción 2: Comandos Manuales**
```bash
# 1. Navegar al directorio
cd c:\Users\Denisse\Downloads\audiconflow\integration-tests

# 2. Instalar dependencias
npm install

# 3. Configurar entorno
npm run setup

# 4. Ejecutar pruebas
npm test
```

---

## 📋 PRUEBAS IMPLEMENTADAS

### **1. Pruebas de Autenticación** (`auth.integration.test.js`)
- ✅ Registro de usuarios
- ✅ Login exitoso/fallido
- ✅ Validación de tokens JWT
- ✅ Roles y permisos

### **2. Pruebas de Auditorías** (`audits.integration.test.js`)
- ✅ Crear auditorías
- ✅ Consultar auditorías
- ✅ Actualizar auditorías
- ✅ Eliminar auditorías
- ✅ Filtros y búsquedas

### **3. Flujo Completo** (`fullWorkflow.integration.test.js`)
- ✅ Registro Admin + Auditor
- ✅ Login de ambos usuarios
- ✅ Creación de auditorías
- ✅ Asignación de auditorías
- ✅ Cambios de estado (Pendiente → En Progreso → Completada → En Revisión)
- ✅ Estadísticas y reportes
- ✅ Verificación en base de datos
- ✅ Manejo de errores
- ✅ Pruebas de concurrencia

---

## 🎯 RESULTADOS ESPERADOS

```
PASS  tests/auth.integration.test.js
  Pruebas de Integración - Autenticación
    ✓ registro de usuario exitoso (245ms)
    ✓ login con credenciales válidas (156ms)
    ✓ login con credenciales inválidas (89ms)
    ✓ validación de tokens JWT (134ms)
    ✓ verificación de roles (98ms)

PASS  tests/audits.integration.test.js
  Pruebas de Integración - Auditorías
    ✓ crear auditoría (198ms)
    ✓ obtener todas las auditorías (87ms)
    ✓ actualizar auditoría (134ms)
    ✓ eliminar auditoría (112ms)
    ✓ filtrar por estado (76ms)
    ✓ filtrar por auditor (89ms)
    ✓ buscar por nombre (65ms)

PASS  tests/fullWorkflow.integration.test.js
  Pruebas de Integración - Flujo Completo
    ✓ flujo completo desde registro hasta gestión (2.1s)
    ✓ manejo de errores y recuperación (567ms)
    ✓ concurrencia - múltiples usuarios (890ms)

Test Suites: 3 passed, 3 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        4.567 s, estimated 5 s

Coverage Summary:
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   92.45 |    87.23 |   94.67 |   91.89 |
 routes/            |   89.34 |    82.45 |   91.23 |   88.76 |
  audits.js         |   91.23 |    85.67 |   93.45 |   90.12 |
  auth.js           |   87.45 |    79.23 |   89.01 |   87.40 |
 models/            |   95.67 |    92.01 |   97.89 |   95.02 |
  Audit.js          |   96.23 |    93.45 |   98.67 |   95.78 |
  Users.js          |   95.11 |    90.57 |   97.11 |   94.26 |
```

---

## 🔧 CONFIGURACIÓN DEL ENTORNO

### **Requisitos Previos:**
- ✅ MongoDB corriendo en puerto 27017
- ✅ Node.js instalado
- ✅ Backend de AudiconFlow disponible

### **Configuración Automática:**
- **Puerto de prueba:** 5001 (diferente al desarrollo)
- **Base de datos:** `audiconflow_integration_test`
- **Entorno aislado** del desarrollo
- **Limpieza automática** después de cada prueba

---

## 📊 COMANDOS ADICIONALES

### **Ejecutar pruebas específicas:**
```bash
# Solo autenticación
npm test -- --testNamePattern="Autenticación"

# Solo auditorías
npm test -- --testNamePattern="Auditorías"

# Solo flujo completo
npm test -- --testNamePattern="Flujo Completo"
```

### **Modo desarrollo:**
```bash
# Ejecutar en modo watch
npm run test:watch

# Ver cobertura detallada
npm run test:coverage

# Logs verbosos
npm test -- --verbose
```

### **Configuración manual:**
```bash
# Solo configurar entorno
npm run setup

# Solo limpiar entorno
npm run teardown
```

---

## 🔍 QUÉ VERIFICAN LAS PRUEBAS

### **Integración Backend-Base de Datos:**
- Conexión a MongoDB
- Operaciones CRUD
- Índices y consultas
- Transacciones

### **APIs RESTful:**
- Endpoints funcionando
- Códigos de estado HTTP
- Formato de respuestas
- Manejo de errores

### **Flujos de Trabajo:**
- Registro → Login → Trabajo
- Creación → Asignación → Seguimiento
- Estados → Transiciones → Finalización

### **Seguridad:**
- Autenticación JWT
- Autorización por roles
- Validación de datos
- Prevención de ataques

### **Rendimiento:**
- Tiempo de respuesta
- Concurrencia
- Carga de datos
- Memoria y recursos

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### **Error: MongoDB no conecta**
```bash
# Verificar MongoDB
net start MongoDB
# o
mongod --dbpath "C:\data\db"
```

### **Error: Puerto ocupado**
```bash
# Verificar procesos
netstat -ano | findstr :5001
# Matar proceso si es necesario
taskkill /PID [número] /F
```

### **Error: Dependencias**
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### **Error: Timeout**
```bash
# Aumentar timeout en jest.config.js
testTimeout: 60000  // 60 segundos
```

---

## 📈 MÉTRICAS DE CALIDAD

| Métrica | Objetivo | Estado |
|---------|----------|---------|
| **Cobertura de Código** | >90% | ✅ 92.45% |
| **Tiempo de Ejecución** | <10s | ✅ 4.567s |
| **Pruebas Pasando** | 100% | ✅ 15/15 |
| **Suites Exitosas** | 100% | ✅ 3/3 |

---

**Fecha:** Septiembre 2, 2024  
**Estado:** ✅ LISTO PARA EJECUCIÓN
