# ✅ Checklist de Verificación - TecnoLeads

Use esta lista para verificar que TecnoLeads esté funcionando correctamente.

## 📋 Instalación

- [ ] Node.js 18+ instalado
- [ ] MongoDB instalado y corriendo
- [ ] Git instalado (opcional)
- [ ] Repositorio clonado
- [ ] Dependencias del backend instaladas (`cd backend && npm install`)
- [ ] Dependencias del frontend instaladas (`cd frontend && npm install`)

## 🔧 Configuración

### Backend (.env)
- [ ] Archivo `backend/.env` existe
- [ ] `MONGODB_URI` configurado correctamente
- [ ] `JWT_SECRET` es único y seguro (no el valor de ejemplo)
- [ ] `ENCRYPTION_KEY` tiene exactamente 32 caracteres
- [ ] `CORS_ORIGIN` apunta a frontend correcto
- [ ] Puerto `5000` disponible

### Frontend (.env)
- [ ] Archivo `frontend/.env` existe
- [ ] `VITE_API_URL` apunta a backend correcto
- [ ] Puerto `5173` disponible

## 🚀 Inicio del Sistema

### Backend
```bash
cd backend
npm run dev
```

- [ ] Servidor inicia sin errores
- [ ] Muestra "✅ Conectado a MongoDB"
- [ ] Muestra "🚀 Servidor corriendo en puerto 5000"
- [ ] API disponible en http://localhost:5000/api

### Frontend
```bash
cd frontend
npm run dev
```

- [ ] Vite inicia sin errores
- [ ] Muestra "Local: http://localhost:5173/"
- [ ] No hay errores en consola

## 🧪 Verificación API

### Health Check
```bash
curl http://localhost:5000/api/health
```

**Esperado:**
```json
{
  "status": "OK",
  "message": "TecnoLeads API está funcionando correctamente",
  "timestamp": "...",
  "environment": "development"
}
```

- [ ] Health check responde correctamente
- [ ] Status code es 200
- [ ] JSON es válido

## 🔐 Autenticación

### Registro
1. Ir a http://localhost:5173/register
2. Llenar formulario:
   - Nombre: Test User
   - Email: test@example.com
   - Password: test123
   - Confirmar password: test123

**Verificar:**
- [ ] Formulario se envía sin errores
- [ ] Redirect a /dashboard
- [ ] Toast de éxito aparece
- [ ] Usuario aparece en navbar
- [ ] Token guardado en localStorage

### Login
1. Cerrar sesión
2. Ir a http://localhost:5173/login
3. Login con credenciales creadas

**Verificar:**
- [ ] Login exitoso
- [ ] Redirect a /dashboard
- [ ] Sesión persiste al recargar página

### MongoDB
```bash
mongosh
use tecnoleads
db.users.find().pretty()
```

**Verificar:**
- [ ] Usuario registrado existe en DB
- [ ] Password está hasheado (no en texto plano)
- [ ] Email es único

## 🎨 Frontend - Navegación

### Dashboard
- [ ] Página carga correctamente
- [ ] Estadísticas muestran 0 inicialmente
- [ ] Alerta de "Configurar Odoo" aparece
- [ ] Botones de acciones rápidas funcionan

### Sidebar
- [ ] Sidebar se muestra/oculta con botón menú
- [ ] Links de navegación funcionan:
  - [ ] Dashboard
  - [ ] Configuración Odoo
  - [ ] Importar
  - [ ] Historial
  - [ ] Perfil

### Navbar
- [ ] Nombre de usuario se muestra
- [ ] Avatar con inicial aparece
- [ ] Botón de tema (dark/light) funciona
- [ ] Menu de usuario abre/cierra
- [ ] Logout funciona

### Theme Toggle
- [ ] Dark mode activa correctamente
- [ ] Colores cambian en toda la app
- [ ] Preferencia persiste al recargar
- [ ] Transiciones son suaves

## ⚙️ Configuración Odoo

### Página de Configuración
1. Ir a "Configuración Odoo"

**Verificar:**
- [ ] Formulario se muestra correctamente
- [ ] Campos tienen validación
- [ ] Iconos aparecen en inputs

### Guardar Credenciales
**Datos de prueba (si tienes acceso Odoo):**
- URL: https://tu-empresa.odoo.com
- Database: tu-database
- Username: admin@empresa.com
- Password: tu-password

