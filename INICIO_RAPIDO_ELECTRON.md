# 🎯 TecnoLeads Electron - Guía Visual Rápida

## 📦 ¿Qué Tienes Ahora?

```
TecnoLeads-v1/
│
├── 🌐 Versión WEB (original)
│   ├── start.bat ────────► Inicia en navegador
│   └── setup.bat ────────► Instala dependencias
│
└── 🖥️ Versión DESKTOP (nueva - Electron)
    ├── test-electron.bat ──────► Probar ahora
    ├── build-electron.bat ─────► Crear instalador
    ├── verify-build.bat ───────► Verificar pre-build
    └── electron/ ──────────────► Código Electron
```

## 🚀 Flujo de Trabajo

### Para PROBAR (Desarrollo)

```
┌─────────────────────────────────────────┐
│  1. Ejecuta: test-electron.bat         │
├─────────────────────────────────────────┤
│  ✓ Instala dependencias                │
│  ✓ Verifica configuración              │
│  ✓ Abre aplicación Electron            │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  2. Prueba todas las funciones:        │
│     - Login/Registro                   │
│     - Configurar Odoo                  │
│     - Importar CSV                     │
│     - Ver historial                    │
└─────────────────────────────────────────┘
```

### Para DISTRIBUIR (Producción)

```
┌─────────────────────────────────────────┐
│  1. Configura backend/.env             │
│     Ver: ENV_CONFIG_ELECTRON.md        │
├─────────────────────────────────────────┤
│  ✓ MONGODB_URI (MongoDB Atlas)         │
│  ✓ JWT_SECRET (generado)               │
│  ✓ ENCRYPTION_KEY (generado)           │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  2. (Opcional) Agrega iconos           │
│     electron/assets/icon.ico           │
│     electron/assets/icon.png           │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  3. Verifica: verify-build.bat         │
├─────────────────────────────────────────┤
│  Revisa que TODO esté ✅               │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  4. Compila: build-electron.bat        │
├─────────────────────────────────────────┤
│  ⏱️ Tiempo: 5-10 minutos               │
│  📦 Genera 2 archivos .exe             │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  5. Prueba el instalador               │
│     electron/dist/                     │
│     TecnoLeads-Setup-1.0.0.exe        │
└─────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│  6. Distribuye a usuarios              │
│     - GitHub Releases                  │
│     - Google Drive                     │
│     - Servidor interno                 │
│     - USB                              │
└─────────────────────────────────────────┘
```

## 🎯 Archivos Importantes

### Scripts de Ejecución (.bat)
```
📄 test-electron.bat       → Prueba rápida
📄 build-electron.bat      → Crear instalador
📄 verify-build.bat        → Verificar antes de build
📄 start-electron-dev.bat  → Desarrollo avanzado
```

### Documentación (.md)
```
📖 ELECTRON_SUMMARY.md      → Resumen ejecutivo (este archivo)
📖 ELECTRON_GUIDE.md        → Guía completa (17 secciones)
📖 ELECTRON_QUICK_START.md  → Inicio rápido
📖 BUILD_CHECKLIST.md       → Checklist de 50+ items
📖 ENV_CONFIG_ELECTRON.md   → Configurar variables
```

### Configuración
```
⚙️ backend/.env            → Variables de entorno
⚙️ electron/package.json   → Config de build
🎨 electron/assets/        → Iconos
```

## 📊 Comparación Rápida

| Aspecto | Web (start.bat) | Desktop (Electron) |
|---------|-----------------|-------------------|
| **Para usuarios** | Técnicos | Cualquiera |
| **Instalación** | Node.js + comandos | 1 instalador |
| **Inicio** | 2 terminales | Doble clic |
| **Distribución** | Código fuente | .exe de 200MB |
| **Actualización** | git pull + npm | Reinstalar .exe |
| **MongoDB** | Atlas o local | Solo Atlas |

## 🎨 Personalización

### Cambiar Nombre de la App
```json
// electron/package.json
{
  "name": "mi-app",
  "productName": "Mi App Increíble",
  "version": "1.0.0"
}
```

### Cambiar Iconos
```
1. Crea PNG de 512x512
2. Convierte a .ico: https://convertio.co/png-ico/
3. Guarda en electron/assets/
```

### Cambiar Tamaño de Ventana
```javascript
// electron/main.js
new BrowserWindow({
  width: 1600,  // Cambia esto
  height: 1000, // y esto
  // ...
})
```

## ⚡ Comandos Rápidos

### Desarrollo
```bash
# Probar Electron ahora
test-electron.bat

# O con npm
npm run dev:electron
```

### Producción
```bash
# Crear instalador
build-electron.bat

# O con npm
npm run build:electron
```

### Verificación
```bash
# Verificar configuración
verify-build.bat

# Verificar Node.js
npm run verify
```

## 📝 Checklist Ultra-Rápido

Antes de crear instalador:

- [ ] ✅ `backend/.env` configurado
- [ ] ✅ MongoDB Atlas accesible
- [ ] ✅ Probado localmente con `test-electron.bat`
- [ ] ✅ Iconos agregados (opcional)
- [ ] ✅ Ejecutar `verify-build.bat`
- [ ] ✅ Todo está ✅ verde

Después de crear instalador:

- [ ] ✅ Probar instalador en máquina limpia
- [ ] ✅ Verificar login funciona
- [ ] ✅ Verificar conexión Odoo
- [ ] ✅ Verificar importación CSV
- [ ] ✅ Distribuir a usuarios

## 🆘 Problemas Comunes

### "No se puede conectar a MongoDB"
```
✅ Verifica MONGODB_URI en backend/.env
✅ Verifica whitelist en MongoDB Atlas (0.0.0.0/0)
✅ Prueba conexión con MongoDB Compass
```

### "Build falla"
```
✅ Ejecuta verify-build.bat
✅ Instala dependencias: npm run install:all
✅ Verifica espacio en disco (>2GB)
```

### "Instalador muy grande"
```
ℹ️ Es normal (~200-250MB)
ℹ️ Incluye Chromium + Node.js + App
ℹ️ No se puede reducir mucho
```

## 🎓 Recursos de Aprendizaje

### Para Principiantes
1. Ejecuta: `test-electron.bat`
2. Lee: `ELECTRON_QUICK_START.md`
3. Cuando funcione, lee: `ENV_CONFIG_ELECTRON.md`

### Para Intermedios
1. Lee: `ELECTRON_GUIDE.md`
2. Revisa: `BUILD_CHECKLIST.md`
3. Experimenta con: `electron/main.js`

### Para Avanzados
1. Configura auto-update
2. Personaliza instalador NSIS
3. Agrega splash screen
4. Integra analytics

## 📞 Soporte

**Documentación completa:**
- ELECTRON_GUIDE.md ─── Guía detallada
- BUILD_CHECKLIST.md ── Checklist paso a paso
- ENV_CONFIG_ELECTRON.md ── Config de variables

**Desarrollado por:**
👨‍💻 Felipe Rodríguez - Tecnophone Colombia SAS

---

## 🎉 ¡Listo para Empezar!

### Ahora mismo puedes:

```bash
# 1. Probar la app de escritorio
test-electron.bat

# 2. Si funciona, crear el instalador
build-electron.bat

# 3. Distribuir a usuarios
# electron/dist/TecnoLeads-Setup-1.0.0.exe
```

**¡Es así de simple!** 🚀

---

**Versión:** 1.0.0  
**Actualizado:** Noviembre 2025
