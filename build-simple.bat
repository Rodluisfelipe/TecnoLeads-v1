@echo off
:: ========================================
:: TECNOLEADS - BUILD SIMPLIFICADO
:: ========================================
:: Este script crea una versión portable sin firmar
:: ========================================

echo.
echo ========================================
echo   TECNOLEADS - BUILD SIMPLIFICADO
echo ========================================
echo.

echo Esta es una versión alternativa que NO requiere permisos de administrador.
echo Se creará la carpeta 'win-unpacked' con la aplicación lista para usar.
echo.
pause

echo [1/4] Compilando frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo al compilar frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo    Frontend compilado.
echo.

echo [2/4] Empaquetando aplicación...
cd electron
call npx electron-packager . TecnoLeads --platform=win32 --arch=x64 --out=dist --overwrite --asar --icon=assets/icon.ico --no-prune
if errorlevel 1 (
    echo ERROR: Fallo al empaquetar
    cd ..
    pause
    exit /b 1
)
cd ..
echo    Empaquetado completado.
echo.

echo [3/4] Copiando recursos...
xcopy /E /I /Y "backend" "electron\dist\TecnoLeads-win32-x64\resources\backend"
xcopy /E /I /Y "frontend\dist" "electron\dist\TecnoLeads-win32-x64\resources\frontend\dist"
copy /Y "INSTRUCCIONES_CHROME.md" "electron\dist\TecnoLeads-win32-x64\"
copy /Y "verificar-requisitos.bat" "electron\dist\TecnoLeads-win32-x64\"
echo    Recursos copiados.
echo.

echo [4/4] Creando ZIP portable...
cd electron\dist
powershell Compress-Archive -Path "TecnoLeads-win32-x64" -DestinationPath "TecnoLeads-Portable-v1.0.0.zip" -Force
cd ..\..
echo    ZIP creado.
echo.

echo ========================================
echo   BUILD COMPLETADO!
echo ========================================
echo.
echo Ubicación: electron\dist\TecnoLeads-win32-x64\
echo.
echo Para ejecutar:
echo 1. Ir a: electron\dist\TecnoLeads-win32-x64\
echo 2. Ejecutar: TecnoLeads.exe
echo.
echo Para distribuir:
echo - Comprime la carpeta completa en ZIP
echo - O usa el ZIP ya creado: electron\dist\TecnoLeads-Portable-v1.0.0.zip
echo.
pause
