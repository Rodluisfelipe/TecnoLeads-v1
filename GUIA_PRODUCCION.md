# 🚀 GUÍA DE PRODUCCIÓN - TecnoLeads v1.0

## ✅ Pre-requisitos Completados

- [x] Backend conectado a MongoDB Atlas (nube)
- [x] Frontend compilado con Vite
- [x] Electron configurado para Windows
- [x] Sistema de validación de archivos implementado
- [x] Corrección automática de errores CSV/Excel
- [x] Integración con Odoo CRM
- [x] Scraping de fechas con Puppeteer
- [x] JWT_SECRET actualizado para producción
- [x] NODE_ENV=production configurado
- [x] Tag TECNOPHONE removido

---

## 📦 CONSTRUCCIÓN DEL INSTALADOR

### Opción 1: Script Automático (RECOMENDADO)

```bash
.\build-production.bat
```

Este script:
1. Limpia compilaciones anteriores
2. Instala todas las dependencias
3. Compila el frontend (React + Vite)
4. Prepara el backend
5. Construye el instalador de Electron
6. Genera versión portable

**Tiempo estimado:** 10-15 minutos  
**Resultado:** `electron\dist\TecnoLeads-Setup-1.0.0.exe` (~350 MB)

### Opción 2: Manual

```bash
# 1. Frontend
cd frontend
npm install
npm run build

# 2. Backend
cd ..\backend
npm install --production

# 3. Electron
cd ..\electron
npm install
npm run build
```

---

## 📋 ARCHIVOS GENERADOS

Después del build encontrarás en `electron\dist\`:

| Archivo | Descripción | Tamaño Aprox. |
|---------|-------------|---------------|
| `TecnoLeads-Setup-1.0.0.exe` | Instalador completo | ~350 MB |
| `TecnoLeads-Portable-1.0.0.exe` | Versión portable (sin instalación) | ~350 MB |
| `win-unpacked\` | Carpeta con archivos desempaquetados | ~400 MB |

---

## 🔐 SEGURIDAD - DATOS SENSIBLES

### ⚠️ IMPORTANTE: El archivo `.env` NO se incluye en el instalador

El instalador **NO contiene** el archivo `backend\.env` por seguridad (configurado en `electron/package.json`).

### Solución: El .env se crea automáticamente

El archivo `backend/src/server.js` tiene configurado crear el `.env` automáticamente con valores por defecto si no existe.

**Valores de producción incluidos:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://ventas:94GtmyqvzIhQdu5t@cluster0.mru0c1c.mongodb.net/tecnoleads
JWT_SECRET=TecnoLeads2025!ProduccionSecretKey#MongoDB@Atlas$SecureApp
```

---

## 🖥️ INSTALACIÓN EN CLIENTE

### Requisitos del Sistema

- **OS:** Windows 10/11 (64-bit)
- **RAM:** 4 GB mínimo (8 GB recomendado)
- **Disco:** 1 GB de espacio libre
- **Internet:** Conexión para MongoDB Atlas y Odoo

### Proceso de Instalación

1. **Ejecutar el instalador**
   ```
   TecnoLeads-Setup-1.0.0.exe
   ```

2. **Configuración del instalador**
   - Ubicación: `C:\Users\[Usuario]\AppData\Local\Programs\TecnoLeads`
   - Acceso directo: Escritorio + Menú Inicio
   - Permisos: Usuario normal (no requiere admin)

3. **Primera ejecución**
   - Se crea automáticamente el `.env`
   - Backend inicia en puerto 5000
   - Frontend carga desde `file://`
   - Se abre la ventana de login

4. **Registro de usuario**
   - Click en "Registrarse"
   - Llenar formulario
   - Credenciales se guardan en MongoDB Atlas

---

## 🧪 PRUEBAS ANTES DE DISTRIBUIR

### Lista de Verificación

- [ ] **Instalador funciona en máquina limpia**
  - Instalar en PC sin Node.js
  - Verificar que no pide dependencias

- [ ] **Conexión a MongoDB Atlas**
  - Abrir aplicación
  - Registrar usuario nuevo
  - Verificar en MongoDB Compass que se creó

- [ ] **Login funciona**
  - Cerrar aplicación
  - Volver a abrir
  - Login con credenciales creadas

- [ ] **Configuración de Odoo**
  - Ir a "Configuración Odoo"
  - Guardar credenciales
  - Probar conexión

