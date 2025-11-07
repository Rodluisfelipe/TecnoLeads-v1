# 📋 Instrucciones de Instalación - TecnoLeads

## Requisitos del Sistema

Para que TecnoLeads funcione correctamente en cualquier computador, necesita:

### 1. Node.js (OBLIGATORIO)
**¿Qué es?** Runtime de JavaScript necesario para ejecutar el backend de la aplicación.

**Instalación:**
1. Descargar desde: https://nodejs.org/
2. Elegir la versión **LTS** (Long Term Support) - recomendada
3. Ejecutar el instalador y seguir los pasos (Next, Next, Finish)
4. Reiniciar el computador después de instalar

**Verificar instalación:**
- Abrir PowerShell o CMD
- Ejecutar: `node --version`
- Debe mostrar algo como: `v20.x.x`

---

### 2. Google Chrome (REQUERIDO para extracción automática de fechas)

**¿Para qué sirve?** TecnoLeads usa Chrome para visitar automáticamente las URL de licitaciones.info y extraer las fechas de cierre.

**Instalación:**
1. Descargar desde: https://www.google.com/chrome/
2. Ejecutar el instalador
3. Chrome se instalará automáticamente en la ruta estándar

**Rutas donde TecnoLeads busca Chrome (Windows):**
- `C:\Program Files\Google\Chrome\Application\chrome.exe`
- `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
- `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`

**⚠️ ¿Qué pasa si NO instalo Chrome?**
- La aplicación funcionará normalmente
- Podrás importar datos a Odoo
- **PERO** no podrá extraer automáticamente las fechas de cierre
- Verás un mensaje: "Chrome no está disponible"
- Las fechas deberán ingresarse manualmente en Odoo

---

## Solución de Problemas

### Error: "spawn node ENOENT"
**Causa:** Node.js no está instalado
**Solución:** Instalar Node.js siguiendo las instrucciones del punto 1

### Error: "Navigation error" al extraer fechas
**Causa:** Chrome no está instalado o no se encuentra en las rutas estándar
**Solución:** 
1. Instalar Google Chrome (punto 2)
2. O si ya está instalado en una ruta diferente, anotar la ruta personalizada

### La aplicación no abre o se cierra inmediatamente
**Causa:** Node.js no está instalado
**Solución:** Instalar Node.js y reiniciar el computador

---

## Instalación de TecnoLeads

1. **Extraer el ZIP**
   - Descomprimir `TecnoLeads-Portable-v1.0.0.zip`
   - En cualquier carpeta (ej: `C:\TecnoLeads\`)

2. **Verificar requisitos**
   - Node.js instalado ✅
   - Chrome instalado ✅ (opcional pero recomendado)

3. **Ejecutar**
   - Doble clic en `TecnoLeads.exe`
   - La aplicación iniciará automáticamente:
     - Backend en puerto 5000
     - Ventana de la aplicación

4. **Primer uso**
   - Usuario: `admin@tecnoleads.com`
   - Contraseña: `admin123`

---

## Notas Adicionales

- **No requiere instalación:** Es portable, se ejecuta desde donde lo extraes
- **Internet requerido:** Para conectarse a MongoDB Atlas y Odoo
- **Cierre correcto:** Cerrar la ventana de la aplicación (el backend se cierra automáticamente)
- **Múltiples instancias:** Solo se puede ejecutar una instancia a la vez

---

## Soporte

Para problemas o dudas:
- Revisar primero esta documentación
- Verificar que Node.js y Chrome estén instalados
- Revisar los logs en la consola que se abre al ejecutar
