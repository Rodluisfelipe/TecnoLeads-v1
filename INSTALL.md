# 📦 Guía de Instalación - TecnoLeads

Esta guía te ayudará a instalar y configurar TecnoLeads en tu máquina local.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js 18+** - [Descargar](https://nodejs.org/)
- **MongoDB 6+** - [Descargar](https://www.mongodb.com/try/download/community)
- **Git** - [Descargar](https://git-scm.com/)
- **Cuenta Odoo activa** con acceso API

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd TecnoLeads-v1
```

### 2. Configurar MongoDB

**Opción A: MongoDB Local**

Inicia MongoDB en tu sistema:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Opción B: MongoDB Atlas (Nube)**

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Obtén tu connection string
4. Usa ese string en tu archivo `.env`

### 3. Configurar el Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

Edita `backend/.env` con tus configuraciones:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/tecnoleads

# JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu-clave-secreta-super-segura-aqui
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Encryption (32 caracteres exactos)
ENCRYPTION_KEY=12345678901234567890123456789012

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**⚠️ IMPORTANTE:**
- Cambia `JWT_SECRET` por una clave única y segura
- Cambia `ENCRYPTION_KEY` por 32 caracteres aleatorios
- NO subas el archivo `.env` a Git

### 4. Configurar el Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

Edita `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Iniciar la Aplicación

Necesitas **2 terminales** abiertas:

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Deberías ver:

```
✅ Conectado a MongoDB
🚀 Servidor corriendo en puerto 5000
📝 Ambiente: development
🌐 API disponible en: http://localhost:5000/api
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Deberías ver:

```
VITE v5.0.8 ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### 6. Acceder a la Aplicación

Abre tu navegador en:

```
http://localhost:5173
```

## ✅ Verificación de Instalación

### Backend

Prueba que el backend funcione:

```bash
curl http://localhost:5000/api/health
```

Deberías recibir:

```json
{
  "status": "OK",
  "message": "TecnoLeads API está funcionando correctamente",
  "timestamp": "2024-01-20T...",
  "environment": "development"
}
```

### Frontend

1. Abre http://localhost:5173
2. Deberías ver la página de login
3. Haz clic en "Regístrate"
4. Crea una cuenta de prueba

### MongoDB

Verifica que MongoDB esté corriendo:

```bash
# MongoDB local
mongosh

# Listar bases de datos
show dbs

# Debería aparecer 'tecnoleads' después de registrarte
```

## 🔧 Solución de Problemas

### Error: "Cannot connect to MongoDB"

**Solución:**

```bash
# Verifica que MongoDB esté corriendo
mongod --version

# Inicia MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
net start MongoDB  # Windows
```

### Error: "EADDRINUSE: address already in use"

El puerto 5000 o 5173 ya está en uso.

**Solución:**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Error: "Module not found"

Faltan dependencias.

**Solución:**

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Invalid connection string" (MongoDB)

**Solución:**

Verifica que tu `MONGODB_URI` en `.env` sea correcto:

```env
# Local
MONGODB_URI=mongodb://localhost:27017/tecnoleads

# Atlas
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/tecnoleads?retryWrites=true&w=majority
```

### Frontend no se conecta al Backend

**Solución:**

1. Verifica que el backend esté corriendo
2. Revisa `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Limpia caché y reinicia:
   ```bash
   cd frontend
   rm -rf .vite
   npm run dev
   ```

### Errores de CORS

**Solución:**

En `backend/.env`, asegúrate de que:

```env
CORS_ORIGIN=http://localhost:5173
```

## 📚 Próximos Pasos

1. **Registra una cuenta** en http://localhost:5173/register
2. **Configura Odoo** en Settings → Odoo Config
3. **Prueba la conexión** con tus credenciales Odoo
4. **Sube un archivo CSV/Excel** de prueba
5. **Importa los datos** a Odoo

## 🔐 Configuración de Odoo

Para conectar con Odoo necesitas:

1. **URL**: La URL de tu instancia Odoo
   - Ejemplo: `https://miempresa.odoo.com`
   
2. **Base de Datos**: Nombre de tu BD en Odoo
   - Ejemplo: `produccion`
   
3. **Usuario**: Tu email de Odoo
   - Ejemplo: `admin@miempresa.com`
   
4. **Contraseña**: Tu password de Odoo o API token

### Permisos Requeridos en Odoo

El usuario debe tener acceso a:
- Módulo CRM (`crm.lead`)
- Permisos de lectura/escritura en Oportunidades

## 📖 Documentación Adicional

- [README.md](README.md) - Descripción general del proyecto
- [API Documentation](backend/README.md) - Documentación de la API
- [Deployment Guide](DEPLOYMENT.md) - Guía de despliegue en producción

## 🆘 Obtener Ayuda

Si encuentras problemas:

1. Revisa los logs del backend y frontend
2. Busca en la sección de Issues del repositorio
3. Contacta al equipo de desarrollo

## ✨ ¡Listo!

Tu instalación de TecnoLeads debería estar funcionando. 

**Happy Importing! 🚀**


