# 🚀 TecnoLeads - Sistema de Importación SECOP II → Odoo CRM

Sistema de automatización para importar oportunidades comerciales desde archivos CSV/Excel (SECOP II) hacia Odoo CRM.

## 📋 Descripción

TecnoLeads automatiza la importación de licitaciones gubernamentales desde el portal SECOP II de Colombia hacia el CRM Odoo de Tecnophone, reduciendo el tiempo de procesamiento de horas a minutos.

## 🎯 Características Principales

- ✅ **Importación Masiva**: Procesa 500+ registros en minutos
- ✅ **Corrección Automática de CSV**: Detecta y repara archivos con formato no estándar
- 🔐 **Seguridad**: Credenciales cifradas con AES-256
- 🔄 **Detección de Duplicados**: Evita registros repetidos automáticamente
- 👥 **Búsqueda Automática de Clientes**: Encuentra y vincula clientes existentes en Odoo
- 📧 **Autocompletado Inteligente**: Email y teléfono desde la base de datos de Odoo
- 🏷️ **Tags Automáticos**: Crea y asigna etiquetas automáticamente
- 📊 **Vista Previa**: Revisa datos antes de importar
- 📈 **Dashboard Analytics**: Métricas y reportes en tiempo real
- 🌙 **Dark Mode**: Interfaz moderna y adaptable
- 📱 **Responsive**: Funciona en cualquier dispositivo

## 🛠️ Stack Tecnológico

### Frontend
- ⚛️ React 18 + Vite
- 🎨 Tailwind CSS
- 🔄 React Router v6
- 📡 Axios
- 🎭 Framer Motion
- 📊 Recharts

### Backend
- 🟢 Node.js + Express
- 🍃 MongoDB + Mongoose
- 🔐 JWT Authentication
- 📂 Multer (file uploads)
- 📊 Papa Parse (CSV)
- 📑 ExcelJS
- 🔗 XML-RPC Client (Odoo)

### Integración
- 🔗 **Odoo CRM** via XML-RPC
- 📋 **SECOP II** formato nativo
- 🗺️ Mapeo automático de campos
- 🔧 Campos personalizados en Odoo

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- MongoDB 6+
- Cuenta Odoo activa

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables en .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
TecnoLeads-v1/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/          # Páginas/vistas
│   │   ├── services/       # API clients
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # Context providers
│   │   ├── utils/          # Utilidades
│   │   └── App.jsx
│   └── package.json
├── backend/                  # API Node.js
│   ├── src/
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos MongoDB
│   │   ├── routes/         # Rutas API
│   │   ├── middleware/     # Middlewares
│   │   ├── services/       # Lógica de negocio
│   │   └── server.js
│   └── package.json
└── README.md
```

## 🔧 Configuración

### Variables de Entorno Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tecnoleads
JWT_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-32-char-encryption-key
NODE_ENV=development
```

### Variables de Entorno Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📖 Uso

1. **Registro/Login**: Crear cuenta o iniciar sesión
2. **Configurar Odoo**: Ingresar credenciales de tu instancia Odoo
3. **Cargar Archivo**: Seleccionar CSV/Excel de SECOP II
4. **Vista Previa**: Revisar datos antes de importar
5. **Importar**: Iniciar proceso de importación masiva
6. **Reporte**: Ver resultados y estadísticas

### 📄 Formato de Archivo SECOP II

El sistema está optimizado para procesar archivos exportados directamente desde SECOP II.

**Columnas soportadas:**
- `Entidad`, `Objeto`, `Cuantía`, `Modalidad`, `Número`, `Estado`
- `F. Publicación`, `Ubicación`, `Actividad Económica`, `Códigos UNSPSC`
- `Enlace`, `Portal de origen`, `Contratista(s)`

**📚 Documentación detallada:**
- � [CORRECCION_AUTOMATICA_CSV.md](./CORRECCION_AUTOMATICA_CSV.md) - Sistema de corrección automática de CSV
- �📋 [FORMATO_SECOP_II.md](./FORMATO_SECOP_II.md) - Formato de archivo soportado
- 🗺️ [MAPEO_CAMPOS.md](./MAPEO_CAMPOS.md) - Mapeo completo CSV → Odoo
- 🔍 [BUSQUEDA_AUTOMATICA_CLIENTES.md](./BUSQUEDA_AUTOMATICA_CLIENTES.md) - Búsqueda y autocompletado de clientes
- 🏷️ [TAGS_AUTOMATICOS_ODOO.md](./TAGS_AUTOMATICOS_ODOO.md) - Creación automática de tags/etiquetas
- 🔧 [CONFIGURACION_ODOO_CAMPOS.md](./CONFIGURACION_ODOO_CAMPOS.md) - Configurar campos personalizados (opcional)

**Archivo de ejemplo:** [contratos plantilla.csv](./contratos%20plantilla.csv)

## 🔐 Seguridad

- Cifrado AES-256 para credenciales Odoo
- JWT tokens con refresh automático
- Rate limiting en APIs
- Validación y sanitización de inputs
- CORS configurado
- Helmet.js para headers de seguridad

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Credenciales Odoo
- `POST /api/odoo/credentials` - Guardar credenciales
- `GET /api/odoo/credentials` - Obtener credenciales
- `POST /api/odoo/test-connection` - Probar conexión

### Importación
- `POST /api/import/upload` - Subir archivo
- `POST /api/import/preview` - Vista previa
- `POST /api/import/execute` - Ejecutar importación
- `GET /api/import/history` - Historial

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📝 Licencia

MIT License - ver archivo LICENSE para detalles

## 👥 Autores

- **Tecnophone** - Sistema original PyQt6
- **Claude AI** - Migración a MERN Stack

## 📞 Soporte

Para soporte técnico, contacta a soporte@tecnophone.com

---

⭐ Si este proyecto te fue útil, dale una estrella en GitHub!

