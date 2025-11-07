# ✅ Checklist de Deploy - TecnoLeads

## Pre-Deploy (Local)

- [x] Puppeteer eliminado del código
- [x] Puppeteer eliminado de package.json
- [x] Corrección de zona horaria aplicada (+5 horas)
- [x] Extracción HTML funcionando localmente
- [x] Modal de detalles funcionando
- [x] Variables de entorno documentadas (.env.example)
- [x] .gitignore protegiendo archivos sensibles
- [x] render.yaml configurado
- [x] vercel.json configurado
- [ ] Código commiteado a GitHub

```bash
# Ejecutar antes de commit
node verify-deploy.js

# Si todo OK, hacer commit
git add .
git commit -m "feat: eliminar Puppeteer, agregar extracción HTML y deploy config"
git push origin main
```

---

## Deploy Backend (Render)

### 1. Crear Web Service
- [ ] Login en render.com
- [ ] New + → Web Service
- [ ] Conectar repositorio GitHub
- [ ] Configurar:
  ```
  Name: tecnoleads-backend
  Region: Oregon
  Branch: main
  Root Directory: backend
  Runtime: Node
  Build Command: npm install
  Start Command: npm start
  Plan: Free
  ```

### 2. Variables de Entorno
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `MONGODB_URI=mongodb+srv://ventas:...` (tu connection string)
- [ ] `JWT_SECRET=` (generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `ENCRYPTION_KEY=` (generar con: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`)
- [ ] `CORS_ORIGIN=https://tu-app.vercel.app` (actualizar después del deploy de Vercel)

### 3. Deploy
- [ ] Click "Create Web Service"
- [ ] Esperar build (~2-3 minutos)
- [ ] Verificar health check: `https://tecnoleads-backend.onrender.com/api/health`

**URL del backend**: `_________________________`

---

## Deploy Frontend (Vercel)

### Opción A: CLI

```bash
cd frontend
npm i -g vercel
vercel

# Seguir wizard:
# - Deploy? Yes
# - Scope? Tu cuenta
# - Link? No
# - Name? tecnoleads
# - Directory? ./
# - Override? No
```

### Opción B: Dashboard

- [ ] Login en vercel.com
- [ ] Add New → Project
- [ ] Import repositorio GitHub
- [ ] Configurar:
  ```
  Framework: Vite
  Root Directory: frontend
  Build Command: npm run build
  Output Directory: dist
  ```
- [ ] Environment Variables:
  ```
  VITE_API_URL=https://tecnoleads-backend.onrender.com
  ```
- [ ] Deploy

**URL del frontend**: `_________________________`

---

## Post-Deploy

### 1. Actualizar CORS
- [ ] Copiar URL de Vercel (ej: `https://tecnoleads.vercel.app`)
- [ ] Ir a Render Dashboard → tecnoleads-backend → Environment
- [ ] Actualizar `CORS_ORIGIN` con la URL de Vercel
- [ ] Guardar cambios (redeploy automático)

### 2. Probar Aplicación

#### Login
- [ ] Abrir `https://tecnoleads.vercel.app`
- [ ] Hacer login
- [ ] Verificar que no hay errores CORS en consola

#### Importar CSV
- [ ] Ir a "Importar"
- [ ] Subir CSV de prueba
- [ ] Verificar que se parse correctamente

#### Extraer Fechas
- [ ] Click "Extraer Fechas"
- [ ] Verificar que aparezcan fechas
- [ ] Click en ícono de ojo 👁️
- [ ] Verificar que se muestren detalles completos del contrato
- [ ] Verificar que la fecha sea correcta (no 5 horas menos)

#### Importar a Odoo
- [ ] Ir a Settings → Configuración
- [ ] Agregar credenciales de Odoo
- [ ] Volver a Importar
- [ ] Seleccionar CSV con fechas extraídas
- [ ] Click "Iniciar Importación"
- [ ] Verificar que se importen a Odoo correctamente
- [ ] Revisar en Odoo que las fechas estén correctas

### 3. Configurar Alertas (Opcional)
- [ ] Render: Settings → Notifications → Enable email on crash
- [ ] Vercel: Settings → Notifications → Deploy notifications

### 4. Configurar Dominio Personalizado (Opcional)
- [ ] Vercel: Settings → Domains → Add domain
- [ ] Configurar DNS según instrucciones
- [ ] Actualizar `CORS_ORIGIN` en Render con nuevo dominio

---

## Verificación Final

### Backend Health
```bash
curl https://tecnoleads-backend.onrender.com/api/health
# Debe retornar: {"status":"ok",...}
```

### Frontend Loading
```bash
curl -I https://tecnoleads.vercel.app
# Debe retornar: 200 OK
```

### CORS OK
- [ ] Abrir frontend en navegador
- [ ] Abrir DevTools → Console
- [ ] No debe haber errores CORS
- [ ] Network tab debe mostrar requests exitosos a backend

### Extracción Funcionando
- [ ] Subir CSV con URLs de SECOP II
- [ ] Extraer fechas
- [ ] Verificar que no haya errores en logs de Render
- [ ] Verificar que las fechas sean correctas (+5 horas aplicadas)

### Modal de Detalles
- [ ] Click en ícono de ojo
- [ ] Verificar que se muestren todos los campos
- [ ] Verificar formato de moneda (COP)
- [ ] Verificar que el enlace a SECOP funcione

---

## Troubleshooting

### ❌ Backend no responde
1. Ir a Render Dashboard → Logs
2. Buscar errores en el log
3. Verificar que MONGODB_URI sea correcto
4. Verificar que PORT=10000

### ❌ CORS Error
1. Verificar URL exacta de Vercel (incluir https://)
2. Actualizar CORS_ORIGIN en Render
3. Esperar redeploy (1-2 min)
4. Limpiar caché del navegador

### ❌ Fechas incorrectas
1. Verificar logs de Render durante extracción
2. Buscar mensaje: "📅 Fecha de vencimiento extraída:"
3. Verificar que tenga +5 horas aplicadas
4. Si no, revisar secopApi.service.js línea ~25

### ❌ Frontend no carga
1. Verificar build logs en Vercel
2. Verificar que VITE_API_URL esté configurado
3. Rebuild con variables correctas

---

## 🎉 Deploy Exitoso

Si todos los checks están marcados:

- ✅ Backend desplegado en Render
- ✅ Frontend desplegado en Vercel
- ✅ CORS configurado correctamente
- ✅ Extracción de fechas funcionando
- ✅ Modal de detalles operativo
- ✅ Importación a Odoo exitosa
- ✅ Fechas con zona horaria correcta

**URLs Finales:**
- Backend: `https://tecnoleads-backend.onrender.com`
- Frontend: `https://tecnoleads.vercel.app`

**Compartir con el equipo y disfrutar!** 🚀
