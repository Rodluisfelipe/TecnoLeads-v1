@echo off
:: ========================================
:: TECNOLEADS - BUILD PARA PRODUCCIÓN
:: ========================================
:: Este script prepara y construye la aplicación
:: para distribución en producción
:: ========================================

echo.
echo ========================================
echo   TECNOLEADS - BUILD DE PRODUCCIÓN
echo ========================================
echo.

:: Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ERROR: Ejecuta este script desde la raíz del proyecto
    pause
    exit /b 1
)

echo [1/7] Limpiando compilaciones anteriores...
if exist "electron\dist\" rmdir /s /q "electron\dist"
if exist "frontend\dist\" rmdir /s /q "frontend\dist"
echo    Limpieza completada.
echo.

echo [2/7] Instalando dependencias del frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Fallo al instalar dependencias del frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo    Dependencias instaladas.
echo.

echo [3/7] Compilando frontend de React...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo al compilar frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo    Frontend compilado correctamente.
echo.

echo [4/7] Verificando compilación del frontend...
if not exist "frontend\dist\index.html" (
    echo ERROR: No se encontró frontend\dist\index.html
    pause
    exit /b 1
)
echo    Verificación completada.
echo.

echo [5/7] Instalando dependencias del backend...
cd backend
call npm install --production
if errorlevel 1 (
    echo ERROR: Fallo al instalar dependencias del backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo    Dependencias instaladas.
echo.

echo [6/7] Instalando dependencias de Electron...
cd electron
call npm install
if errorlevel 1 (
    echo ERROR: Fallo al instalar dependencias de Electron
    cd ..
    pause
    exit /b 1
)
echo    Dependencias instaladas.
echo.

echo [7/7] Construyendo aplicación de Electron...
echo    Esto puede tomar varios minutos...
echo    Se creará un instalador y versión portable.
echo.
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo al construir aplicación de Electron
    cd ..
    pause
    exit /b 1
)
cd ..
echo    Construcción completada.
echo.

echo ========================================
echo   BUILD COMPLETADO EXITOSAMENTE!
echo ========================================
echo.
echo Archivos generados en: electron\dist\
echo.
echo Instalador: TecnoLeads-Setup-1.0.0.exe
echo Portable:   TecnoLeads-Portable-1.0.0.exe
echo.
echo Tamaño aproximado: ~300-400 MB
echo (Incluye Node.js, Chromium, y todas las dependencias)
echo.
echo ========================================
echo   SIGUIENTE PASO:
echo ========================================
echo 1. Prueba el instalador en una máquina limpia
echo 2. Verifica que se conecta a MongoDB Atlas
echo 3. Prueba importar un archivo CSV
echo 4. Distribuye a tus usuarios
echo.
pause