- [ ] **Importación de CSV**
  - Cargar archivo SECOP II
  - Verificar corrección automática
  - Extraer fechas
  - Enviar a Odoo
  - Verificar leads creados en Odoo

- [ ] **Importación de Excel colapsado**
  - Cargar archivo con problema de columnas
  - Verificar que se corrige automáticamente
  - Ver reporte de validación

- [ ] **Versión portable funciona**
  - Ejecutar `.exe` portable
  - Verificar mismo comportamiento

---

## 📊 MONITOREO POST-DESPLIEGUE

### Logs del Sistema

Los logs se guardan en:
```
%APPDATA%\TecnoLeads\logs\
```

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "No se puede conectar a MongoDB" | Internet caído o credenciales incorrectas | Verificar conexión a internet |
| "Puerto 5000 en uso" | Otra app usando puerto 5000 | Cambiar puerto en `.env` |
| "Error al parsear CSV" | Archivo con formato no soportado | Revisar logs de validación |

---

## 🔄 ACTUALIZACIONES FUTURAS

### Versioning

- **Actual:** v1.0.0
- **Esquema:** MAJOR.MINOR.PATCH

### Para publicar actualización:

1. Modificar `electron/package.json`:
   ```json
   "version": "1.0.1"
   ```

2. Re-compilar:
   ```bash
   .\build-production.bat
   ```

3. Distribuir nuevo instalador

### Auto-Update (Futuro)

Electron tiene configurado `electron-updater`. Para activarlo:
1. Subir instalador a GitHub Releases
2. Configurar update server
3. La app verificará actualizaciones al iniciar

---

## 📦 DISTRIBUCIÓN

### Opción 1: USB / Compartir Archivo

- Copiar `TecnoLeads-Setup-1.0.0.exe`
- Enviar por email/Drive/OneDrive
- Usuario ejecuta y listo

### Opción 2: Red Corporativa

- Subir a servidor de archivos
- Usuarios descargan e instalan
- Gestión centralizada

### Opción 3: Website de Descarga

- Subir a hosting
- Link directo de descarga
- Incluir documentación

---

## 🔒 BACKUP Y SEGURIDAD

### Datos del Usuario

**SE GUARDAN EN:**
- MongoDB Atlas (usuarios, credenciales Odoo, historial)

**NO SE GUARDAN LOCALMENTE:**
- Contraseñas (solo hash)
- Datos sensibles

### Credenciales de Odoo

- Se encriptan con AES-256
- Encryption key en `.env`
- Solo el usuario que las guardó puede verlas

---

## 📞 SOPORTE POST-INSTALACIÓN

### Información de Contacto

**Desarrollador:** Felipe Rodriguez  
**Empresa:** Tecnophone Colombia SAS  
**Email:** [tu-email@tecnophone.com]  
**Versión:** 1.0.0  
**Fecha:** Noviembre 2025

### Documentación Incluida

- `README.md` - Introducción
- `ELECTRON_GUIDE.md` - Guía técnica
- `SISTEMA_VALIDACION.md` - Validación de archivos
- `BUILD_CHECKLIST.md` - Lista de verificación

---

## ✅ CHECKLIST FINAL

Antes de distribuir, verifica:

- [ ] `NODE_ENV=production` en `.env`
- [ ] JWT_SECRET actualizado (no valor por defecto)
- [ ] MongoDB URI apunta a cluster correcto
- [ ] Tag TECNOPHONE removido
- [ ] Instalador probado en máquina limpia
- [ ] Todas las funcionalidades probadas
- [ ] Documentación actualizada
- [ ] Logs de errores revisados
- [ ] Versión portable probada
- [ ] README incluye contacto de soporte

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

**TecnoLeads v1.0** está listo para ser distribuido.

**Características principales:**
- ✅ Aplicación de escritorio nativa (Windows)
- ✅ Conexión a MongoDB Atlas (nube)
- ✅ Integración con Odoo CRM
- ✅ Validación automática de archivos CSV/Excel
- ✅ Corrección de errores comunes
- ✅ Extracción automática de fechas
- ✅ Sistema de autenticación JWT
- ✅ Encriptación de credenciales
- ✅ Instalador profesional
- ✅ Versión portable incluida

**¡Éxito con el despliegue!** 🚀
