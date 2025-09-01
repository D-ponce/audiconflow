@echo off
echo ========================================
echo EJECUTANDO PRUEBAS UNITARIAS - AUDICONFLOW
echo ========================================

echo.
echo [1/3] Ejecutando pruebas del BACKEND...
echo ----------------------------------------
cd backend
call npm test -- --verbose --coverage
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Las pruebas del backend fallaron
    pause
    exit /b 1
)

echo.
echo [2/3] Ejecutando pruebas del FRONTEND...
echo ----------------------------------------
cd ..\frontend
call npm test -- --verbose --coverage --watchAll=false
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Las pruebas del frontend fallaron
    pause
    exit /b 1
)

echo.
echo [3/3] Ejecutando pruebas de INTEGRACION...
echo ----------------------------------------
cd ..\integration-tests
call npm test -- --verbose --coverage
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Las pruebas de integración fallaron
    pause
    exit /b 1
)

echo.
echo ========================================
echo TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE
echo ========================================
echo.
echo Reportes de cobertura generados en:
echo - backend/coverage/
echo - frontend/coverage/
echo - integration-tests/coverage/
echo.
pause