@echo off
title AudiconFlow Backend Server
color 0A
echo.
echo ========================================
echo    AUDICONFLOW BACKEND SERVER
echo ========================================
echo.
echo Iniciando servidor...
echo.

cd /d "%~dp0backend"

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

echo Node.js encontrado
echo.
echo Iniciando servidor en puerto 5000...
echo.
echo Para detener el servidor presiona Ctrl+C
echo.

node server.js

echo.
echo Servidor detenido
pause
