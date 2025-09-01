@echo off
title AudiconFlow - Iniciador Completo
color 0B
echo.
echo ==========================================
echo        AUDICONFLOW - INICIADOR
echo ==========================================
echo.

REM Verificar Node.js
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Descarga desde: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

REM Verificar directorios
echo.
echo [2/4] Verificando estructura del proyecto...
if not exist "backend\server.js" (
    echo ERROR: No se encuentra backend\server.js
    pause
    exit /b 1
)
if not exist "frontend\package.json" (
    echo ERROR: No se encuentra frontend\package.json
    pause
    exit /b 1
)
echo ✓ Estructura del proyecto correcta

REM Iniciar Backend
echo.
echo [3/4] Iniciando Backend (Puerto 5000)...
cd /d "%~dp0backend"
start "AudiconFlow Backend" cmd /k "echo Backend iniciado en puerto 5000 && node server.js"

REM Esperar un momento para que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar Frontend
echo.
echo [4/4] Iniciando Frontend (Puerto 4028)...
cd /d "%~dp0frontend"
start "AudiconFlow Frontend" cmd /k "echo Frontend iniciado en puerto 4028 && npm start"

echo.
echo ==========================================
echo           SERVIDORES INICIADOS
echo ==========================================
echo.
echo ✓ Backend:  http://localhost:5000
echo ✓ Frontend: http://localhost:4028
echo.
echo IMPORTANTE:
echo - Espera 30-60 segundos para que todo cargue
echo - Abre tu navegador en: http://localhost:4028
echo - Para detener: cierra las ventanas de comando
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

REM Abrir navegador automáticamente
start http://localhost:4028

echo.
echo AudiconFlow iniciado correctamente!
echo Mantén esta ventana abierta mientras uses la aplicación.
echo.
pause
