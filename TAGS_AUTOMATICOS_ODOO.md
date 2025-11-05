# 🏷️ Tags Automáticos en Odoo CRM

## ✨ Nueva Funcionalidad: Creación Automática de Tags

**TecnoLeads ahora crea y asigna automáticamente los tags (etiquetas)** que antes se agregaban manualmente en Odoo.

---

## 🎯 Tags que se Crean Automáticamente

### 1. **Presentación** (Portal de origen)
- **Origen CSV:** `Portal de origen`
- **Ejemplo:** `"secop II"` → Tag: `"SECOP II"`
- **Color en Odoo:** Amarillo (configurable)

### 2. **Etiquetas** (Actividad Económica)
- **Origen CSV:** `Actividad Económica`
- **Ejemplo:** `"Equipos audiovisuales"` → Tag: `"EQUIPOS AUDIOVISUALES"`
- **Color en Odoo:** Verde/Cyan (configurable)

### 3. **Empresa** (TECNOPHONE)
- **Origen:** Automático
- **Tag:** `"TECNOPHONE"`
- **Color en Odoo:** Rojo/Rosa (configurable)

---

## 📋 Ejemplo de Transformación

### CSV de Entrada

```csv
Entidad,Portal de origen,Actividad Económica
"INSTITUTO NACIONAL...",secop II,"Equipos audiovisuales"
```

### Resultado en Odoo

```
┌─────────────────────────────────────────────────┐
│ Subasta SASI-029-SG-2025                        │
├─────────────────────────────────────────────────┤
│ Presentación:  [SECOP II]  ← Tag amarillo       │
│ Empresa:       [TECNOPHONE] ← Tag rojo          │
│ Etiquetas:     [EQUIPOS AUDIOVISUALES]          │
│                ← Tag verde                      │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Flujo Automático

```
1. CSV SECOP II
   ↓
   Portal de origen: "secop II"
   Actividad Económica: "Equipos audiovisuales"
   ↓
2. TecnoLeads procesa
   ↓
   ¿Existe tag "SECOP II"?
   ↓
   ┌─────────┬─────────┐
   │   SÍ    │   NO    │
   └─────────┴─────────┘
       │          │
       ▼          ▼
   REUTILIZAR  CREAR NUEVO
   ID: 123     ID: 456
   ↓           ↓
3. Asignar tags a la oportunidad
   ↓
   tag_ids = [123, 456, 789]
   ↓
4. Guardar en Odoo
   ✅ Tags asignados automáticamente
```

---

## 📊 Estadísticas

Después de importar, verás en los logs:

```
✅ Tag encontrado: SECOP II (ID: 123)
📝 Creando nuevo tag: EQUIPOS AUDIOVISUALES
✅ Tag encontrado: TECNOPHONE (ID: 789)
  🏷️  Tags asignados: 3 tags
```

---

## 🎨 Personalización de Tags en Odoo

Los tags se crean **sin color por defecto**. Para asignarles colores:

1. Ve a **CRM** → **Configuración** → **Tags**
2. Busca el tag (ej: "SECOP II")
3. Haz clic en **Editar**
4. Selecciona un **Color**
5. Guarda

**Colores recomendados:**
- `SECOP II` → Amarillo
- `TECNOPHONE` → Rojo/Rosa
- Actividades → Verde/Cyan

---

## 🔍 Búsqueda Inteligente de Tags

El sistema busca tags **exactamente por nombre**:

| Texto en CSV | Tag en Odoo | ¿Coincide? |
|--------------|-------------|------------|
| `"secop II"` | `"SECOP II"` | ✅ SÍ (se convierte a mayúsculas) |
| `"equipos audiovisuales"` | `"EQUIPOS AUDIOVISUALES"` | ✅ SÍ |
| `"SECOP I"` | `"SECOP I"` | ✅ SÍ (se crea si no existe) |

---

## 💾 Formato Técnico

En Odoo, los tags se asignan usando `tag_ids`:

```javascript
{
  "tag_ids": [[6, 0, [123, 456, 789]]]
}
```

Donde:
- `6` = Reemplazar todos los tags
- `0` = (no usado)
- `[123, 456, 789]` = IDs de los tags a asignar

---

## 🛡️ Prevención de Duplicados

El sistema **NO crea tags duplicados**:

1. Busca el tag por nombre
2. Si existe, reutiliza su ID
3. Si NO existe, lo crea
4. Asigna el ID al lead

**Ejemplo:**

Primera importación:
```
📝 Creando nuevo tag: SECOP II (ID: 123)
```

Segunda importación:
```
✅ Tag encontrado: SECOP II (ID: 123) ← Reutilizado
```

---

## 📝 Tags Creados Automáticamente

### Por Portal de Origen

| CSV | Tag Creado |
|-----|------------|
| `"secop II"` | `SECOP II` |
| `"secop I"` | `SECOP I` |
| `"SECOP"` | `SECOP` |

### Por Actividad Económica

| CSV | Tag Creado |
|-----|------------|
| `"Equipos audiovisuales"` | `EQUIPOS AUDIOVISUALES` |
| `"Suministro equipos de cómputo"` | `SUMINISTRO EQUIPOS DE COMPUTO` |
| `"Suministro partes de computador"` | `SUMINISTRO PARTES DE COMPUTADOR` |

### Fijo

| Tag | Descripción |
|-----|-------------|
| `TECNOPHONE` | Se agrega siempre para identificar oportunidades importadas automáticamente |

---

## 🔧 Configuración Opcional

### Deshabilitar Tag TECNOPHONE

Si NO quieres que se agregue el tag `TECNOPHONE` automáticamente, edita:

```javascript
// backend/src/services/odoo.service.js