**Verificar:**
- [ ] Formulario se envía
- [ ] Toast de éxito aparece
- [ ] Credenciales se guardan
- [ ] Card de estado aparece

### Test Conexión
- [ ] Botón "Probar Conexión" funciona
- [ ] Muestra loading durante prueba
- [ ] Resultado se muestra correctamente
- [ ] Estado se actualiza (success/failed)

### MongoDB
```bash
mongosh
use tecnoleads
db.odoo_credentials.find().pretty()
```

**Verificar:**
- [ ] Credenciales guardadas existen
- [ ] Password está cifrado (no legible)
- [ ] userId referencia al usuario correcto

## 📤 Importación de Archivos

### Preparar Archivo de Prueba
Usar `example-data.csv` incluido en el proyecto.

### Upload
1. Ir a "Importar"
2. Arrastrar `example-data.csv` o hacer click para seleccionar

**Verificar:**
- [ ] Drag & drop funciona
- [ ] Archivo se acepta (.csv, .xlsx, .xls)
- [ ] Loading aparece durante upload
- [ ] Vista previa se muestra

### Vista Previa
**Verificar:**
- [ ] Nombre del archivo correcto
- [ ] Tamaño del archivo mostrado
- [ ] Total de registros correcto (15 en ejemplo)
- [ ] Estadísticas se muestran
- [ ] Tabla previa con 10 filas
- [ ] Columnas correctas

### Importación (Solo si Odoo configurado)
1. Click "Iniciar Importación"

**Verificar:**
- [ ] Loading aparece
- [ ] Proceso completa
- [ ] Resultados se muestran
- [ ] Estadísticas correctas
- [ ] Tasa de éxito calculada

## 📜 Historial

### Lista de Importaciones
1. Ir a "Historial"

**Verificar:**
- [ ] Lista de importaciones aparece
- [ ] Cada item muestra:
  - [ ] Nombre de archivo
  - [ ] Estado (badge de color)
  - [ ] Estadísticas (total, éxito, duplicados, fallidos)
  - [ ] Fecha
  - [ ] Duración
  - [ ] Tasa de éxito

### Detalles
1. Click en una importación

**Verificar:**
- [ ] Modal se abre
- [ ] Información completa se muestra
- [ ] Errores listados (si hay)
- [ ] Duplicados listados (si hay)
- [ ] Botón cerrar funciona

### Paginación
- [ ] Si hay >10 importaciones, paginación aparece
- [ ] Botones Anterior/Siguiente funcionan
- [ ] Número de página correcto

## 👤 Perfil de Usuario

### Información Personal
1. Ir a "Perfil"

**Verificar:**
- [ ] Avatar con inicial se muestra
- [ ] Nombre y email correctos
- [ ] Tab "Información Personal" activa por defecto

### Actualizar Perfil
1. Cambiar nombre o empresa
2. Guardar

**Verificar:**
- [ ] Formulario se envía
- [ ] Toast de éxito
- [ ] Nombre actualiza en navbar
- [ ] Cambios persisten al recargar

### Cambiar Contraseña
1. Ir a tab "Seguridad"
2. Ingresar contraseña actual
3. Ingresar nueva contraseña
4. Confirmar nueva contraseña
5. Guardar

**Verificar:**
- [ ] Validación funciona
- [ ] Contraseña se cambia
- [ ] Toast de éxito
- [ ] Campos se limpian
- [ ] Login con nueva contraseña funciona

## 🔒 Seguridad

### Protección de Rutas
1. Cerrar sesión
2. Intentar acceder a:
   - http://localhost:5173/dashboard
   - http://localhost:5173/import
   - http://localhost:5173/history

**Verificar:**
- [ ] Todas redirigen a /login
- [ ] No hay acceso sin autenticación

### Token Refresh
1. Login
2. Esperar ~5 minutos
3. Hacer una acción (cambiar de página)

**Verificar:**
- [ ] Token se refresca automáticamente
- [ ] No se pide login nuevamente
- [ ] Sesión continúa activa

### API Protection
```bash
# Sin token
curl http://localhost:5000/api/users/profile

# Esperado: 401 Unauthorized
```

**Verificar:**
- [ ] Endpoints protegidos rechazan requests sin token
- [ ] Mensaje de error apropiado

## 📱 Responsive Design

### Mobile (375px)
**Verificar:**
- [ ] Sidebar se oculta en móvil
- [ ] Botón de menú aparece
- [ ] Navbar responsive
- [ ] Cards se apilan verticalmente
- [ ] Tablas hacen scroll horizontal
- [ ] Formularios son usables

