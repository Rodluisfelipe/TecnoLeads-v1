# 🚀 Despliegue TecnoLeads - Vercel + Render

## 📦 PARTE 1: Backend en Render (5 minutos)

### Paso 1: Crear Cuenta en Render
1. Ve a [render.com](https://render.com)
2. Click "Get Started for Free"
3. Conecta con GitHub

### Paso 2: Crear Web Service
1. Dashboard → "New +" → "Web Service"
2. Conecta tu repositorio `TecnoLeads-v1`
3. Click "Connect"

### Paso 3: Configuración del Servicio

**Name**: `tecnoleads-backend` (o el que prefieras)

**Region**: Oregon (USA) - Gratis

**Branch**: `main`

**Root Directory**: `backend`

**Runtime**: Node

**Build Command**: 
```bash
npm install
```

**Start Command**: 
```bash
npm start
```

**Plan**: Free (o selecciona plan pagado si necesitas)

### Paso 4: Variables de Entorno

Click en "Advanced" → "Add Environment Variable" y agrega:

```bash
# Node
NODE_ENV=production
PORT=10000

# JWT Secrets (genera valores únicos y seguros)
JWT_SECRET=GENERA_UN_SECRET_LARGO_Y_SEGURO_MINIMO_32_CARACTERES
JWT_REFRESH_SECRET=OTRO_SECRET_DIFERENTE_TAMBIEN_LARGO_Y_SEGURO

# Encryption (genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=TU_CLAVE_HEX_DE_64_CARACTERES

# CORS (lo agregarás después de desplegar el frontend)
CORS_ORIGIN=https://tu-app.vercel.app
```

**⚠️ IMPORTANTE - Generar Secrets Seguros:**

Abre una terminal y ejecuta:

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# JWT_REFRESH_SECRET (ejecuta de nuevo para obtener otro diferente)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia cada resultado y pégalo en la variable correspondiente.

### Paso 5: Deploy

1. Click "Create Web Service"
2. Render comenzará a construir y desplegar (toma 5-10 minutos)
3. Cuando termine verás: ✅ Live
4. Copia la URL: `https://tecnoleads-backend.onrender.com`

### Paso 6: Verificar que Funciona

Abre en tu navegador:
```
https://TU-URL.onrender.com/api/health
```

Deberías ver algo como:
```json
{"status":"ok","timestamp":"..."}
```

---

## 🌐 PARTE 2: Frontend en Vercel (3 minutos)

### Paso 1: Preparar Variables de Entorno

Ahora que tienes la URL del backend de Render, actualiza:

`CORS_ORIGIN` en Render → Debe ser la URL de Vercel (lo haremos después)

### Paso 2: Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. "Add New..." → "Project"
3. Import tu repositorio `TecnoLeads-v1`

### Paso 3: Configuración del Proyecto

**Framework Preset**: Vite

**Root Directory**: Déjalo en blanco (automático con vercel.json)

**Build Command**: Automático (definido en vercel.json)

**Output Directory**: Automático (definido en vercel.json)

### Paso 4: Variables de Entorno

Click "Environment Variables" y agrega:

```bash
VITE_API_URL=https://TU-URL-RENDER.onrender.com/api
```

Reemplaza `TU-URL-RENDER` con la URL que obtuviste en Render (ej: `https://tecnoleads-backend.onrender.com`)

### Paso 5: Deploy

1. Click "Deploy"
2. Vercel construirá el frontend (2-3 minutos)
3. Cuando termine, obtendrás una URL: `https://tu-proyecto.vercel.app`

### Paso 6: Actualizar CORS en Render

1. Vuelve a Render Dashboard
2. Tu servicio `tecnoleads-backend`
3. Environment → Editar `CORS_ORIGIN`
4. Cambia a tu URL de Vercel: `https://tu-proyecto.vercel.app`
5. Guarda (esto reiniciará el backend automáticamente)

---

## ✅ VERIFICACIÓN FINAL

### 1. Probar Backend
```bash
curl https://tu-backend.onrender.com/api/health
```

### 2. Probar Frontend
1. Abre `https://tu-app.vercel.app`
2. Deberías ver la pantalla de login
3. Abre DevTools (F12) → Console
4. No debería haber errores de CORS

### 3. Probar Login/Registro
1. Click en "Registrarse"
2. Crea una cuenta de prueba
3. Si funciona = ¡TODO LISTO! 🎉

---

## 🔧 TROUBLESHOOTING

### ❌ Error: "Cannot connect to backend"

**Síntoma**: El frontend no puede conectarse al backend

**Solución**:
1. Verifica que `VITE_API_URL` en Vercel sea correcto
2. Debe incluir `/api` al final
3. Verifica que el backend en Render esté "Live" (verde)
4. Redeploy el frontend después de cambiar variables

### ❌ Error: "CORS policy blocked"

**Síntoma**: Error de CORS en la consola del navegador

**Solución**:
1. Ve a Render → Environment
2. Verifica que `CORS_ORIGIN` sea exactamente tu URL de Vercel
3. No agregues "/" al final
4. Guarda y espera que redeploy (1-2 minutos)

### ❌ Error: "Application failed to respond"

**Síntoma**: El backend en Render no responde

**Solución**:
1. Render → Logs (lado derecho)
2. Busca errores en los logs
3. Verifica que todas las variables de entorno estén configuradas
4. Verifica que `JWT_SECRET` tenga al menos 32 caracteres

### ❌ Error: "Build failed" en Vercel

**Síntoma**: El build del frontend falla

**Solución**:
1. Vercel → Deployment → View Build Logs
2. Busca el error específico
3. Asegúrate que el archivo `vercel.json` esté en la raíz
4. Verifica que el `package.json` del frontend esté correcto

### 🐌 Backend muy lento al iniciar

**Causa**: Render Free tier pone el servicio en "sleep" después de 15 minutos de inactividad

**Solución temporal**: 
- El primer request después de sleep toma ~30 segundos
- Requests subsecuentes son normales

**Solución definitiva**: 
- Upgrade a plan pagado ($7/mes) = Sin sleep

---

## 🎯 URLs FINALES

Guarda estas URLs:

```
Frontend (Vercel): https://tu-proyecto.vercel.app
Backend (Render):  https://tecnoleads-backend.onrender.com
```

---

## 🔄 DEPLOYMENTS AUTOMÁTICOS

Ambas plataformas tienen CI/CD automático:

**Cada vez que hagas:**
```bash
git add .
git commit -m "Nueva feature"
git push origin main
```

✅ Vercel detecta el push → Deploy automático del frontend
✅ Render detecta el push → Deploy automático del backend

**No necesitas hacer nada más** después del primer setup!

---

## 💰 COSTOS

### Render Free Tier
✅ 750 horas/mes gratis
✅ Sleep después de 15min inactividad
✅ Suficiente para desarrollo/demo

### Render Starter ($7/mes)
✅ Sin sleep
✅ Mejor para producción
✅ 400GB bandwidth

### Vercel Hobby
✅ Completamente gratis
✅ 100GB bandwidth/mes
✅ Deployments ilimitados

**Total**: $0-7/mes 🎉

---

## 📝 CHECKLIST DE DESPLIEGUE

- [ ] Backend desplegado en Render
- [ ] Variables de entorno configuradas en Render
- [ ] Backend responde en `/api/health`
- [ ] URL del backend copiada
- [ ] Frontend desplegado en Vercel
- [ ] `VITE_API_URL` configurada en Vercel
- [ ] `CORS_ORIGIN` actualizada en Render
- [ ] Login funciona correctamente
- [ ] No hay errores de CORS
- [ ] Favicon visible
- [ ] Footer con créditos visible

---

## 🎓 PRÓXIMOS PASOS

1. **Configurar Dominio Personalizado** (Opcional)
   - Vercel: Settings → Domains
   - Render: Settings → Custom Domain

2. **Monitorear Logs**
   - Render: Dashboard → Logs (tiempo real)
   - Vercel: Dashboard → Deployments → Logs

3. **Configurar Odoo**
   - Login en tu app
   - Ve a "Configuración Odoo"
   - Conecta tu instancia de Odoo

4. **Probar Importación**
   - Descarga CSV de SECOP II
   - Sube en "Importar Leads"
   - Verifica que lleguen a Odoo

---

**¿Listo para comenzar?** 

1. Copia esta guía
2. Abre Render y Vercel
3. Sigue los pasos uno por uno
4. En ~10 minutos estarás en producción! 🚀

---

**Desarrollado por** [Felipe Rodríguez](https://github.com/Rodluisfelipe) **para** Tecnophone Colombia SAS - TecnoLeads
