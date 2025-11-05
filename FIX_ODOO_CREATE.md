# 🐛 FIX: Leads No Se Creaban en Odoo

## ❌ Problema Encontrado
Los leads mostraban importación "exitosa" (200 OK) pero **NO se estaban creando en Odoo**.

## 🔍 Causa Raíz
**Error en el formato del parámetro XML-RPC**

En `backend/src/services/odoo.service.js` línea 373:

```javascript
// ❌ INCORRECTO (antes)
client.methodCall('execute_kw', [
  this.db,
  this.uid,
  this.password,
  'crm.lead',
  'create',
  [leadData]  // ❌ Formato incorrecto
])

// ✅ CORRECTO (ahora)
client.methodCall('execute_kw', [
  this.db,
  this.uid,
  this.password,
  'crm.lead',
  'create',
  [[leadData]]  // ✅ Odoo XML-RPC espera [[vals]]
])
```

## 📖 Explicación Técnica
Odoo XML-RPC API requiere que el método `create` reciba:
- **Parámetro**: Una lista de diccionarios `[[vals]]`
- **No**: Un solo diccionario `[vals]`

El formato `[leadData]` era interpretado como argumentos posicionales, no como datos del lead.

## ✅ Solución Aplicada
Cambio en `createLead()` método:
```javascript
'create',
[[leadData]]  // Ahora envía formato correcto
```

## 🔄 Pasos para Aplicar
1. ✅ Cambio aplicado en el código
2. ⚠️ **DEBES REINICIAR** el servidor backend:
   ```bash
   cd backend
   npm run dev
   ```
3. Volver a ejecutar importación desde frontend

## 🧪 Verificación
Después de reiniciar:
1. Subir archivo CSV desde frontend
2. Ejecutar importación
3. Verificar en Odoo CRM → Oportunidades/Clientes Potenciales
4. Confirmar que aparecen los 10 leads creados

## 📊 Resultado Esperado
```
✅ 10 leads creados en Odoo
✅ Partners creados/encontrados
✅ Tags asignados correctamente
✅ Importación real (no solo simulada)
```

---
**Fecha**: 4 Nov 2025  
**Archivo modificado**: `backend/src/services/odoo.service.js`  
**Línea**: 373
