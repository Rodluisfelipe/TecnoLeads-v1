# TecnoLeads - Electron Desktop App

Esta carpeta contiene la configuración de Electron para empaquetar TecnoLeads como aplicación de escritorio.

## 🚀 Inicio Rápido

### Desarrollo
```bash
npm install
npm run dev
```

### Build (Crear Instalador)
```bash
npm run build
```

El instalador se generará en `dist/`:
- `TecnoLeads-Setup-1.0.0.exe` - Instalador NSIS
- `TecnoLeads-Portable-1.0.0.exe` - Versión portable

## 📋 Requisitos Previos

Antes de hacer build, asegúrate de:

1. ✅ Frontend construido: `cd ../frontend && npm run build`
2. ✅ Backend con dependencias: `cd ../backend && npm install --production`
3. ✅ Variables de entorno configuradas en `backend/.env`

## 🎨 Iconos

Coloca los iconos en `assets/`:
- `icon.ico` - Windows (256x256)
- `icon.png` - Genérico (512x512)

Genera iconos gratis en: https://www.icoconverter.com/

## 📦 Lo que incluye el instalador

- ✅ Chromium (navegador)
- ✅ Node.js runtime
- ✅ Backend Express completo
- ✅ Frontend React compilado
- ✅ Todas las dependencias

**Tamaño aproximado:** 150-250 MB

## 🔧 Scripts Disponibles

- `npm start` - Ejecutar en modo producción
- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Crear instalador completo
- `npm run build:dir` - Crear carpeta sin empaquetar
- `npm run pack` - Empaquetar sin instalador

## 📖 Documentación Completa

Ver [ELECTRON_GUIDE.md](../ELECTRON_GUIDE.md) en la raíz del proyecto.

---

**Desarrollado por:** Felipe Rodríguez - Tecnophone Colombia SAS
