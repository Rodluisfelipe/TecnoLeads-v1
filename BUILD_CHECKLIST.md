# 📋 Checklist: Crear Instalador de TecnoLeads

## ✅ Pre-requisitos

- [ ] Node.js instalado (v16 o superior)
- [ ] Git instalado (opcional, para control de versiones)
- [ ] Acceso a MongoDB Atlas (URL de conexión)
- [ ] Credenciales de Odoo para pruebas

## 🔧 Configuración Inicial

### 1. Variables de Entorno

- [ ] Crear `backend/.env` con:
  ```env
  MONGODB_URI=mongodb+srv://...
  JWT_SECRET=secret_generado_32_chars
  JWT_REFRESH_SECRET=otro_secret_diferente
  ENCRYPTION_KEY=clave_hex_64_chars
  PORT=5000
  NODE_ENV=production
  ```

- [ ] Generar secrets seguros:
  ```bash
  # En la terminal:
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 2. Iconos (Opcional pero recomendado)

- [ ] Crear icono 512x512 PNG
- [ ] Convertir a .ico en: https://convertio.co/png-ico/
- [ ] Guardar en `electron/assets/icon.ico`
- [ ] Guardar PNG en `electron/assets/icon.png`

## 🏗️ Proceso de Build

### Opción A: Script Automático (Recomendado)

- [ ] Ejecutar `build-electron.bat`
- [ ] Esperar ~5-10 minutos
- [ ] Verificar que no haya errores

### Opción B: Manual

- [ ] **Paso 1:** Instalar dependencias de Electron
  ```bash
  cd electron
  npm install
  ```

- [ ] **Paso 2:** Construir Frontend
  ```bash
  cd ../frontend
  npm install
  npm run build
  ```

- [ ] **Paso 3:** Instalar Backend (producción)
  ```bash
  cd ../backend
  npm install --production
  ```

- [ ] **Paso 4:** Build de Electron
  ```bash
  cd ../electron
  npm run build
  ```

## ✅ Verificación del Build

- [ ] Archivo existe: `electron/dist/TecnoLeads-Setup-1.0.0.exe`
- [ ] Archivo existe: `electron/dist/TecnoLeads-Portable-1.0.0.exe`
- [ ] Tamaño aproximado: 150-250 MB cada uno

## 🧪 Pruebas del Instalador

### Instalador NSIS (Setup.exe)

- [ ] Ejecutar instalador en máquina limpia (o VM)
- [ ] Verificar instalación en Program Files
- [ ] Verificar acceso directo en Escritorio
- [ ] Verificar acceso directo en Menú Inicio
- [ ] Ejecutar aplicación
- [ ] Verificar que carga correctamente
- [ ] Probar login/registro
- [ ] Configurar credenciales de Odoo
- [ ] Probar importación de CSV
- [ ] Verificar conexión a MongoDB Atlas
- [ ] Verificar conexión a Odoo
- [ ] Cerrar aplicación correctamente
- [ ] Desinstalar y verificar limpieza

### Versión Portable (.exe)

- [ ] Ejecutar portable desde USB o carpeta
- [ ] Verificar que funciona sin instalación
- [ ] Probar todas las funcionalidades
- [ ] Cerrar y verificar que no deja residuos

## 📦 Distribución

### Preparar Release

- [ ] Renombrar archivos si es necesario:
  - `TecnoLeads-Setup-v1.0.0.exe`
  - `TecnoLeads-Portable-v1.0.0.exe`

- [ ] Crear archivo README para usuarios:
  ```
  TecnoLeads v1.0.0
  
  Instalador: TecnoLeads-Setup-v1.0.0.exe
  Portable: TecnoLeads-Portable-v1.0.0.exe
  
  Requisitos: Windows 7 o superior
  
  Instrucciones:
  1. Ejecutar instalador
  2. Seguir el asistente
  3. Abrir TecnoLeads desde el menú inicio
  ```

### GitHub Release

- [ ] Crear nuevo Release en GitHub
- [ ] Tag: `v1.0.0`
- [ ] Título: `TecnoLeads Desktop v1.0.0`
- [ ] Descripción del release
- [ ] Subir `TecnoLeads-Setup-v1.0.0.exe`
- [ ] Subir `TecnoLeads-Portable-v1.0.0.exe`
- [ ] Marcar como pre-release si es versión beta
- [ ] Publicar

### Otras Opciones

- [ ] Subir a Google Drive / OneDrive
- [ ] Compartir link de descarga
- [ ] Documentar proceso de instalación
- [ ] Crear video tutorial (opcional)

## 📊 Información para Usuarios

**Tamaño de descarga:** ~200 MB  
**Espacio en disco:** ~300 MB instalado  
**Sistema operativo:** Windows 7, 8, 10, 11 (64-bit)  
**Requiere internet:** Solo para MongoDB Atlas y Odoo  
**Instalación:** ~2-3 minutos  

## 🐛 Solución de Problemas Comunes

### Build falla

- [ ] Verificar que Node.js esté instalado
- [ ] Verificar que todas las dependencias estén instaladas
- [ ] Limpiar y reinstalar: `rm -rf node_modules && npm install`
- [ ] Verificar espacio en disco (>2GB libre)

### Instalador no ejecuta

- [ ] Verificar antivirus (puede bloquear)
- [ ] Ejecutar como administrador
- [ ] Verificar firma digital (opcional)

### App no conecta a MongoDB

- [ ] Verificar URL de MongoDB Atlas en `.env`
- [ ] Verificar IP whitelist en MongoDB Atlas
- [ ] Probar conexión con compass

### App no conecta a Odoo

- [ ] Verificar URL de Odoo
- [ ] Verificar credenciales
- [ ] Verificar firewall

## 📝 Notas

- El instalador incluye todo lo necesario (Node.js, Chromium)
- No requiere instalación previa de dependencias
- Los datos se guardan en MongoDB Atlas (nube)
- Los archivos CSV se procesan localmente
- La conexión a Odoo es directa vía XML-RPC

## 🎯 Próximos Pasos

Después del primer release:

- [ ] Recopilar feedback de usuarios
- [ ] Documentar bugs reportados
- [ ] Planificar próxima versión
- [ ] Configurar auto-actualización (opcional)

---

**Checklist creado por:** Felipe Rodríguez - Tecnophone Colombia SAS  
**Versión:** 1.0  
**Fecha:** Noviembre 2025
