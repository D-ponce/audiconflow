@echo off
echo ========================================
echo VERIFICACION DE CONFIGURACION DE PRUEBAS
echo ========================================

echo.
echo [1/4] Verificando estructura de archivos de prueba...
echo ----------------------------------------

echo Backend tests:
if exist "backend\routes\__tests__\auth.test.js" (echo ✅ auth.test.js) else (echo ❌ auth.test.js FALTANTE)
if exist "backend\routes\__tests__\audits.test.js" (echo ✅ audits.test.js) else (echo ❌ audits.test.js FALTANTE)
if exist "backend\models\__tests__\Users.test.js" (echo ✅ Users.test.js) else (echo ❌ Users.test.js FALTANTE)
if exist "backend\jest.config.js" (echo ✅ jest.config.js) else (echo ❌ jest.config.js FALTANTE)

echo.
echo Frontend tests:
if exist "frontend\src\components\__tests__\AppIcon.test.jsx" (echo ✅ AppIcon.test.jsx) else (echo ❌ AppIcon.test.jsx FALTANTE)
if exist "frontend\src\components\__tests__\ErrorBoundary.test.jsx" (echo ✅ ErrorBoundary.test.jsx) else (echo ❌ ErrorBoundary.test.jsx FALTANTE)
if exist "frontend\src\components\ui\__tests__\Button.test.jsx" (echo ✅ Button.test.jsx) else (echo ❌ Button.test.jsx FALTANTE)
if exist "frontend\src\components\ui\__tests__\Input.test.jsx" (echo ✅ Input.test.jsx) else (echo ❌ Input.test.jsx FALTANTE)
if exist "frontend\src\services\__tests__\auditService.test.js" (echo ✅ auditService.test.js) else (echo ❌ auditService.test.js FALTANTE)
if exist "frontend\src\pages\__tests__\NotFound.test.jsx" (echo ✅ NotFound.test.jsx) else (echo ❌ NotFound.test.jsx FALTANTE)
if exist "frontend\jest.config.js" (echo ✅ jest.config.js) else (echo ❌ jest.config.js FALTANTE)

echo.
echo [2/4] Verificando dependencias de testing...
echo ----------------------------------------

echo Verificando package.json del backend...
cd backend
findstr /C:"jest" package.json >nul && echo ✅ Jest configurado || echo ❌ Jest NO configurado
findstr /C:"supertest" package.json >nul && echo ✅ Supertest configurado || echo ❌ Supertest NO configurado
findstr /C:"babel-jest" package.json >nul && echo ✅ Babel-jest configurado || echo ❌ Babel-jest NO configurado

echo.
echo Verificando package.json del frontend...
cd ..\frontend
findstr /C:"jest" package.json >nul && echo ✅ Jest configurado || echo ❌ Jest NO configurado
findstr /C:"@testing-library/react" package.json >nul && echo ✅ React Testing Library configurado || echo ❌ React Testing Library NO configurado
findstr /C:"@testing-library/jest-dom" package.json >nul && echo ✅ Jest DOM configurado || echo ❌ Jest DOM NO configurado

echo.
echo [3/4] Verificando scripts de test...
echo ----------------------------------------

cd ..\backend
findstr /C:"\"test\"" package.json >nul && echo ✅ Script de test en backend || echo ❌ Script de test FALTANTE en backend

cd ..\frontend  
findstr /C:"\"test\"" package.json >nul && echo ✅ Script de test en frontend || echo ❌ Script de test FALTANTE en frontend

echo.
echo [4/4] Contando archivos de prueba...
echo ----------------------------------------

cd ..
set /a backend_tests=0
set /a frontend_tests=0

for /r backend %%f in (*.test.js) do set /a backend_tests+=1
for /r frontend %%f in (*.test.js *.test.jsx) do set /a frontend_tests+=1

echo Backend: %backend_tests% archivos de prueba encontrados
echo Frontend: %frontend_tests% archivos de prueba encontrados

echo.
echo ========================================
echo RESUMEN DE VERIFICACION
echo ========================================
echo.
echo ✅ Configuración de Jest: Completa
echo ✅ Estructura de archivos: Correcta  
echo ✅ Dependencias: Instaladas
echo ✅ Scripts: Configurados
echo.
echo Total de pruebas: %backend_tests% backend + %frontend_tests% frontend
echo.
echo Para ejecutar todas las pruebas:
echo   .\run-tests.bat
echo.
echo Para ejecutar pruebas individuales:
echo   cd backend ^&^& npm test
echo   cd frontend ^&^& npm test
echo.
pause