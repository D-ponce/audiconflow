@echo off
title Verificar MongoDB - AudiconFlow
color 0E
echo.
echo ==========================================
echo      VERIFICACION DE MONGODB
echo ==========================================
echo.

echo [1/3] Verificando si MongoDB esta instalado...
where mongod >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MongoDB encontrado en el sistema
    echo.
    echo [2/3] Intentando iniciar MongoDB...
    net start MongoDB >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ MongoDB iniciado como servicio
    ) else (
        echo ! Iniciando MongoDB manualmente...
        start "MongoDB" mongod --dbpath "C:\data\db"
        timeout /t 3 /nobreak >nul
    )
    
    echo.
    echo [3/3] Probando conexion...
    node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://127.0.0.1:27017/audiconflow').then(() => { console.log('✓ Conexion exitosa a MongoDB'); process.exit(0); }).catch(err => { console.log('✗ Error de conexion:', err.message); process.exit(1); });" 2>nul
    
) else (
    echo ✗ MongoDB NO esta instalado
    echo.
    echo OPCIONES:
    echo 1. Instalar MongoDB Community: https://www.mongodb.com/try/download/community
    echo 2. Usar MongoDB Atlas (en la nube)
    echo 3. Usar Docker: docker run -d -p 27017:27017 mongo
    echo.
    echo Para usar MongoDB Atlas:
    echo 1. Crea cuenta en https://cloud.mongodb.com
    echo 2. Crea cluster gratuito
    echo 3. Obtén string de conexión
    echo 4. Actualiza MONGO_URI en backend\.env
)

echo.
echo ==========================================
pause
