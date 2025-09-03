@echo off
echo ========================================
echo    AUDICONFLOW - PRUEBAS UNITARIAS
echo ========================================
echo.

echo [1/3] Ejecutando pruebas del BACKEND...
echo ----------------------------------------
cd backend
call npm test -- --coverage --verbose
if %errorlevel% neq 0 (
    echo ERROR: Falló la ejecución de pruebas del backend
    pause
    exit /b 1
)
echo.

echo [2/3] Ejecutando pruebas del FRONTEND...
echo ----------------------------------------
cd ..\frontend
call npm test -- --coverage --watchAll=false --verbose
if %errorlevel% neq 0 (
    echo ERROR: Falló la ejecución de pruebas del frontend
    pause
    exit /b 1
)
echo.

echo [3/3] Ejecutando pruebas de INTEGRACIÓN...
echo ----------------------------------------
cd ..\integration-tests
call npm test -- --coverage --verbose
if %errorlevel% neq 0 (
    echo ERROR: Falló la ejecución de pruebas de integración
    pause
    exit /b 1
)
echo.

echo ========================================
echo    TODAS LAS PRUEBAS COMPLETADAS ✅
echo ========================================
echo.
echo Reportes de cobertura generados en:
echo - backend/coverage/
echo - frontend/coverage/
echo - integration-tests/coverage/
echo.
pause
