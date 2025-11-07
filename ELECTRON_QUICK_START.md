# 🚀 TecnoLeads - Inicio Rápido con Electron

## ¿Qué prefieres?

### Opción 1: Aplicación de Escritorio (Recomendado para usuarios finales)
```bash
# 1. Instalar dependencias
cd electron
npm install

# 2. Ejecutar en modo desarrollo
npm run dev

# 3. (Opcional) Crear instalador
cd ..
build-electron.bat
```

### Opción 2: Desarrollo Web (Recomendado para desarrolladores)
```bash
# Usar el script automático
start.bat

# O manual:
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 📦 Crear Instalador Profesional

**Doble clic en:** `build-electron.bat`

Esto creará:
- ✅ `TecnoLeads-Setup-1.0.0.exe` - Instalador completo (200MB)
- ✅ `TecnoLeads-Portable-1.0.0.exe` - Versión portable (200MB)

## 🎯 Distribución a Usuarios

### Para usuarios no técnicos:
1. Ejecuta `build-electron.bat`
2. Comparte `electron/dist/TecnoLeads-Setup-1.0.0.exe`
3. El usuario solo hace doble clic e instala
4. ¡Listo! Sin Node.js, sin comandos, sin complicaciones

### Para usuarios técnicos:
1. Comparte el código fuente
2. Ejecutan `npm install` y `start.bat`

## ⚙️ Configuración Inicial

Antes de crear el instalador, configura:

**backend/.env**
```env
MONGODB_URI=tu_url_de_mongodb_atlas
JWT_SECRET=tu_secret_seguro
JWT_REFRESH_SECRET=otro_secret_diferente
ENCRYPTION_KEY=tu_clave_hex_64_caracteres
```

## 📚 Documentación Completa

- **ELECTRON_GUIDE.md** - Guía completa de Electron
- **README.md** - Documentación general
- **INSTALACION_LOCAL.md** - Instalación local sin Electron

---

**Versión Desktop:** 1.0.0  
**Desarrollado por:** Felipe Rodríguez - Tecnophone Colombia SAS
