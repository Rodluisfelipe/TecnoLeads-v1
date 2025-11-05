# 🚀 Guía de Despliegue - TecnoLeads

Guía completa para desplegar TecnoLeads en producción.

## 📋 Opciones de Deployment

### Opción 1: Deployment Completo (Recomendado)

- **Frontend**: Vercel o Netlify
- **Backend**: Railway o Render
- **Base de Datos**: MongoDB Atlas

### Opción 2: VPS/Cloud

- **Proveedor**: DigitalOcean, AWS, Google Cloud
- **Todo en un servidor** con Docker

## 🌐 Frontend - Vercel (Recomendado)

### Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Repositorio Git del proyecto

### Pasos

1. **Push a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <tu-repo>
   git push -u origin main
   ```

2. **Importar en Vercel**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Importa tu repositorio
   - Framework: **Vite**
   - Root Directory: `frontend`

3. **Configurar Variables de Entorno**
   ```
   VITE_API_URL=https://tu-backend.railway.app/api
   ```

4. **Build Settings**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Deploy**
   - Click "Deploy"
   - Espera 2-3 minutos
   - Tu app estará en `https://tu-app.vercel.app`

### Configuración Adicional

**vercel.json** (en la raíz del proyecto):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

## 🔧 Backend - Railway

### Prerrequisitos

1. Cuenta en [Railway](https://railway.app)
2. Código del backend en GitHub

### Pasos

1. **Crear Nuevo Proyecto**
   - Ve a [railway.app/new](https://railway.app/new)
   - Click "Deploy from GitHub repo"
   - Selecciona tu repositorio

2. **Configurar Root Directory**
   ```
   Root Directory: backend
   Start Command: npm start
   ```

3. **Variables de Entorno**
   
   En Railway Dashboard → Variables:

   ```env
   NODE_ENV=production
   PORT=5000
   
   # MongoDB Atlas (ver sección siguiente)
   MONGODB_URI=mongodb+srv://...
   
   # JWT (generar claves seguras)
   JWT_SECRET=<genera-clave-segura-aquí>
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   
   # Encryption (32 caracteres)
   ENCRYPTION_KEY=<genera-32-caracteres-aquí>
   
   # CORS (tu dominio de Vercel)
   CORS_ORIGIN=https://tu-app.vercel.app
   
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=/tmp/uploads
   ```

   **Generar claves seguras:**
   ```bash
   # JWT Secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Encryption Key (32 chars)
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```

4. **Deploy**
   - Railway detectará Node.js automáticamente
   - Click "Deploy"
   - Obtendrás una URL: `https://tu-proyecto.up.railway.app`

5. **Configurar Dominio (Opcional)**
   - Settings → Domains
   - Agregar dominio personalizado

## 🗄️ MongoDB Atlas

### Setup

1. **Crear Cuenta**
   - Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Crea cuenta gratuita

2. **Crear Cluster**
   - Click "Build a Database"
   - Selecciona "Free" (M0)
   - Elige región cercana a tu backend
   - Nombre: `tecnoleads-cluster`

3. **Configurar Acceso**
   
   **a) Database Access:**
   - Security → Database Access
   - Add New Database User
   - Username: `tecnoleads_admin`
   - Password: (genera una segura)
   - Rol: `Read and write to any database`

   **b) Network Access:**
   - Security → Network Access
   - Add IP Address
   - Selecciona "Allow Access from Anywhere" (0.0.0.0/0)
   - Esto es necesario para Railway/Render

4. **Obtener Connection String**
   - Databases → Connect
   - Connect your application
   - Driver: Node.js
   - Copia el connection string:
     ```
     mongodb+srv://tecnoleads_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Reemplaza `<password>` con tu contraseña
   - Agrega el nombre de la BD:
     ```
     mongodb+srv://tecnoleads_admin:tupassword@cluster0.xxxxx.mongodb.net/tecnoleads?retryWrites=true&w=majority
     ```

5. **Agregar a Railway**
   - Copia el connection string completo
   - Pégalo en Railway como `MONGODB_URI`

## 🔄 CI/CD - Deployment Automático

### GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install && npm run build
      # Vercel se encarga automáticamente del deploy

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      # Railway se encarga automáticamente del deploy
```

