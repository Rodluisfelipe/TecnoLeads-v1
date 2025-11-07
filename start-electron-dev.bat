@echo off
echo ========================================
echo    TECNOLEADS - ELECTRON (DEV MODE)
echo ========================================
echo.
echo Desarrollado por: Felipe Rodriguez
echo Tecnophone Colombia SAS
echo.
echo Iniciando en modo desarrollo con HOT RELOAD...
echo.
echo NOTA: Se abrirán 2 ventanas:
echo - Backend (Node.js en puerto 5000)
echo - Frontend (Vite en puerto 5173)
echo.
echo Luego se abrirá Electron conectándose a localhost:5173
echo.
pause

REM Verificar que existe .env
if not exist "backend\.env" (
    echo.
    echo ERROR: No se encuentra backend/.env
    echo.
    echo Por favor crea el archivo .env:
    echo   cd backend
    echo   copy .env.example .env
    echo.
    echo Y configura MONGODB_URI, JWT_SECRET y ENCRYPTION_KEY
    pause
    exit /b 1
)

REM Iniciar Backend en una nueva ventana
start "TecnoLeads Backend (Puerto 5000)" cmd /k "cd backend && npm run dev"

REM Esperar a que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar Frontend en una nueva ventana
start "TecnoLeads Frontend (Puerto 5173)" cmd /k "cd frontend && npm run dev"

REM Esperar a que el frontend compile
echo.
echo Esperando a que el frontend compile...
timeout /t 8 /nobreak >nul

REM Iniciar Electron
echo.
echo Iniciando Electron...
echo.
cd electron
set NODE_ENV=development
npm start

pause
