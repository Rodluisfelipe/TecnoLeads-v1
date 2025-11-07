# 🚀 Guía de Despliegue en Free Tier (Render + Vercel)

## ✅ Ventajas de la Nueva Arquitectura (Sin Puppeteer)

### Antes (con Puppeteer):
- ❌ Requería 2GB+ de RAM
- ❌ Chrome ocupaba 500MB+ adicionales
- ❌ No compatible con free tier
- ❌ Builds de 5+ minutos
- ❌ Solo funcionaba en Electron (local)

### Ahora (HTML Extraction):
- ✅ Requiere solo 512MB de RAM
- ✅ Sin dependencias de navegador
- ✅ **Compatible con Render Free Tier**
- ✅ Builds de 1-2 minutos
- ✅ Funciona en cualquier servidor
- ✅ Extracción más rápida (< 1 segundo por contrato)

---

## 📦 Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────┐
│                  USUARIOS                       │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│           VERCEL (Frontend - FREE)              │
│  • React + Vite                                 │
│  • https://tecnoleads.vercel.app                │
│  • Deploy automático desde GitHub               │
└─────────────────────┬───────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────┐
│          RENDER (Backend - FREE)                │
│  • Node.js + Express                            │
│  • https://tecnoleads-backend.onrender.com      │
│  • 512MB RAM - SIN Puppeteer ✅                 │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│        MongoDB Atlas (Database - FREE)          │
│  • 512MB Storage                                │
│  • Cluster M0                                   │
└─────────────────────────────────────────────────┘
```

---

## 🔧 PASO 1: Preparar MongoDB Atlas

### 1.1 Crear Cluster Gratuito
1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (M0 - FREE)
4. Selecciona región: **AWS - N. Virginia (us-east-1)**

### 1.2 Configurar Acceso
1. **Database Access** → Add New Database User
   - Username: `tecnoleads-admin`
   - Password: (genera una contraseña segura)
   - Rol: `Atlas Admin`

2. **Network Access** → Add IP Address
   - Selecciona: **ALLOW ACCESS FROM ANYWHERE**
   - IP: `0.0.0.0/0` (importante para Render)

### 1.3 Obtener Connection String
1. Cluster → **Connect** → **Connect your application**
2. Copia la URL (ejemplo):
   ```
   mongodb+srv://tecnoleads-admin:<password>@cluster0.xxxxx.mongodb.net/tecnoleads?retryWrites=true&w=majority
   ```
3. Reemplaza `<password>` con tu contraseña real

---

## 🎨 PASO 2: Desplegar Frontend en Vercel

### 2.1 Preparar Repositorio GitHub
```bash
cd TecnoLeads-v1-fresh
git add .
git commit -m "feat: Remove Puppeteer, add free tier deployment"
git push origin main
```

### 2.2 Importar en Vercel
1. Ve a https://vercel.com/signup
2. **Add New Project** → **Import Git Repository**
3. Selecciona tu repo: `TecnoLeads-v1`
4. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 Variables de Entorno
En Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://tecnoleads-backend.onrender.com/api
```

### 2.4 Deploy
- Click **Deploy**
- Espera 2-3 minutos
- URL final: `https://tecnoleads-xxxxx.vercel.app`

---

## ⚙️ PASO 3: Desplegar Backend en Render

### 3.1 Crear Web Service
1. Ve a https://render.com/
2. **New** → **Web Service**
3. Conecta tu repositorio GitHub
4. Configura:
   - **Name**: `tecnoleads-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **FREE**

### 3.2 Variables de Entorno
En Render Dashboard → Environment → Environment Variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://tecnoleads-admin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/tecnoleads?retryWrites=true&w=majority
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_super_seguro_aqui
ENCRYPTION_KEY=tu_encryption_key_de_32_caracteres
FRONTEND_URL=https://tecnoleads-xxxxx.vercel.app
```

### 3.3 Generar Secrets
```bash
# JWT_SECRET (ejecutar en terminal)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# ENCRYPTION_KEY (32 caracteres)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 3.4 Deploy
- Click **Create Web Service**
- Espera 3-5 minutos (primera vez)
- URL final: `https://tecnoleads-backend.onrender.com`

---

## 🔗 PASO 4: Conectar Frontend con Backend

### 4.1 Actualizar Variable en Vercel
1. Copia la URL de Render (ej: `https://tecnoleads-backend.onrender.com`)
2. Ve a Vercel → Settings → Environment Variables
3. Actualiza `VITE_API_URL`:
   ```
   https://tecnoleads-backend.onrender.com/api
   ```
4. **Redeploy** el frontend

