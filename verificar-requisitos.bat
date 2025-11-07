@echo off
:: ========================================
:: TECNOLEADS - VERIFICADOR DE REQUISITOS
:: ========================================

echo.
echo ========================================
echo   TECNOLEADS - VERIFICADOR
echo ========================================
echo.
echo Verificando requisitos del sistema...
echo.

:: Verificar Node.js
echo [1/2] Verificando Node.js...
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo    [OK] Node.js instalado
    node --version
) else (
    echo    [ERROR] Node.js NO encontrado
    echo.
    echo    Por favor, descargue e instale Node.js desde:
    echo    https://nodejs.org/
    echo.
    set MISSING=1
)
echo.

:: Verificar Chrome
echo [2/2] Verificando Google Chrome...
set CHROME_FOUND=0

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo    [OK] Chrome encontrado en: C:\Program Files\Google\Chrome\Application\chrome.exe
    set CHROME_FOUND=1
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    echo    [OK] Chrome encontrado en: C:\Program Files (x86^)\Google\Chrome\Application\chrome.exe
    set CHROME_FOUND=1
)

if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    echo    [OK] Chrome encontrado en: %LOCALAPPDATA%\Google\Chrome\Application\chrome.exe
    set CHROME_FOUND=1
)

if %CHROME_FOUND% equ 0 (
    echo    [ADVERTENCIA] Chrome NO encontrado en rutas comunes
    echo.
    echo    La extraccion automatica de fechas NO funcionara.
    echo    Descargue Chrome desde: https://www.google.com/chrome/
    echo.
    echo    Nota: Puede usar TecnoLeads sin Chrome, pero debera
    echo    ingresar las fechas manualmente en Odoo.
    echo.
)
echo.

:: Resumen
echo ========================================
echo   RESUMEN
echo ========================================
echo.

if defined MISSING (
    echo [!] ATENCION: Faltan requisitos obligatorios
    echo     Instale Node.js antes de ejecutar TecnoLeads
    echo.
) else (
    if %CHROME_FOUND% equ 1 (
        echo [OK] Todos los requisitos estan instalados
        echo     TecnoLeads esta listo para ejecutarse
    ) else (
        echo [OK] Requisitos minimos instalados
        echo [!] Chrome no encontrado - las fechas no se extraeran automaticamente
    )
    echo.
)

echo.
pause
