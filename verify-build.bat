@echo off
echo ========================================
echo  VERIFICADOR PRE-BUILD - ELECTRON
echo ========================================
echo.
echo Este script verifica que todo este listo
echo para compilar el instalador de Electron.
echo.
pause

set ERRORS=0

echo.
echo [1/8] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no esta instalado
    set /a ERRORS+=1
) else (
    echo ✓ Node.js instalado
)

echo.
echo [2/8] Verificando backend/.env...
if exist "backend\.env" (
    echo ✓ Archivo .env existe
    
    REM Verificar que no tenga valores de ejemplo
    findstr /C:"your-super-secret" backend\.env >nul
    if not errorlevel 1 (
        echo ⚠️  ADVERTENCIA: .env contiene valores de ejemplo
        echo    Por favor genera secrets reales
        set /a ERRORS+=1
    ) else (
        echo ✓ .env parece configurado
    )
) else (
    echo ❌ ERROR: backend/.env no existe
    echo    Crea el archivo desde .env.example
    set /a ERRORS+=1
)

echo.
echo [3/8] Verificando dependencias de Electron...
if exist "electron\node_modules" (
    echo ✓ Dependencias de Electron instaladas
) else (
    echo ⚠️  ADVERTENCIA: Dependencias de Electron no instaladas
    echo    Se instalaran durante el build
)

echo.
echo [4/8] Verificando dependencias del Frontend...
if exist "frontend\node_modules" (
    echo ✓ Dependencias de Frontend instaladas
) else (
    echo ❌ ERROR: Dependencias de Frontend no instaladas
    echo    Ejecuta: cd frontend ^&^& npm install
    set /a ERRORS+=1
)

echo.
echo [5/8] Verificando dependencias del Backend...
if exist "backend\node_modules" (
    echo ✓ Dependencias de Backend instaladas
) else (
    echo ❌ ERROR: Dependencias de Backend no instaladas
    echo    Ejecuta: cd backend ^&^& npm install
    set /a ERRORS+=1
)

echo.
echo [6/8] Verificando build del Frontend...
if exist "frontend\dist" (
    echo ✓ Frontend compilado (dist existe)
) else (
    echo ⚠️  ADVERTENCIA: Frontend no compilado
    echo    Se compilara durante el build
)

echo.
echo [7/8] Verificando iconos...
if exist "electron\assets\icon.ico" (
    echo ✓ Icono Windows (.ico) encontrado
) else (
    echo ⚠️  ADVERTENCIA: electron/assets/icon.ico no existe
    echo    Se usara un icono por defecto
)

if exist "electron\assets\icon.png" (
    echo ✓ Icono generico (.png) encontrado
) else (
    echo ⚠️  ADVERTENCIA: electron/assets/icon.png no existe
    echo    Se usara un icono por defecto
)

echo.
echo [8/8] Verificando espacio en disco...
for /f "tokens=3" %%a in ('dir /-c "%CD%" ^| find "bytes free"') do set FREE_SPACE=%%a
if %FREE_SPACE% LSS 2000000000 (
    echo ⚠️  ADVERTENCIA: Poco espacio en disco (^<2GB)
    echo    Se recomienda tener al menos 2GB libres
) else (
    echo ✓ Espacio en disco suficiente
)

echo.
echo ========================================
echo  RESUMEN DE VERIFICACION
echo ========================================
echo.

if %ERRORS% EQU 0 (
    echo ✅ TODO LISTO PARA COMPILAR
    echo.
    echo Puedes ejecutar:
    echo   build-electron.bat
    echo.
    echo O manualmente:
    echo   cd frontend
    echo   npm run build
    echo   cd ..\backend
    echo   npm install --production
    echo   cd ..\electron
    echo   npm install
    echo   npm run build
) else (
    echo ❌ HAY %ERRORS% ERRORES QUE CORREGIR
    echo.
    echo Por favor revisa los errores arriba
    echo y corrigelos antes de compilar.
)

echo.
echo ========================================
echo  CHECKLIST MANUAL
echo ========================================
echo.
echo Verifica manualmente:
echo.
echo [ ] MongoDB Atlas URL configurada en .env
echo [ ] JWT_SECRET generado (32+ caracteres)
echo [ ] ENCRYPTION_KEY generado (64 caracteres hex)
echo [ ] MongoDB Atlas permite conexiones (0.0.0.0/0)
echo [ ] Credenciales de Odoo para prueba
echo [ ] Iconos personalizados (opcional)
echo [ ] Version actualizada en electron/package.json
echo.

pause