### 4.2 Actualizar CORS en Render
1. Ve a Render → Environment Variables
2. Actualiza `FRONTEND_URL` con tu URL de Vercel:
   ```
   https://tecnoleads-xxxxx.vercel.app
   ```
3. **Manual Deploy** para aplicar cambios

---

## ✅ PASO 5: Verificar Funcionamiento

### 5.1 Backend Health Check
Abre en navegador:
```
https://tecnoleads-backend.onrender.com/api/health
```
Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T...",
  "environment": "production"
}
```

### 5.2 Frontend
Abre:
```
https://tecnoleads-xxxxx.vercel.app
```
- Login debe funcionar
- Importar CSV debe funcionar
- **Extraer fechas debe funcionar** (sin Puppeteer ✅)

### 5.3 Test de Extracción
1. Ve a **Import**
2. Sube un CSV con contratos de SECOP II
3. Click **Extraer Fechas**
4. Deberías ver:
   ```
   ✅ Exitosos: X/X
   📅 Fechas extraídas en < 2 segundos
   ```

---

## 📊 Recursos del Free Tier

### Render Free Plan
- ✅ 512MB RAM (suficiente sin Puppeteer)
- ✅ CPU compartida
- ✅ 750 horas/mes gratis
- ✅ Auto-sleep después de 15 min inactividad
- ⚠️ Primera request después de sleep: ~30 segundos

### Vercel Free Plan
- ✅ 100GB bandwidth/mes
- ✅ Deploy ilimitados
- ✅ CDN global
- ✅ SSL automático
- ✅ Sin sleep/auto-pause

### MongoDB Atlas M0
- ✅ 512MB storage
- ✅ Shared CPU
- ✅ No auto-pause
- ✅ Backups automáticos

---

## 🔥 Optimizaciones para Free Tier

### Evitar Sleep de Render (Opcional)
Crea un cron job gratuito en **cron-job.org**:
```
URL: https://tecnoleads-backend.onrender.com/api/health
Intervalo: Cada 10 minutos
```

### Caching de Resultados
El backend ya cachea las fechas extraídas en memoria, reduciendo llamadas a SECOP II.

### Compresión de Respuestas
Backend ya usa `compression` middleware para reducir bandwidth.

---

## 🐛 Troubleshooting

### Error: "CORS blocked"
**Solución**: Verifica que `FRONTEND_URL` en Render coincida con tu URL de Vercel.

### Error: "Cannot connect to MongoDB"
**Solución**: 
1. Verifica que `MONGODB_URI` esté correcto en Render
2. Verifica que IP `0.0.0.0/0` esté permitida en MongoDB Atlas

### Backend demora 30 segundos en responder
**Normal**: Render free tier hace sleep después de 15 min de inactividad. Primera request despierta el servicio.

### Extracción de fechas falla
**Solución**:
1. Verifica que el CSV tenga columna "Enlace"
2. Verifica que los enlaces sean de `col.licitaciones.info`
3. Chequea logs en Render Dashboard

---

## 📈 Monitoreo

### Logs en Tiempo Real

**Render**:
```
Dashboard → tecnoleads-backend → Logs
```

**Vercel**:
```
Dashboard → tecnoleads → Deployments → [último deploy] → Logs
```

### Métricas
- **Render**: Dashboard muestra CPU, RAM, requests
- **Vercel**: Analytics muestra visitas, performance
- **MongoDB**: Atlas muestra conexiones, storage usado

---

## 🎉 Resumen

✅ **Frontend**: Vercel (gratis, siempre activo, CDN global)  
✅ **Backend**: Render (gratis, 512MB RAM suficiente)  
✅ **Database**: MongoDB Atlas M0 (gratis, 512MB)  
✅ **Total costo**: $0/mes  
✅ **Extracción**: Sin navegador, solo HTTP requests  
✅ **Performance**: < 1 segundo por contrato  

---

## 📝 Comandos Útiles

### Actualizar Deployment
```bash
# Frontend (Vercel auto-deploy)
git add frontend/
git commit -m "update: frontend changes"
git push origin main

# Backend (Render auto-deploy)
git add backend/
git commit -m "update: backend changes"
git push origin main
```

### Ver Logs Localmente
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Test de Producción Local
```bash
# Backend (simular producción)
cd backend
NODE_ENV=production npm start

# Frontend (build de producción)
cd frontend
npm run build
npm run preview
```

---

## 🔐 Seguridad

✅ Variables sensibles en environment variables  
✅ HTTPS en todas las conexiones  
✅ JWT para autenticación  
✅ Encriptación de credenciales Odoo  
✅ CORS configurado correctamente  
✅ MongoDB con autenticación  
✅ No hay Puppeteer = menos superficie de ataque  

---

**🎊 ¡Listo! Tu aplicación está en producción sin gastar un centavo.**
