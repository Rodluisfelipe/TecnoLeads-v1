# 🚀 TecnoLeads - Instalación Local

## 📋 Pre-requisitos

Antes de instalar TecnoLeads, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
  - Descarga desde: https://nodejs.org/
  - Verifica con: `node --version`

## 🔧 Instalación Rápida (Windows)

### Opción 1: Script Automático (Recomendado)

1. **Descomprime** el archivo ZIP de TecnoLeads
2. **Abre** la carpeta `TecnoLeads-v1`
3. **Doble clic** en `setup.bat`
4. Espera a que termine la instalación

### Opción 2: Manual

```powershell
# Instalar backend
cd backend
npm install

# Instalar frontend
cd ..\frontend
npm install
```

## ▶️ Cómo Ejecutar

### Opción 1: Script Automático (Recomendado)

1. **Doble clic** en `start.bat`
2. Se abrirán dos ventanas de terminal:
   - Backend (Puerto 5000)
   - Frontend (Puerto 5173)
3. El navegador se abrirá automáticamente en `http://localhost:5173`

### Opción 2: Manual

Abre **dos terminales** y ejecuta:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

Luego abre tu navegador en: http://localhost:5173

## 🔐 Configuración Inicial

### 1. Variables de Entorno

El sistema viene con configuración por defecto para desarrollo local:

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_secreto_seguro_cambiar_en_produccion
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Primer Uso

1. **Registra** tu usuario en `/register`
2. **Configura** las credenciales de Odoo en `/odoo-config`
3. **Importa** tu primer archivo CSV en `/import`

## 🛑 Cómo Detener

Para detener los servicios:

1. Ve a cada ventana de terminal
2. Presiona `Ctrl + C`
3. Confirma con `S` (Sí)

O simplemente cierra las ventanas de terminal.

## 📁 Estructura del Proyecto

```
TecnoLeads-v1/
├── setup.bat              # Script de instalación
├── start.bat              # Script de inicio
├── backend/               # Servidor Node.js + Express
│   ├── src/
│   ├── package.json
│   └── .env
└── frontend/              # Cliente React + Vite
    ├── src/
    ├── package.json
    └── .env
```

## 🔍 Funcionalidades

### ✅ Scraping de Fechas Límite
- Usa Puppeteer para extraer fechas de licitaciones.info
- Funciona completamente offline
- Más de 100 selectores para máxima precisión

### 📊 Importación de CSV
- Sube archivos desde SECOP II
- Corrección automática de formato
- Validación de campos obligatorios

### 🔗 Integración con Odoo
- Conexión segura vía XML-RPC
- Creación automática de leads
- Asignación de tags personalizados

## ❓ Solución de Problemas

### Puerto ya en uso

Si ves el error "Puerto 5000 ya está en uso":

```powershell
# Encuentra el proceso
netstat -ano | findstr :5000

# Mata el proceso (reemplaza PID)
taskkill /PID <numero> /F
```

### Puppeteer no instala Chrome

Ejecuta manualmente:

```powershell
cd backend
node node_modules/puppeteer/install.js
```

### Frontend no conecta con Backend

1. Verifica que el backend esté corriendo en http://localhost:5000
2. Revisa `frontend/.env` → `VITE_API_URL=http://localhost:5000/api`
3. Reinicia el frontend

## 📞 Soporte

**Desarrollado por:**  
👨‍💻 Felipe Rodríguez  
🔗 GitHub: [@Rodluisfelipe](https://github.com/Rodluisfelipe)

**Empresa:**  
🏢 Tecnophone Colombia SAS  
📧 Contacto: [tecnophone.com.co](https://tecnophone.com.co)

## 📝 Notas Importantes

- ⚠️ Este es un ambiente de **desarrollo local**
- 🔒 Cambia `JWT_SECRET` si vas a usar en producción
- 💾 Los archivos CSV subidos se guardan en `backend/uploads/`
- 🌐 El scraping requiere conexión a internet

## 🎯 Próximos Pasos

1. Lee el archivo `QUICK_START.md` para tutoriales
2. Revisa `PROJECT_SUMMARY.md` para arquitectura completa
3. Consulta `CHANGELOG.md` para ver actualizaciones

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025
