@echo off
echo 🚀 Iniciando migración de contraseñas...
echo.

REM Verificar si el servidor está corriendo
echo 🔍 Verificando estado del servidor...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/check-passwords' -Method Get -TimeoutSec 5; Write-Host '✅ Servidor corriendo'; $response | ConvertTo-Json -Depth 10 } catch { Write-Host '❌ Servidor no disponible. Iniciando servidor...'; exit 1 }"

if %errorlevel% neq 0 (
    echo.
    echo 🔄 Iniciando servidor backend...
    start /B node server.js
    timeout /t 5 /nobreak >nul
    echo ⏳ Esperando que el servidor se inicie...
    timeout /t 3 /nobreak >nul
)

echo.
echo 🔍 Verificando contraseñas actuales...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/check-passwords' -Method Get; Write-Host '📊 Estado actual:'; Write-Host ('Total usuarios: ' + $response.summary.totalUsers); Write-Host ('Contraseñas cifradas: ' + $response.summary.hashedPasswords); Write-Host ('Contraseñas sin cifrar: ' + $response.summary.plainPasswords) } catch { Write-Host '❌ Error verificando contraseñas' }"

echo.
echo 🔐 Ejecutando migración de contraseñas...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/migrate-passwords' -Method Post; Write-Host '✅ Migración completada:'; Write-Host ('Contraseñas migradas: ' + $response.summary.migratedCount); Write-Host ('Ya estaban cifradas: ' + $response.summary.alreadyHashedCount); Write-Host ('Total procesados: ' + $response.summary.totalUsers) } catch { Write-Host '❌ Error durante la migración'; Write-Host $_.Exception.Message }"

echo.
echo 🔍 Verificando resultado final...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:5000/api/check-passwords' -Method Get; Write-Host '📊 Estado final:'; Write-Host ('Total usuarios: ' + $response.summary.totalUsers); Write-Host ('Contraseñas cifradas: ' + $response.summary.hashedPasswords); Write-Host ('Contraseñas sin cifrar: ' + $response.summary.plainPasswords); if ($response.summary.plainPasswords -eq 0) { Write-Host '🎉 ¡Todas las contraseñas están cifradas!' } } catch { Write-Host '❌ Error verificando resultado final' }"

echo.
echo 🏁 Proceso completado.
pause
