# Flujo Completo de Cruces de Auditoría - AudiconFlow

## 📋 Resumen del Sistema

El sistema de cruces de auditoría permite realizar análisis de coincidencias entre archivos Excel/CSV cargados en diferentes auditorías, guardando los resultados para consulta posterior.

## 🔄 Flujo de Trabajo Completo

### 1. Crear Auditoría
- **Ubicación:** Gestión de Registros de Auditoría → "Crear Nueva Auditoría"
- **Datos requeridos:** Nombre, tipo, ubicación, auditor, fecha límite
- **Resultado:** Se genera un `_id` de MongoDB único para la auditoría

### 2. Subir Archivos
- **Ubicación:** Dentro de la auditoría creada → Sección "Carga y Procesamiento de Archivos"
- **Formatos soportados:** Excel (.xlsx), CSV, PDF
- **Límite:** 50MB por archivo
- **Almacenamiento:** MongoDB GridFS para archivos grandes

### 3. Ejecutar Cruce
- **Método:** Botón "Ejecutar Cruce de Datos" en la sección de archivos
- **Parámetros automáticos:**
  - `auditId`: ID de la auditoría actual
  - `fileIds`: IDs de los archivos subidos
  - `key`: "RUT" (campo clave por defecto)
  - `result`: "Tipo" (campo resultado por defecto)
  - `executedBy`: Usuario actual del localStorage

### 4. Ver Resultados
- **Ubicación:** Gestión de Registros → Botón verde "Ver resultados de cruce guardados"
- **Funcionalidad:** Se abre en nueva pestaña la página `/audit-results/:auditId`
- **Contenido:** Lista de todos los cruces realizados para esa auditoría

## 🛠️ Componentes Técnicos

### Backend (Node.js + MongoDB)

#### Endpoint de Cruce: `/api/cross-check`
```javascript
POST /api/cross-check
Body: {
  auditId: string,
  fileIds: array,
  key: string,
  result: string,
  executedBy: string
}
```

#### Endpoint de Consulta: `/api/cross-results/:auditId`
```javascript
GET /api/cross-results/:auditId
Response: {
  success: boolean,
  data: array,
  pagination: object
}
```

### Frontend (React)

#### Componentes Principales:
- `FileUploadSection.jsx`: Carga de archivos y ejecución de cruces
- `AuditTable.jsx`: Tabla con botón de navegación a resultados
- `AuditResults.jsx`: Página de visualización de resultados

## 🔍 Búsqueda de Cruces

El sistema busca cruces usando múltiples criterios para máxima compatibilidad:

```javascript
const searchQuery = {
  $or: [
    { auditId: auditId },                    // Búsqueda exacta por string
    { auditId: { $regex: auditId, $options: 'i' } }, // Búsqueda por patrón
    { 'executionDetails.auditId': auditId }, // Búsqueda en executionDetails
    { auditId: new mongoose.Types.ObjectId(auditId) } // Búsqueda por ObjectId
  ]
};
```

## 📊 Estructura de Datos

### Modelo CrossResult:
```javascript
{
  auditId: String,           // ID de la auditoría
  crossId: String,           // ID único del cruce
  keyField: String,          // Campo clave usado
  resultField: String,       // Campo resultado usado
  processedFiles: Array,     // Archivos procesados
  results: Array,            // Resultados del cruce
  summary: {
    totalRecords: Number,
    matchingRecords: Number,
    matchPercentage: Number
  },
  executionDetails: {
    executedBy: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    auditId: String          // Duplicado para búsquedas
  },
  status: String,
  createdAt: Date
}
```

## ✅ Verificaciones de Funcionamiento

### 1. Verificar Conexión MongoDB
```bash
node debug-cross-save-simple.js
```

### 2. Verificar Auditorías Existentes
```bash
node test-audit-creation.js
```

### 3. Limpiar Base de Datos (si necesario)
```bash
node clean-database.js
```

## 🚨 Problemas Comunes y Soluciones

### Problema: Cruces no aparecen en resultados
**Causa:** Desajuste entre parámetros frontend-backend
**Solución:** Verificar que FileUploadSection.jsx envíe `fileIds` en lugar de `files`

### Problema: Error de conexión MongoDB
**Causa:** Variable de entorno MONGODB_URI incorrecta
**Solución:** Verificar archivo `.env` en backend

### Problema: Archivos no se procesan
**Causa:** GridFS no configurado correctamente
**Solución:** Verificar configuración de multer y GridFS en upload.js

## 🔧 Mantenimiento

### Logs Importantes:
- Backend: Logs detallados en consola durante ejecución de cruces
- Frontend: Logs en DevTools del navegador para debugging

### Monitoreo:
- Verificar que los cruces se guarden con `auditId` correcto
- Confirmar que la búsqueda encuentre resultados usando múltiples criterios
- Validar que la navegación use el `_id` de MongoDB correctamente

## 📝 Notas de Desarrollo

- Los cruces se guardan SIEMPRE, incluso sin auditId específico (usa ID temporal)
- La búsqueda es flexible para manejar diferentes formatos de ID
- El sistema mantiene audit trail completo de todas las operaciones
- Los resultados se pueden exportar a Excel desde la página de resultados

---

**Última actualización:** 2025-01-08
**Estado:** Sistema completamente funcional después de correcciones de parámetros
