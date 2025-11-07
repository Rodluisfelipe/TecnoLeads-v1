# 🖥️ TecnoLeads - Guía de Aplicación de Escritorio (Electron)

## 📦 ¿Qué es esto?

TecnoLeads ahora se puede empaquetar como una **aplicación de escritorio nativa** para Windows usando Electron. Esto significa:

✅ **Doble clic para ejecutar** - Sin comandos en terminal  
✅ **Sin instalar Node.js** - Todo viene incluido  
✅ **MongoDB Atlas en la nube** - Conexión automática  
✅ **Instalador profesional** - Como cualquier programa de Windows  
✅ **Versión portable** - Ejecutable único sin instalación  

## 🚀 Instalación Rápida

### Paso 1: Instalar Dependencias de Electron

```bash
cd electron
npm install
```

### Paso 2: Construir Frontend

```bash
cd frontend
npm run build
```

### Paso 3: Ejecutar en Modo Desarrollo

```bash
# Opción A: Script automático
start-electron-dev.bat

# Opción B: Manual
cd electron
npm run dev
```

## 📦 Crear Instalador (Distribución)

### Opción Automática (Recomendado)

Ejecuta el script:
```bash
build-electron.bat
```

Esto generará:
- `electron/dist/TecnoLeads-Setup-1.0.0.exe` - Instalador completo
- `electron/dist/TecnoLeads-Portable-1.0.0.exe` - Versión portable

### Opción Manual

```bash
# 1. Build del frontend
cd frontend
npm run build

# 2. Instalar dependencias de producción del backend
cd ../backend
npm install --production

# 3. Build de Electron
cd ../electron
npm run build
```

## 📁 Estructura del Proyecto Electron

```
TecnoLeads-v1/
├── electron/                    # Aplicación Electron
│   ├── main.js                 # Proceso principal
│   ├── preload.js              # Bridge seguro
│   ├── package.json            # Config de Electron
│   ├── assets/                 # Iconos
│   │   ├── icon.ico           # Icono Windows
│   │   └── icon.png           # Icono genérico
│   └── dist/                   # Builds generados
│       ├── TecnoLeads-Setup-1.0.0.exe
│       └── TecnoLeads-Portable-1.0.0.exe
│
├── backend/                     # Incluido en el instalador
├── frontend/dist/              # Incluido en el instalador
├── build-electron.bat          # Script de build
└── start-electron-dev.bat      # Desarrollo Electron
```

## 🎯 Arquitectura de la App de Escritorio

```
┌─────────────────────────────────────────┐
│      APLICACIÓN ELECTRON (LOCAL)        │
│                                         │
│  ┌──────────┐        ┌──────────┐     │
│  │ Frontend │ ◄────► │ Backend  │     │
│  │ (React)  │  HTTP  │ (Express)│     │
│  └──────────┘        └──────────┘     │
│       │                    │           │
└───────┼────────────────────┼───────────┘
        │                    │
        │              ┌─────▼──────┐
        │              │  MongoDB   │
        │              │   Atlas    │
        │              │ (Internet) │
        │              └────────────┘
        │
        └────────► Odoo CRM (Internet)
```

## ⚙️ Configuración

### Variables de Entorno

El backend dentro de Electron usa las mismas variables de entorno. Crea un archivo `.env` en `backend/`:

```env
# MongoDB Atlas (tu URL actual)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/tecnoleads

# JWT Secrets
JWT_SECRET=tu_secret_largo_y_seguro_minimo_32_caracteres
JWT_REFRESH_SECRET=otro_secret_diferente_tambien_largo

# Encryption
ENCRYPTION_KEY=tu_clave_hex_de_64_caracteres

# Puerto del backend (Electron lo usa internamente)
PORT=5000
NODE_ENV=production
```

### Generar Secrets Seguros

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🎨 Personalizar Iconos

### Windows (.ico)

1. Crea un icono 256x256 PNG
2. Convierte a .ico usando: https://convertio.co/png-ico/
3. Guarda como `electron/assets/icon.ico`

### Genérico (.png)

1. Crea un icono 512x512 PNG
2. Guarda como `electron/assets/icon.png`

## 📋 Modos de Distribución

### 1. Instalador NSIS (Setup.exe)

**Características:**
- Instalación tradicional en Program Files
- Accesos directos en Escritorio y Menú Inicio
- Desinstalador incluido
- Tamaño: ~150-250 MB

**Uso:**
```bash
TecnoLeads-Setup-1.0.0.exe
```

### 2. Versión Portable (.exe)

