@echo off
echo Iniciando servidor backend de AudiconFlow...
echo.
echo Verificando MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB no está instalado o no está en el PATH
    echo Por favor instala MongoDB y asegúrate de que esté en el PATH
    pause
    exit /b 1
)

echo ✅ MongoDB encontrado
echo.
echo Iniciando MongoDB...
start "MongoDB" mongod

echo Esperando 3 segundos para que MongoDB inicie...
timeout /t 3 /nobreak >nul

echo.
echo Iniciando servidor Node.js...
node server.js

pause
