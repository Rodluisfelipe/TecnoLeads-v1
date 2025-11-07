@echo off
echo ========================================
echo    TECNOLEADS - INSTALACION LOCAL
echo ========================================
echo.
echo Desarrollado por: Felipe Rodriguez
echo Tecnophone Colombia SAS
echo.
echo Este script instalara todas las dependencias necesarias.
echo.
pause

echo.
echo [1/3] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado.
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js detectado

echo.
echo [2/3] Instalando dependencias del BACKEND...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Fallo la instalacion del backend
    pause
    exit /b 1
)
echo ✓ Backend instalado

echo.
echo [3/3] Instalando dependencias del FRONTEND...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERROR: Fallo la instalacion del frontend
    pause
    exit /b 1
)
echo ✓ Frontend instalado

cd ..

echo.
echo ========================================
echo    INSTALACION COMPLETADA!
echo ========================================
echo.
echo Para iniciar la aplicacion, ejecuta: start.bat
echo.
pause
