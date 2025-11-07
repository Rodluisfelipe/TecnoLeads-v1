# 🚀 Guía de Despliegue - TecnoLeads

## ✅ Cambios Importantes
- **Eliminado Puppeteer** - Ya no requiere Chrome/navegador
- **Compatible con Free Tier** - Render y Vercel gratuitos
- **Extracción HTML pura** - Usa axios para obtener datos de SECOP II
- **Zona horaria corregida** - +5 horas para Colombia (UTC-5)

---

## 📦 Backend - Render (Free Tier)

### Paso 1: Preparar Repositorio
```bash
# Asegurarte que los cambios estén en GitHub
git add .
git commit -m "feat: eliminar Puppeteer, usar extracción HTML"
git push origin main
```

### Paso 2: Crear Servicio en Render

1. Ve a [render.com](https://render.com) y haz login
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio GitHub
4. Configuración:
   - **Name**: `tecnoleads-backend`
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Paso 3: Variables de Entorno en Render

Agregar en **Environment**:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://ventas:94GtmyqvzIhQdu5t@cluster0.mru0c1c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<generar-random-string>
ENCRYPTION_KEY=<32-caracteres-random>
CORS_ORIGIN=https://tu-app.vercel.app
```

**Generar strings random**:
```bash
# JWT_SECRET (cualquier longitud)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ENCRYPTION_KEY (exactamente 32 caracteres)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Paso 4: Deploy
- Click en **"Create Web Service"**
- Esperar ~2-3 minutos
- Verificar en: `https://tecnoleads-backend.onrender.com/api/health`

**⚠️ Nota Free Tier**: El servidor se duerme tras 15 min de inactividad. Primera request tarda ~30 segundos en despertar.

---

## 🌐 Frontend - Vercel (Free Tier)

### Paso 1: Preparar Frontend

Asegúrate que `frontend/.env.production` tenga:
```env
VITE_API_URL=https://tecnoleads-backend.onrender.com
```

### Paso 2: Deploy en Vercel

**Opción A: Desde el CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy desde la carpeta frontend
cd frontend
vercel

# Seguir el wizard:
# - Set up and deploy? Yes
# - Which scope? Tu cuenta
# - Link to existing project? No
# - Project name? tecnoleads
# - In which directory is your code? ./
# - Override settings? No
```

**Opción B: Desde la Web**
1. Ve a [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import tu repositorio de GitHub
4. Configuración:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   ```
   VITE_API_URL=https://tecnoleads-backend.onrender.com
   ```
6. Click **"Deploy"**

### Paso 3: Configurar Dominio (Opcional)
- En Vercel Dashboard → Settings → Domains
- Agregar dominio personalizado
- Actualizar `CORS_ORIGIN` en Render con el nuevo dominio

---

## 🔧 Configuración Post-Deploy

### 1. Actualizar CORS en Backend
En Render, actualizar `CORS_ORIGIN`:
```env
CORS_ORIGIN=https://tecnoleads.vercel.app,https://tu-dominio.com
```

### 2. Verificar Health Check
```bash
# Backend
curl https://tecnoleads-backend.onrender.com/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"...","uptime":123}
```

### 3. Probar Extracción de Fechas
1. Ir a `https://tecnoleads.vercel.app`
2. Login con usuario de prueba
3. Ir a "Importar"
4. Subir CSV de SECOP II
5. Click "Extraer Fechas"
6. Verificar que aparezcan fechas correctas

---

## 📊 Monitoreo

### Render Dashboard
- Ver logs en tiempo real
- Métricas de CPU/RAM (limitadas en free tier)
- Historial de deploys

### Vercel Dashboard
- Analytics de visitantes
- Logs de funciones
- Tiempos de build

---

## 🐛 Troubleshooting

### Backend no responde
```bash
# Ver logs en Render Dashboard
# O con CLI:
render logs -s tecnoleads-backend

# Causas comunes:
# - MongoDB connection string incorrecto
# - Variables de entorno faltantes
# - Puerto incorrecto (debe ser 10000)
```

### CORS Error en Frontend
```bash
# Verificar que CORS_ORIGIN en Render incluya el dominio de Vercel
# Ejemplo:
CORS_ORIGIN=https://tecnoleads.vercel.app,https://tecnoleads-git-main.vercel.app
```

### Fechas incorrectas en Odoo
```bash
# Verificar que el backend tenga la corrección de zona horaria
# En backend/src/services/secopApi.service.js debe estar:
# fecha.setHours(fecha.getHours() + 5); // SUMAR 5 horas
```

### Frontend no conecta con Backend
```bash
# Verificar variable de entorno
cd frontend
cat .env.production
# Debe tener: VITE_API_URL=https://tecnoleads-backend.onrender.com

# Rebuild en Vercel si se cambió
vercel --prod
```

---

## 💰 Costos Free Tier

### Render (Backend)
- ✅ 750 horas/mes gratis
- ✅ 512 MB RAM
- ✅ Se duerme tras 15 min inactividad
- ⚠️ Tarda ~30 seg en despertar

### Vercel (Frontend)
- ✅ 100 GB bandwidth/mes
- ✅ Builds ilimitados
- ✅ Serverless functions (no usamos)
- ✅ Analytics básico

### MongoDB Atlas (Database)
- ✅ 512 MB storage gratis
- ✅ Shared cluster
- ✅ Sin tarjeta de crédito requerida

**Total: $0/mes** 🎉

---

## 🔐 Seguridad

### Checklist Pre-Deploy
- [ ] Cambiar `JWT_SECRET` por uno único
- [ ] Cambiar `ENCRYPTION_KEY` por uno de 32 caracteres
- [ ] No commitear archivos `.env` al repositorio
- [ ] Verificar que `.gitignore` incluya `.env`
- [ ] Configurar CORS solo para dominios autorizados
- [ ] MongoDB con autenticación activada

### Recomendaciones
1. Rotar secretos cada 3 meses
2. Habilitar 2FA en Render, Vercel y MongoDB
3. Revisar logs regularmente
4. Configurar alerts en Render (email cuando crash)

---

## 📈 Próximos Pasos

Una vez desplegado:

1. **Probar flujo completo**:
   - Subir CSV → Extraer fechas → Ver detalles → Importar a Odoo

2. **Configurar Odoo**:
   - Ir a Settings → Configuración
   - Agregar credenciales de Odoo
   - Probar conexión

3. **Invitar usuarios**:
   - Crear cuentas para equipo
   - Asignar permisos

4. **Backup**:
   - MongoDB Atlas tiene backups automáticos
   - Exportar datos importantes regularmente

---

## 🆘 Soporte

Si tienes problemas:

1. Revisar esta guía
2. Verificar logs en Render/Vercel
3. Comprobar variables de entorno
4. Revisar [issues en GitHub](https://github.com/Rodluisfelipe/TecnoLeads-v1/issues)

---

## ✅ Deploy Completado

Si todo funciona:
- ✅ Backend respondiendo en Render
- ✅ Frontend accesible en Vercel
- ✅ Extracción de fechas funcionando
- ✅ Importación a Odoo operativa

**¡Felicidades! 🎉 Tu aplicación está en producción.**
