@echo off
title Backend Manual Start
cd /d "%~dp0backend"

echo Iniciando servidor backend...
echo Puerto: 5000
echo MongoDB: mongodb://127.0.0.1:27017/audiconflow
echo.

node server.js

pause
