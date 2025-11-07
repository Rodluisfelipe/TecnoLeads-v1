# 🔧 Configuración de Variables de Entorno para Electron

## ⚠️ IMPORTANTE: Antes de crear el instalador

El archivo `backend/.env` se **incluye dentro del instalador**, por lo que debes configurarlo correctamente ANTES de compilar.

## 📋 Paso a Paso

### 1. Copiar el archivo de ejemplo

```bash
# En la carpeta backend/
copy .env.example .env
```

### 2. Generar Secrets Seguros

**Abre PowerShell o CMD** y ejecuta:

```bash
# Para JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Para JWT_REFRESH_SECRET (ejecuta de nuevo para obtener otro diferente)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Para ENCRYPTION_KEY (debe ser hexadecimal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Guarda estos valores** - Los necesitarás en el siguiente paso.

### 3. Editar `backend/.env`

Abre `backend/.env` con un editor de texto y configura:

```env
# ============================================
# CONFIGURACIÓN PARA ELECTRON
# ============================================

PORT=5000
NODE_ENV=production

# Tu URL de MongoDB Atlas (OBLIGATORIO)
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/tecnoleads

# Pega los secrets que generaste arriba
JWT_SECRET=pegar_aqui_el_secret_base64_generado
JWT_REFRESH_SECRET=pegar_aqui_otro_secret_base64_diferente

# Pega la clave hex que generaste
ENCRYPTION_KEY=pegar_aqui_la_clave_hex_de_64_caracteres

# Para Electron, dejar así:
CORS_ORIGIN=http://localhost:5173

# Rate limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Configurar MongoDB Atlas

Si usas MongoDB Atlas, asegúrate de:

#### a) Whitelist de IPs

En MongoDB Atlas → Network Access:

**Opción 1 (Recomendado para app distribuida):**
- Agregar IP: `0.0.0.0/0` (permite cualquier IP)

**Opción 2 (Más seguro):**
- Agregar IPs específicas de tus usuarios

#### b) Usuario de Base de Datos

En MongoDB Atlas → Database Access:
- Usuario: `tecnoleads` (o el que prefieras)
- Contraseña: Una contraseña segura
- Roles: `readWrite` en la base de datos `tecnoleads`

#### c) Connection String

Tu `MONGODB_URI` debe verse así:

```
mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/tecnoleads?retryWrites=true&w=majority
```

Reemplaza:
- `usuario` → Tu usuario de MongoDB
- `password` → Tu contraseña (sin símbolos especiales)
- `cluster0.xxxxx` → Tu cluster real
- `tecnoleads` → Nombre de tu base de datos

## ✅ Verificación

Antes de compilar, verifica que:

- [ ] Archivo `backend/.env` existe
- [ ] `MONGODB_URI` está configurado con tu URL real
- [ ] `JWT_SECRET` tiene al menos 32 caracteres
- [ ] `JWT_REFRESH_SECRET` es diferente a `JWT_SECRET`
- [ ] `ENCRYPTION_KEY` tiene exactamente 64 caracteres hex
- [ ] MongoDB Atlas permite conexiones (0.0.0.0/0 o IPs específicas)
- [ ] Has probado la conexión localmente

## 🧪 Probar Configuración

Antes de crear el instalador, prueba que todo funcione:

```bash
# 1. Inicia el backend
cd backend
npm run dev

# 2. En otra terminal, inicia el frontend
cd frontend
npm run dev

# 3. Abre http://localhost:5173
# 4. Prueba login/registro
# 5. Prueba configurar Odoo
# 6. Prueba importar un CSV
```

Si todo funciona, entonces puedes compilar el instalador.

## 🚀 Compilar Instalador

Una vez verificado que `.env` está correcto:

```bash
# Ejecuta el script de build
build-electron.bat
```

## ⚠️ Consideraciones de Seguridad

### Para Distribución Interna (Empresa)
- ✅ Usar `MONGODB_URI` compartido para todos
- ✅ Secrets iguales para todos los usuarios
- ✅ Un solo instalador con configuración embebida

### Para Distribución Pública
- ⚠️ **NO incluyas credenciales en el instalador**
- ⚠️ Pide al usuario que configure sus propias credenciales
- ⚠️ O usa un servidor de configuración externo

## 📝 Ejemplo Completo

Archivo `backend/.env` configurado:

```env
PORT=5000
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=mongodb+srv://tecnoleads_user:P@ssw0rd123@cluster0.abc123.mongodb.net/tecnoleads?retryWrites=true&w=majority

# JWT Secrets (generados)
JWT_SECRET=xK9mP2nQ5vL8wE3rT6yU1iO4pA7sD0fG2hJ5kL8zX
JWT_REFRESH_SECRET=mN8bV3cX6zA9sD2fG5hJ1kL4pO7qW0eR3tY6uI9oP
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Encryption Key (generado)
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔄 Actualizar Configuración

Si necesitas cambiar la configuración después de distribuir:

1. **Edita** `backend/.env`
2. **Recompila** el instalador con `build-electron.bat`
3. **Redistribuye** el nuevo instalador
4. Los usuarios deben **reinstalar** la aplicación

## 💡 Tips

### Usar Variables de Entorno del Sistema

En lugar de hard-codear valores, puedes usar variables del sistema:

```env
MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
```

Pero esto requiere que cada usuario configure sus propias variables.

### Archivo de Configuración Externo

Considera usar un archivo JSON externo para configuración que puede cambiar:

```javascript
// backend/config.json
{
  "mongodbUri": "...",
  "odooUrl": "..."
}
```

### Encriptar Variables Sensibles

Para mayor seguridad, puedes encriptar valores sensibles antes de incluirlos en el instalador.

## 📞 Ayuda

Si tienes problemas:

1. Verifica que MongoDB Atlas esté accesible
2. Revisa logs del backend en la consola
3. Prueba conexión con MongoDB Compass
4. Verifica firewall de Windows

---

**Recuerda:** Este archivo `.env` se incluye en el instalador y **no debe contener credenciales de producción críticas** si distribuyes públicamente.

Para distribución interna empresarial, es seguro incluir las credenciales compartidas.

---

**Actualizado:** Noviembre 2025  
**Para:** TecnoLeads Electron Build
