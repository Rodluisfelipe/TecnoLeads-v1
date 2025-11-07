@echo off
echo ========================================
echo  TECNOLEADS ELECTRON - PRUEBA RAPIDA
echo ========================================
echo.
echo Este script instalara y probara Electron
echo en modo desarrollo.
echo.
pause

echo.
echo [1/4] Instalando dependencias de Electron...
cd electron
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo ERROR: Fallo la instalacion
        pause
        exit /b 1
    )
)
echo ✓ Dependencias instaladas

echo.
echo [2/4] Verificando Frontend...
cd ..\frontend
if not exist "dist" (
    echo Frontend no compilado. Compilando...
    call npm run build
    if errorlevel 1 (
        echo ERROR: Fallo el build del frontend
        pause
        exit /b 1
    )
)
echo ✓ Frontend listo

echo.
echo [3/4] Verificando Backend...
cd ..\backend
if not exist ".env" (
    echo.
    echo ADVERTENCIA: No se encuentra backend/.env
    echo.
    echo Por favor crea el archivo .env copiando .env.example:
    echo   cd backend
    echo   copy .env.example .env
    echo.
    echo Y configura las variables necesarias.
    echo.
    pause
    exit /b 1
)
echo ✓ Backend verificado

echo.
echo [4/4] Iniciando Electron...
echo.
echo NOTA: La aplicación usará el frontend pre-compilado.
echo Para desarrollo con hot-reload, usa start-electron-dev.bat
echo.
cd ..\electron
npm start

pause
