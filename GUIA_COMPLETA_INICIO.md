# 🚀 Guía Completa de Inicio - AudiconFlow

## 📋 **Pasos para Iniciar AudiconFlow**

### **1. Verificar MongoDB**
```bash
# Ejecutar verificación automática
VERIFICAR_MONGODB.bat
```

**Si MongoDB no está instalado:**
- **Opción A**: Instalar MongoDB Community desde https://www.mongodb.com/try/download/community
- **Opción B**: Usar MongoDB Atlas (recomendado para desarrollo)
- **Opción C**: Docker: `docker run -d -p 27017:27017 mongo`

### **2. Iniciar AudiconFlow**
```bash
# Ejecutar iniciador automático
INICIAR_AUDICONFLOW.bat
```

Este script:
- ✅ Verifica Node.js
- ✅ Inicia Backend (puerto 5000)
- ✅ Inicia Frontend (puerto 4028)
- ✅ Abre navegador automáticamente

### **3. Acceder a la Aplicación**
- **URL**: http://localhost:4028
- **Esperar**: 30-60 segundos para carga completa
- **Login**: Usar credenciales existentes o crear usuario

## 🔧 **Configuración de MongoDB Atlas (Si es necesario)**

### **Paso 1: Crear Cuenta**
1. Ir a https://cloud.mongodb.com
2. Crear cuenta gratuita
3. Crear cluster gratuito (M0)

### **Paso 2: Obtener String de Conexión**
1. En Atlas → Connect → Connect your application
2. Copiar string de conexión
3. Reemplazar `<password>` con tu contraseña

### **Paso 3: Actualizar Configuración**
Editar `backend\.env`:
```env
PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/audiconflow
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/audiconflow
```

## 📊 **Funcionalidades Disponibles**

### **Guardado de Resultados de Cruce**
- ✅ **Automático**: Se guarda al mostrar resultados
- ✅ **Vinculado**: A la auditoría correspondiente
- ✅ **Completo**: Metadatos, estadísticas, archivos
- ✅ **Persistente**: Disponible para consultas futuras

### **APIs Implementadas**
- `POST /api/cross-results` - Guardar resultado
- `GET /api/cross-results/:auditId` - Obtener por auditoría
- `GET /api/cross-results/detail/:crossId` - Detalle específico
- `GET /api/cross-results/stats/:auditId` - Estadísticas

## 🚨 **Solución de Problemas**

### **Error: No se puede conectar a MongoDB**
1. Ejecutar `VERIFICAR_MONGODB.bat`
2. Si no está instalado, usar MongoDB Atlas
3. Verificar string de conexión en `.env`

### **Error: Puerto ocupado**
```bash
# Verificar puertos ocupados
netstat -ano | findstr :4028
netstat -ano | findstr :5000

# Terminar procesos si es necesario
taskkill /PID [número_proceso] /F
```

### **Error: Node.js no encontrado**
1. Descargar desde https://nodejs.org
2. Instalar versión LTS
3. Reiniciar terminal

## 📈 **Verificación de Funcionamiento**

### **Backend Correcto**
```
✅ Conectado a MongoDB
🚀 Servidor corriendo en http://localhost:5000
📋 API de auditorías disponible
```

### **Frontend Correcto**
```
✅ Vite server running
✅ Local: http://localhost:4028
✅ Ready in [tiempo]ms
```

### **Aplicación Funcionando**
- ✅ Página de login carga
- ✅ Dashboard accesible
- ✅ Funcionalidades de auditoría operativas
- ✅ Cruce de información funcional

## 🎯 **Próximos Pasos**

1. **Probar funcionalidad de cruce**
2. **Verificar guardado automático**
3. **Consultar resultados guardados**
4. **Explorar todas las funcionalidades**

---

**¡AudiconFlow está listo para usar con todas las funcionalidades implementadas!** 🎉