## 🐳 Docker (Alternativa)

### Docker Compose

Crea `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: tecnoleads

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/tecnoleads
      - NODE_ENV=production
    depends_on:
      - mongodb
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Dockerfile Backend

`backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Dockerfile Frontend

`frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Deploy con Docker

```bash
docker-compose up -d
```

## 🔐 Seguridad en Producción

### 1. Variables de Entorno

✅ **NUNCA** commitear archivos `.env`
✅ Usar valores diferentes para producción
✅ Rotar claves periódicamente

### 2. HTTPS

✅ Vercel y Railway incluyen HTTPS automático
✅ Si usas VPS, configura Let's Encrypt

### 3. Rate Limiting

El backend ya incluye rate limiting, pero puedes ajustarlo:

```env
RATE_LIMIT_WINDOW=15  # minutos
RATE_LIMIT_MAX_REQUESTS=100  # requests por ventana
```

### 4. CORS

Limita CORS a tu dominio:

```env
CORS_ORIGIN=https://tu-dominio.com
```

### 5. MongoDB

✅ Usuario/password fuertes
✅ Whitelist de IPs (si es posible)
✅ Backups automáticos (Atlas lo hace)

## 📊 Monitoreo

### Vercel Analytics

- Ya incluido gratis
- Dashboard → Analytics

### Railway Metrics

- Dashboard → Metrics
- Monitorea CPU, RAM, Network

### MongoDB Atlas Monitoring

- Dashboard → Metrics
- Monitorea queries, connections

### Logs

**Railway:**
```bash
railway logs
```

**Vercel:**
- Dashboard → Deployments → Ver logs

## 🔄 Actualizar Deployment

### Automático (Push to Main)

```bash
git add .
git commit -m "Update"
git push origin main
```

Vercel y Railway detectarán el push y deployarán automáticamente.

### Manual

**Railway:**
```bash
railway up
```

**Vercel:**
```bash
vercel --prod
```

## 🧪 Testing en Producción

1. **Health Check Backend**
   ```bash
   curl https://tu-backend.railway.app/api/health
   ```

2. **Test Frontend**
   - Abre https://tu-app.vercel.app
   - Registra usuario de prueba
   - Configura Odoo
   - Importa archivo pequeño

## 🆘 Troubleshooting

### Error: "Cannot connect to database"

- Verifica `MONGODB_URI` en Railway
- Chequea IP whitelist en MongoDB Atlas
- Revisa logs: `railway logs`

### Error: "CORS blocked"

- Verifica `CORS_ORIGIN` en backend
- Debe coincidir con tu dominio de Vercel

### Error: "Module not found"

- Asegúrate de tener `package-lock.json`
- Railway debe ejecutar `npm install`

### Frontend no carga

- Verifica `VITE_API_URL` en Vercel
- Debe apuntar a tu backend de Railway

## 📝 Checklist Pre-Deployment

- [ ] Código pusheado a GitHub
- [ ] Variables de entorno configuradas
- [ ] MongoDB Atlas setup completo
- [ ] Backend deployado en Railway
- [ ] Frontend deployado en Vercel
- [ ] CORS configurado correctamente
- [ ] Health check pasando
- [ ] Test de login funciona
- [ ] Test de importación funciona
- [ ] Dominios configurados (si aplica)

## 🎉 ¡Listo para Producción!

Tu aplicación TecnoLeads está ahora deployada y lista para usar.

**URLs finales:**
- Frontend: `https://tu-app.vercel.app`
- Backend: `https://tu-backend.railway.app`
- Database: MongoDB Atlas

---

**¿Necesitas ayuda?** Revisa los logs o contacta al equipo de desarrollo.


