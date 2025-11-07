# 🚀 TecnoLeads - Inicio Inmediato

## ¿Qué quieres hacer?

### 👨‍💼 Soy Usuario Final (No técnico)
```
Descarga: TecnoLeads-Setup-1.0.0.exe
Doble clic → Instalar → Listo
```
📥 [Descargar instalador](#)

### 👨‍💻 Soy Desarrollador (Quiero probarlo)
```bash
# Opción 1: Aplicación de Escritorio
test-electron.bat

# Opción 2: Versión Web
start.bat
```

### 🏢 Quiero Distribuir a mi Empresa
```bash
# 1. Configura backend/.env
# 2. Ejecuta:
build-electron.bat

# 3. Comparte:
electron/dist/TecnoLeads-Setup-1.0.0.exe
```

---

## 📚 Documentación

### Inicio Rápido
- **[INICIO_RAPIDO_ELECTRON.md](./INICIO_RAPIDO_ELECTRON.md)** ← Empieza aquí
- **[ELECTRON_QUICK_START.md](./ELECTRON_QUICK_START.md)** - Guía condensada

### Configuración
- **[ENV_CONFIG_ELECTRON.md](./ENV_CONFIG_ELECTRON.md)** - Variables de entorno
- **[BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md)** - Lista de verificación

### Completa
- **[ELECTRON_GUIDE.md](./ELECTRON_GUIDE.md)** - Guía detallada
- **[README.md](./README.md)** - Documentación general

---

## 🎯 Scripts Disponibles

### Desarrollo
- `test-electron.bat` - Probar app de escritorio
- `start.bat` - Versión web en navegador
- `start-electron-dev.bat` - Desarrollo avanzado

### Producción
- `build-electron.bat` - Crear instalador .exe
- `verify-build.bat` - Verificar antes de compilar

### Setup
- `setup.bat` - Instalar dependencias web
- `npm run install:all` - Instalar todo

---

## ⚡ FAQ

**¿Qué es mejor, web o desktop?**
- Desktop → Usuarios finales, fácil distribución
- Web → Desarrolladores, fácil actualización

**¿Requiere internet?**
- Solo para MongoDB Atlas y Odoo CRM
- Procesamiento de CSV es local

**¿Tamaño del instalador?**
- ~200-250 MB (incluye todo)

**¿Compatible con qué sistemas?**
- Windows 7, 8, 10, 11 (64-bit)

---

**Desarrollado por:** Felipe Rodríguez - Tecnophone Colombia SAS  
**Versión:** 1.0.0