// Comentar estas líneas:
/*
try {
  const tecnoTagId = await this.findOrCreateTag('TECNOPHONE');
  if (tecnoTagId) tagIds.push(tecnoTagId);
} catch (tagError) {
  console.warn(`⚠️ Error buscando/creando tag TECNOPHONE: ${tagError.message}`);
}
*/
```

### Agregar Más Tags Automáticos

Para agregar tags adicionales, edita el método `createLeads`:

```javascript
// Ejemplo: Tag de Estado
if (leadData.estado) {
  try {
    const estadoTagId = await this.findOrCreateTag(leadData.estado.toUpperCase());
    if (estadoTagId) tagIds.push(estadoTagId);
  } catch (tagError) {
    console.warn(`⚠️ Error creando tag estado: ${tagError.message}`);
  }
}
```

---

## 📈 Ventajas

1. ✅ **Automatiza** el trabajo manual de agregar tags
2. ✅ **Crea tags automáticamente** si no existen
3. ✅ **Reutiliza tags existentes** (no duplica)
4. ✅ **Facilita búsquedas** en Odoo por tag
5. ✅ **Identifica origen** de las oportunidades (TECNOPHONE tag)
6. ✅ **Clasifica por actividad** económica automáticamente

---

## 🎯 Resultado Final en Odoo

Cada oportunidad importada tendrá:

```
┌─────────────────────────────────────────────────────────┐
│ Subasta SASI-029-SG-2025                                │
├─────────────────────────────────────────────────────────┤
│ 💰 $455.017.822          📊 2,48%                       │
│                                                         │
│ 👤 INSTITUTO NACIONAL... (autovinculado)                │
│ 📧 sgeneral@medicinalegal.gov.co (autocompletado)      │
│ 📞 4069944/77 EXT. 1829 (autocompletado)               │
│                                                         │
│ 🏷️  Presentación:  [SECOP II]                          │
│ 🏷️  Empresa:       [TECNOPHONE]                        │
│ 🏷️  Etiquetas:     [EQUIPOS AUDIOVISUALES]             │
│                                                         │
│ 📅 Cierre: 11/11/2025                                   │
│ 📍 Ciudad: Bogotá D.C.                                  │
│ 🔗 Website: https://col.licitaciones.info/...          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Debugging

### Ver Tags Creados

En el backend verás logs como:

```bash
✅ Partner encontrado: INSTITUTO NACIONAL... (ID: 1234)
  📧 Email autocompletado: sgeneral@medicinalegal.gov.co
  📞 Teléfono autocompletado: 4069944/77

✅ Tag encontrado: SECOP II (ID: 123)
📝 Creando nuevo tag: EQUIPOS AUDIOVISUALES
✅ Tag encontrado: TECNOPHONE (ID: 789)
  🏷️  Tags asignados: 3 tags

✅ Lead creado: Subasta SASI-029-SG-2025 (ID: 5678)
```

### Verificar en Odoo

1. Ve a **CRM** → **Oportunidades**
2. Abre la oportunidad importada
3. Verás los tags en:
   - Campo **"Presentación"**
   - Campo **"Empresa"**
   - Campo **"Etiquetas"**

---

## ⚠️ Casos Especiales

### 1. Tag Sin Actividad Económica

Si el CSV no tiene `Actividad Económica`:
```
Portal de origen: "secop II"
Actividad Económica: (vacío)
```

**Resultado:**
- ✅ Se crea tag `SECOP II`
- ✅ Se crea tag `TECNOPHONE`
- ⏭️ NO se crea tag de actividad económica

### 2. Error al Crear Tag

Si falla la creación del tag:
```
⚠️ Error creando tag actividad: Permission denied
```

**Resultado:**
- ⏭️ Se omite ese tag
- ✅ Continúa con los demás tags
- ✅ El lead se crea igual (sin ese tag)

### 3. Múltiples Actividades

Si hay múltiples actividades separadas por `|`:
```
"Equipos audiovisuales | Suministro equipos"
```

**Resultado actual:**
- Se crea **UN SOLO tag** con el texto completo
- `"EQUIPOS AUDIOVISUALES | SUMINISTRO EQUIPOS"`

**Para crear tags separados**, modificar el código.

---

## 🚀 Prueba

Para verificar que funciona:

1. **Importa el CSV de ejemplo**
2. **Revisa los logs del backend:**
   ```bash
   cd backend
   npm run dev
   ```
3. **Verifica en Odoo:**
   - Abre la oportunidad
   - Verifica que tenga los 3 tags
4. **Importa el mismo archivo nuevamente:**
   - Debería reutilizar los tags existentes
   - Log: `✅ Tag encontrado: ...`

---

**Generado por:** TecnoLeads v1.0  
**Funcionalidad:** Tags Automáticos en Odoo  
**Fecha:** Octubre 2025