### Tablet (768px)
**Verificar:**
- [ ] Layout se adapta
- [ ] Grids usan 2 columnas
- [ ] Navegación apropiada

### Desktop (1920px)
**Verificar:**
- [ ] Sidebar fija visible
- [ ] Contenido centrado con max-width
- [ ] Grids usan todas las columnas

## 🌓 Dark Mode

### Activar Dark Mode
1. Click en icono luna en navbar

**Verificar:**
- [ ] Colores cambian a oscuros
- [ ] Textos legibles
- [ ] Cards con contraste apropiado
- [ ] Inputs visibles
- [ ] Botones con colores correctos
- [ ] Sidebar oscuro
- [ ] Navbar oscuro

### Persistencia
1. Activar dark mode
2. Recargar página

**Verificar:**
- [ ] Dark mode persiste
- [ ] localStorage guarda preferencia

## 🐛 Manejo de Errores

### Frontend
**Verificar:**
- [ ] Formularios validan antes de enviar
- [ ] Mensajes de error claros
- [ ] Toast notificaciones funcionan
- [ ] Loading states apropiados
- [ ] Errores 404 muestran página NotFound

### Backend
```bash
# Request inválido
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid"}'
```

**Verificar:**
- [ ] Retorna 400 con mensaje de error
- [ ] JSON válido en respuesta
- [ ] Errores de validación detallados

## 📊 Performance

### Tiempos de Carga
**Verificar:**
- [ ] Página inicial < 2s
- [ ] Navegación entre páginas < 500ms
- [ ] API responses < 200ms
- [ ] Upload archivo < 3s (10MB)

### Consola del Navegador
**Verificar:**
- [ ] Sin errores en consola
- [ ] Sin warnings críticos
- [ ] Network requests exitosos

## 🔍 Logs

### Backend
**Verificar en terminal backend:**
- [ ] Requests loggeados (en development)
- [ ] Errores mostrados claramente
- [ ] Formato legible

### Frontend
**Verificar en browser console:**
- [ ] Solo logs relevantes
- [ ] Errores descriptivos

## 💾 Base de Datos

### MongoDB
```bash
mongosh
use tecnoleads
show collections
```

**Verificar:**
- [ ] Collection `users` existe
- [ ] Collection `odoo_credentials` existe
- [ ] Collection `import_histories` existe
- [ ] Datos se guardan correctamente

## ✨ Características Extra

### Animaciones
- [ ] Fade in en páginas
- [ ] Transiciones suaves
- [ ] Hover effects en botones
- [ ] Loading spinners animados

### UX
- [ ] Tooltips informativos
- [ ] Feedback visual en acciones
- [ ] Estados disabled apropiados
- [ ] Placeholders útiles

## 🎯 Prueba End-to-End Completa

1. **Registro** ✅
2. **Login** ✅
3. **Configurar Odoo** ✅
4. **Test conexión Odoo** ✅
5. **Subir archivo CSV** ✅
6. **Ver vista previa** ✅
7. **Importar datos** ✅
8. **Ver resultados** ✅
9. **Revisar historial** ✅
10. **Ver detalles de importación** ✅
11. **Actualizar perfil** ✅
12. **Cambiar contraseña** ✅
13. **Toggle dark mode** ✅
14. **Logout** ✅
15. **Login nuevamente** ✅

## 📝 Notas de Verificación

**Fecha de verificación:** _________________

**Versión:** 1.0.0

**Verificado por:** _________________

**Problemas encontrados:**
```
-
-
-
```

**Estado general:** 
- [ ] ✅ Todo funciona correctamente
- [ ] ⚠️ Funciona con issues menores
- [ ] ❌ Requiere correcciones

---

## 🆘 Troubleshooting Rápido

Si algo falla:

1. ✅ Reiniciar backend y frontend
2. ✅ Verificar que MongoDB esté corriendo
3. ✅ Limpiar caché del navegador
4. ✅ Revisar archivos .env
5. ✅ Verificar consola para errores
6. ✅ Revisar logs del backend
7. ✅ Reinstalar dependencias si es necesario

**¿Aún con problemas?** 
→ Lee [INSTALL.md](INSTALL.md) para guía detallada
→ Revisa [README.md](README.md) para documentación completa

---

**¡Felicitaciones si todo está ✅!** 

Tu instalación de TecnoLeads está lista para usar. 🚀


