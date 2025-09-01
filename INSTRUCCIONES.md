# 🚀 Instrucciones para Iniciar AudiconFlow

## Paso 1: Iniciar el Servidor Backend

### Opción A: Script Automático (Recomendado)
1. Navega a: `c:\Users\deniq\Downloads\audiconflow\`
2. Haz **doble clic** en `START_BACKEND.bat`
3. Se abrirá una ventana que iniciará el servidor automáticamente

### Opción B: Terminal Manual
```bash
cd c:\Users\deniq\Downloads\audiconflow\backend
node server.js
```

### ✅ Verificar que el Backend Funciona
Deberías ver estos mensajes:
```
✅ Conectado a MongoDB
🚀 Servidor corriendo en http://localhost:5000
📋 API de auditorías disponible en: http://localhost:5000/api/audits
```

## Paso 2: Iniciar el Frontend

En una **nueva terminal**:
```bash
cd c:\Users\deniq\Downloads\audiconflow\frontend
npm start
```

El frontend se abrirá en: `http://localhost:5173`

## Paso 3: Probar el Sistema

1. Ve a `http://localhost:5173`
2. Haz clic en "Nueva Auditoría"
3. Completa el formulario:
   - **Nombre:** "Mi Primera Auditoría"
   - **Tipo:** Selecciona cualquier tipo
   - **Ubicación:** "Oficina Principal"
   - **Prioridad:** "Media"
   - **Fecha Límite:** Selecciona una fecha futura
   - **Auditor:** Tu nombre
   - **Descripción:** Opcional

4. Haz clic en "Crear Auditoría"
5. Ve a la página "Registros" para ver la auditoría creada

## ⚠️ Solución de Problemas

### Si MongoDB no está instalado:
1. Descarga MongoDB desde: https://www.mongodb.com/try/download/community
2. Instálalo y reinicia el sistema
3. Vuelve a ejecutar el backend

### Si el puerto 5000 está ocupado:
- Cambia el puerto en `backend/.env`: `PORT=5001`
- Actualiza la URL en `frontend/src/services/auditService.js`: `http://localhost:5001`

### Si las auditorías no se guardan:
- Verifica que el backend esté ejecutándose (ventana de terminal abierta)
- Verifica que veas el mensaje "✅ Conectado a MongoDB"
- Revisa la consola del navegador para errores

## 🎯 Funcionalidades Disponibles

- ✅ Crear auditorías con nombre personalizado
- ✅ Ver todas las auditorías en "Registros"
- ✅ Dashboard con métricas en tiempo real
- ✅ Filtros por estado, prioridad, auditor
- ✅ Almacenamiento persistente en MongoDB

¡El sistema está listo para usar!
