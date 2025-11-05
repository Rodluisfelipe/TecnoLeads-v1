# ⚡ Quick Start - TecnoLeads

Guía rápida para tener TecnoLeads funcionando en 5 minutos.

## 🚀 Inicio Rápido (5 minutos)

### 1. Clonar y Setup Automático

```bash
# Clonar repositorio
git clone <tu-repositorio>
cd TecnoLeads-v1

# Ejecutar setup automático
npm install
node setup.js
```

### 2. Configurar MongoDB

**Opción A - MongoDB Local:**
```bash
# Iniciar MongoDB
mongod
```

**Opción B - MongoDB Atlas (Gratis):**
1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea cuenta → Create Free Cluster
3. Copia connection string
4. Pega en `backend/.env` → `MONGODB_URI`

### 3. Iniciar Aplicación

```bash
# En la raíz del proyecto
npm run dev
```

Esto iniciará automáticamente:
- ✅ Backend en http://localhost:5000
- ✅ Frontend en http://localhost:5173

### 4. Crear Cuenta

1. Abre http://localhost:5173
2. Click "Regístrate"
3. Llena el formulario
4. ¡Listo! Ya estás dentro

## 🎯 Primer Uso

### Configurar Odoo

1. Ve a **Configuración Odoo** en el menú
2. Ingresa tus credenciales:
   - URL: `https://tu-empresa.odoo.com`
   - Database: `tu-database`
   - Usuario: `admin@tuempresa.com`
   - Contraseña: `tu-password`
3. Click **Guardar** y luego **Probar Conexión**

### Importar Archivo

1. Ve a **Importar** en el menú
2. Arrastra tu archivo CSV/Excel
3. Revisa la vista previa
4. Click **Iniciar Importación**
5. ¡Espera los resultados!

## 📂 Estructura Rápida

```
TecnoLeads-v1/
├── backend/          # API Node.js
│   ├── src/         # Código fuente
│   └── .env         # Configuración
├── frontend/        # App React
│   ├── src/         # Código fuente
│   └── .env         # Configuración
└── README.md        # Documentación
```

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar frontend + backend
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend

# Instalación
npm run install:all      # Instalar todas las dependencias
npm run install:backend  # Solo backend
npm run install:frontend # Solo frontend

# Producción
npm run build           # Build del frontend
npm start              # Iniciar backend en producción
```

## 🐛 Problemas Comunes

### "Cannot connect to MongoDB"
```bash
# Verificar MongoDB
mongod --version

# Iniciar MongoDB
mongod
```

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### "Module not found"
```bash
# Reinstalar dependencias
cd backend && npm install
cd ../frontend && npm install
```

## 📚 Más Información

- [README.md](README.md) - Documentación completa
- [INSTALL.md](INSTALL.md) - Guía de instalación detallada
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy a producción

## 💡 Tips

1. **Dark Mode**: Click en el ícono de luna/sol en la navbar
2. **Historial**: Revisa todas tus importaciones pasadas
3. **Perfil**: Actualiza tu información personal
4. **Seguridad**: Las credenciales se cifran con AES-256

## 🎉 ¡Eso es Todo!

Ya tienes TecnoLeads funcionando. Ahora:

1. ✅ Configura tus credenciales Odoo
2. ✅ Importa tu primer archivo
3. ✅ Revisa los resultados en el dashboard

**¿Problemas?** → Lee [INSTALL.md](INSTALL.md) para más detalles

**¡Happy Importing! 🚀**