**Características:**
- Un solo archivo ejecutable
- No requiere instalación
- Ideal para USB/distribución rápida
- Tamaño: ~150-250 MB

**Uso:**
```bash
TecnoLeads-Portable-1.0.0.exe
```

## 🔧 Desarrollo

### Modo Desarrollo con Hot Reload

```bash
# Terminal 1: Backend con nodemon
cd backend
npm run dev

# Terminal 2: Frontend con Vite
cd frontend
npm run dev

# Terminal 3: Electron
cd electron
npm run dev
```

O usa el script automático:
```bash
start-electron-dev.bat
```

### Debug

En modo desarrollo, la ventana de Electron abre automáticamente DevTools. Puedes:

- **Ver logs del backend:** En la terminal donde corre el backend
- **Ver logs del frontend:** En DevTools (F12)
- **Ver logs de Electron:** En la terminal donde corre Electron

## 🌐 Conexiones de Red

### Qué Necesita Internet

✅ **MongoDB Atlas** - Base de datos en la nube  
✅ **Odoo CRM** - Integración vía XML-RPC  
✅ **Scraping de fechas** - Extracción de licitaciones.info  

### Qué Funciona Offline

✅ **Interfaz de usuario** - Completamente local  
✅ **Servidor backend** - Ejecuta localmente  
✅ **Procesamiento de CSV** - Local  
✅ **Validaciones** - Local  

## 📊 Comparación: Web vs Desktop

| Característica | Versión Web | Versión Desktop |
|----------------|-------------|-----------------|
| **Instalación** | Node.js + Git | Un instalador |
| **Inicio** | 2 terminales | Doble clic |
| **Actualizaciones** | Git pull + npm install | Auto-update* |
| **Distribución** | Código fuente | .exe de 200MB |
| **Usuarios técnicos** | ✅ Ideal | ⚠️ Sobrecargado |
| **Usuarios finales** | ⚠️ Complejo | ✅ Ideal |
| **Tamaño en disco** | ~500MB | ~300MB |

*Auto-update requiere configuración adicional

## 🚀 Distribución a Usuarios Finales

### Opción 1: GitHub Releases

1. Build la aplicación
2. Sube el instalador a GitHub Releases
3. Comparte el link de descarga

### Opción 2: Servidor Propio

1. Sube el instalador a tu servidor
2. Crea una página de descarga
3. Comparte el link

### Opción 3: USB/Red Local

1. Usa la versión portable
2. Copia a USB o red compartida
3. Los usuarios ejecutan directamente

## 🔄 Actualización Automática (Opcional)

Para habilitar auto-actualización desde GitHub:

1. Modifica `electron/main.js` y descomenta código de `electron-updater`
2. Configura GitHub Releases en tu repo
3. Cada nueva versión se descarga automáticamente

## 📝 Checklist de Build

- [ ] Backend `.env` configurado con MongoDB Atlas
- [ ] Frontend construido (`npm run build`)
- [ ] Backend con dependencias de producción
- [ ] Iconos en `electron/assets/`
- [ ] Versión actualizada en `electron/package.json`
- [ ] Ejecutar `build-electron.bat`
- [ ] Probar instalador en máquina limpia
- [ ] Verificar conexión a MongoDB Atlas
- [ ] Verificar conexión a Odoo
- [ ] Probar scraping de fechas

## ❓ Troubleshooting

### Error: "Cannot find module 'electron'"

```bash
cd electron
npm install
```

### Error: "Backend no inicia"

1. Verifica que `backend/.env` exista
2. Verifica la URL de MongoDB Atlas
3. Revisa logs en la consola de Electron

### Error: "Frontend no carga"

1. Verifica que `frontend/dist/` exista
2. Ejecuta `npm run build` en frontend
3. Reconstruye la app de Electron

### Instalador muy grande (>500MB)

Normal. Incluye:
- Node.js runtime (~100MB)
- Chromium (~100MB)
- Tu aplicación (~50-100MB)

### ¿Cómo reducir tamaño?

- Usa `asar` para comprimir archivos
- Elimina dependencias de desarrollo
- Optimiza imágenes/assets

## 🎓 Recursos Adicionales

- [Electron Docs](https://www.electronjs.org/docs)
- [Electron Builder](https://www.electron.build/)
- [Electron Updater](https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater)

## 📞 Soporte

**Desarrollado por:**  
👨‍💻 Felipe Rodríguez  
🔗 GitHub: [@Rodluisfelipe](https://github.com/Rodluisfelipe)

**Empresa:**  
🏢 Tecnophone Colombia SAS  

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025
