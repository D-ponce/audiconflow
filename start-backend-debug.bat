@echo off
title AudiconFlow Backend Debug
color 0E
echo.
echo ========================================
echo    AUDICONFLOW BACKEND DEBUG
echo ========================================
echo.

cd /d "%~dp0backend"

echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)

echo.
echo Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    npm install
)

echo.
echo Verificando archivo .env...
if not exist .env (
    echo ADVERTENCIA: Archivo .env no encontrado
    echo Creando archivo .env basico...
    echo MONGODB_URI=mongodb://localhost:27017/audiconflow > .env
    echo PORT=5000 >> .env
    echo NODE_ENV=development >> .env
)

echo.
echo Contenido del archivo .env:
type .env
echo.

echo Verificando MongoDB...
echo Intentando conectar a MongoDB...
node -e "
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/audiconflow';
console.log('Conectando a:', uri);
mongoose.connect(uri).then(() => {
  console.log('✅ MongoDB conectado exitosamente');
  mongoose.disconnect();
}).catch(err => {
  console.log('❌ Error conectando a MongoDB:', err.message);
});
"

echo.
echo Iniciando servidor con logs detallados...
echo.
set DEBUG=*
node server.js

pause
