# 📝 Changelog

Todos los cambios notables en TecnoLeads serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.1.0] - 2025-11-04

### ✨ Agregado

#### 🔧 Sistema de Corrección Automática de CSV
- ✅ Detección automática de archivos CSV mal formateados
- ✅ Corrección de encabezados completamente entre comillas
- ✅ Corrección de comillas dobles mal escapadas (`""` → `"`)
- ✅ Corrección de filas de datos mal formateadas
- ✅ **Normalización automática de nombres de campos** (NUEVO)
  - Más de 40 variantes de nombres soportadas
  - "entidad" → "Entidad"
  - "cuantia" → "Cuantía"
  - "Fecha Publicacion" → "F. Publicación"
  - "Link" → "Enlace"
  - Y muchas más...
- ✅ Validación mejorada de estructura de CSV
- ✅ Mensajes informativos cuando se corrige un archivo
- ✅ Flag `formatCorrected` en respuesta de API
- ✅ Logs descriptivos del proceso de corrección y normalización

#### 📚 Documentación
- 📄 Nueva guía: `CORRECCION_AUTOMATICA_CSV.md`
- 🧪 Script de prueba: `test-csv-parser.js`
- 📖 README actualizado con nueva funcionalidad
- 🔧 Documentación técnica del algoritmo de corrección

#### 🧪 Testing
- ✅ Script de prueba para validar corrección automática
- ✅ Casos de prueba con archivos mal formateados
- ✅ Comando npm: `npm run test:csv`

### 🔧 Cambiado

#### Backend
- 🔄 Mejorado `fileParser.service.js` con función `cleanCSVFormat()`
- 🔄 Actualizado `import.controller.js` para detectar correcciones
- 🔄 Mensajes de error más descriptivos con conteo de columnas
- 🔄 Import de `fs` agregado a controlador

#### Comportamiento
- ⚡ Archivos CSV ya no necesitan formato perfecto
- ⚡ Proceso de importación más tolerante
- ⚡ Menos errores por formato de archivo
- ⚡ Mejor experiencia de usuario

### 🐛 Corregido

- ✅ Problema con archivos exportados de SECOP II con formato no estándar
- ✅ Error "Solo 1 columna detectada" con archivos válidos
- ✅ Fallo al parsear encabezados entre comillas
- ✅ Comillas dobles escapadas incorrectamente

### 🎯 Mejoras de UX

- 💡 Usuario informado cuando archivo es corregido automáticamente
- 💡 Warnings visibles en respuesta de upload
- 💡 Logs de servidor más informativos
- 💡 Proceso transparente de corrección

---

## [1.0.0] - 2024-01-20

### 🎉 Lanzamiento Inicial

Primera versión completa de TecnoLeads - migración de PyQt6 a MERN Stack.

### ✨ Agregado

#### Frontend
- ⚛️ Aplicación React con Vite y Tailwind CSS
- 🔐 Sistema de autenticación completo (Login/Registro)
- 🌙 Dark mode con persistencia
- 📱 Diseño responsive mobile-first
- 🎨 UI moderna con animaciones suaves
- 🗂️ Sidebar navegación con routing
- 📊 Dashboard con estadísticas en tiempo real
- ⚙️ Configuración de credenciales Odoo
- 📤 Sistema de carga de archivos drag & drop
- 👁️ Vista previa de datos antes de importar
- 📈 Gráficos y visualizaciones con Recharts
- 📜 Historial completo de importaciones
- 👤 Gestión de perfil de usuario
- 🔔 Notificaciones toast con react-hot-toast

#### Backend
- 🟢 API REST con Node.js y Express
- 🍃 Integración MongoDB con Mongoose
- 🔑 Autenticación JWT con refresh tokens
- 🔐 Cifrado AES-256 para credenciales Odoo
- 📂 Upload de archivos con Multer
- 📊 Parseo de CSV con Papa Parse
- 📑 Parseo de Excel con ExcelJS
- 🔗 Cliente XML-RPC para Odoo
- ✅ Validación de datos con express-validator
- 🛡️ Security headers con Helmet
- ⚡ Rate limiting
- 🗜️ Compresión de respuestas
- 📝 Logging con Morgan

#### Base de Datos
- 📦 Modelo User con bcrypt hashing
- 🔐 Modelo OdooCredentials con encriptación
- 📊 Modelo ImportHistory con métricas
- 🔍 Índices optimizados para queries
- 📈 Aggregations para estadísticas

#### Funcionalidades Core
- 🔄 Importación masiva CSV/Excel → Odoo
- 🔍 Detección inteligente de duplicados
- 🔀 Transformación automática de datos
- ✨ Validación de estructura de archivos
- 📊 Generación de estadísticas
- ⏱️ Tracking de duración y performance
- 🎯 Tasa de éxito calculada
- 📝 Logs detallados de errores
- 🔄 Manejo robusto de errores

### 🔧 Configuración
- 📋 Variables de entorno documentadas
- 🐳 Docker-compose ready
- 🚀 Scripts de deployment
- 📚 Documentación completa
- 🛠️ Guía de instalación paso a paso

### 🔐 Seguridad
- 🔒 HTTPS ready
- 🔑 JWT con expiración
- 🛡️ CORS configurado
- 🔐 Passwords hasheados con bcrypt
- 🔏 Credenciales cifradas con AES-256
- 🚦 Rate limiting por IP
- ✅ Validación de inputs
- 🧹 Sanitización de datos

### 📚 Documentación
- 📖 README completo
- 🛠️ INSTALL.md con guía detallada
- 🚀 DEPLOYMENT.md para producción
- 📝 CHANGELOG.md
- 📄 LICENSE MIT
- 💡 Comentarios en código

### 🎯 Compatibilidad
- ✅ Odoo 14, 15, 16, 17, 18, 19
- ✅ Node.js 18+
- ✅ MongoDB 6+
- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Móviles y tablets

---

## [Unreleased]

### 🔮 Próximas Características

- [ ] WebSockets para progreso en tiempo real
- [ ] Queue system para archivos grandes
- [ ] Scheduled imports automáticos
- [ ] Integration webhooks
- [ ] Exportación de reportes en PDF
- [ ] Multi-idioma (i18n)
- [ ] Tests automatizados (Jest + Cypress)
- [ ] PWA support
- [ ] Notificaciones push
- [ ] Integración con más CRMs
- [ ] API pública con documentación Swagger
- [ ] Dashboard analytics avanzado
- [ ] Roles y permisos de usuario
- [ ] Audit logs
- [ ] Backup automático

---

## Tipos de Cambios

- `Agregado` - para nuevas funcionalidades
- `Cambiado` - para cambios en funcionalidades existentes
- `Deprecado` - para funcionalidades que serán removidas
- `Removido` - para funcionalidades removidas
- `Corregido` - para corrección de bugs
- `Seguridad` - para parches de seguridad

---

**Nota:** Este proyecto sigue [Semantic Versioning](https://semver.org/):
- MAJOR version: cambios incompatibles en la API
- MINOR version: nuevas funcionalidades compatibles
- PATCH version: bug fixes compatibles


