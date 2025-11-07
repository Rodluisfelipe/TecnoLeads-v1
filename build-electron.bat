@echo off
echo ========================================
echo    TECNOLEADS - BUILD ELECTRON APP
echo ========================================
echo.
echo Desarrollado por: Felipe Rodriguez
echo Tecnophone Colombia SAS
echo.
echo Este script compilara la aplicacion de escritorio.
echo.
pause

echo.
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado.
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js detectado

echo.
echo [2/5] Instalando dependencias de Electron...
cd electron
call npm install
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)
echo ✓ Dependencias instaladas

echo.
echo [3/5] Construyendo Frontend (React)...
cd ..\frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo el build del frontend
    pause
    exit /b 1
)
echo ✓ Frontend compilado

echo.
echo [4/5] Instalando dependencias del Backend...
cd ..\backend
call npm install --production
if errorlevel 1 (
    echo ERROR: Fallo la instalacion del backend
    pause
    exit /b 1
)
echo ✓ Backend preparado

echo.
echo [5/5] Empaquetando aplicacion Electron...
cd ..\electron
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo el empaquetado
    pause
    exit /b 1
)
echo ✓ Aplicacion empaquetada

cd ..

echo.
echo ========================================
echo    BUILD COMPLETADO!
echo ========================================
echo.
echo El instalador se encuentra en:
echo electron\dist\TecnoLeads-Setup-1.0.0.exe
echo.
echo La version portable se encuentra en:
echo electron\dist\TecnoLeads-Portable-1.0.0.exe
echo.
echo Tamano aproximado: ~150-250 MB
echo.
pause
