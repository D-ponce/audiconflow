@echo off
echo ==========================================
echo    PRUEBAS DE INTEGRACION - AUDICONFLOW
echo ==========================================
echo.

echo [1/4] Verificando MongoDB...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo MongoDB no esta corriendo. Iniciando...
    net start MongoDB
)

echo [2/4] Instalando dependencias...
cd /d "c:\Users\Denisse\Downloads\audiconflow\integration-tests"
call npm install

echo [3/4] Configurando entorno de prueba...
call npm run setup

echo [4/4] Ejecutando pruebas de integracion...
call npm test

echo.
echo ==========================================
echo    PRUEBAS COMPLETADAS
echo ==========================================
pause
