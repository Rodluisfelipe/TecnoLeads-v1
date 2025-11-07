@echo off
echo ========================================
echo    TECNOLEADS - INICIO DE SERVICIOS
echo ========================================
echo.
echo Desarrollado por: Felipe Rodriguez
echo Tecnophone Colombia SAS
echo.
echo Iniciando Backend y Frontend...
echo.

REM Iniciar Backend en una nueva ventana
start "TecnoLeads - Backend (Puerto 5000)" cmd /k "cd backend && npm run dev"

REM Esperar 3 segundos para que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar Frontend en una nueva ventana
start "TecnoLeads - Frontend (Puerto 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo    SERVICIOS INICIADOS!
echo ========================================
echo.
echo Backend:  http://localhost:5000/api
echo Frontend: http://localhost:5173
echo.
echo Se han abierto dos ventanas de terminal:
echo - Backend (servidor Node.js)
echo - Frontend (servidor Vite)
echo.
echo Para detener los servicios:
echo 1. Ve a cada ventana
echo 2. Presiona Ctrl+C
echo.
echo La aplicacion se abrira automaticamente en tu navegador...
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo.
pause
