# 🗺️ Mapeo de Campos: SECOP II → Odoo CRM

## Resumen Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ARCHIVO CSV SECOP II                              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ TecnoLeads
                              │ Transformación
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ODOO CRM (crm.lead)                             │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Tabla de Mapeo Completo

| Campo CSV SECOP II | Campo Odoo | Tipo | Procesamiento | Visible en Odoo |
|-------------------|------------|------|---------------|-----------------|
| **Entidad** | `partner_name` | Char | Limpieza de texto | ✅ Cliente/Empresa |
| **Objeto** | Usado en `name` + `description` | Text | Generación nombre + descripción | ✅ Título + Notas |
| **Cuantía** | `expected_revenue` | Float | Conversión monetaria | ✅ Ingreso Esperado |
| **Modalidad** | `x_modalidad` | Char | Limpieza + Usado en `name` | 🔧 Campo personalizado |
| **Número** | `x_numero_proceso` | Char | Limpieza + Usado en `name` | 🔧 Campo personalizado |
| **Estado** | `x_estado` | Selection | Mapeo a probabilidad | 🔧 Campo personalizado |
| **F. Publicación** | `date_deadline` | Date | Parseo timestamp → YYYY-MM-DD | ✅ Cierre Esperado |
| **Ubicación** | `city` + `x_departamento` | Char | Split por ":" | ✅ Ciudad + 🔧 Depto |
| **Actividad Económica** | `x_actividad_economica` | Text | Limpieza de texto | 🔧 Campo personalizado |
| **Códigos UNSPSC** | `x_codigos_unspsc` | Char | Limpieza de texto | 🔧 Campo personalizado |
| **Enlace** | `website` | Char | Validación URL | ✅ Sitio Web |
| **Portal de origen** | `x_portal_origen` | Char | Limpieza de texto | 🔧 Campo personalizado |
| **Contratista(s)** | `x_contratistas` | Text | Limpieza de texto | 🔧 Campo personalizado |

**Leyenda:**
- ✅ = Campo estándar de Odoo (ya existe)
- 🔧 = Campo personalizado (debe crearse)

## 🎯 Campos Generados Automáticamente

### 1. **name** (Nombre de la Oportunidad)

**Fórmula:**
```javascript
name = Número
```

**Ejemplos:**
- Número: `"SASI-029-SG-2025"` → **name: "SASI-029-SG-2025"**
- Número: `"MC-048-2025"` → **name: "MC-048-2025"**
- Número: `"LP-001-2025"` → **name: "LP-001-2025"**

**Nota:** El nombre de la oportunidad es **exactamente** el número del proceso SECOP II.

### 2. **probability** (Probabilidad)

**Calculado según el Estado:**

| Estado | Probabilidad |
|--------|--------------|
| Convocatoria / Publicado | 25% |
| Evaluación | 50% |
| Adjudicado / Celebrado | 100% |
| Desierto / Cancelado | 0% |
| Por defecto | 10% |

### 3. **description** (Descripción Completa)

Generada automáticamente con formato estructurado:

```
═══════════════════════════════════════════════════
INFORMACIÓN DEL PROCESO DE CONTRATACIÓN
═══════════════════════════════════════════════════

🏢 ENTIDAD CONTRATANTE:
   INSTITUTO NACIONAL DE MEDICINA LEGAL Y CIENCIAS FORENSES

📋 OBJETO DEL CONTRATO:
   ADQUISICIÓN DE CÁMARAS FOTOGRÁFICAS Y ACCESORIOS...

💰 CUANTÍA:
   $455.017.822

───────────────────────────────────────────────────
DETALLES DEL PROCESO
───────────────────────────────────────────────────

⚖️  Modalidad: Selección Abreviada Subasta Inversa
🔢 Número de Proceso: SASI-029-SG-2025
📊 Estado: Convocatoria
📅 Fecha de Publicación: 2025-10-20 17:23:10
📍 Ubicación: Cundinamarca : Bogotá D.C.

───────────────────────────────────────────────────
CLASIFICACIÓN
───────────────────────────────────────────────────

🏷️  Actividad Económica: Equipos audiovisuales
🔖 Códigos UNSPSC: 45121500 | 45121600

───────────────────────────────────────────────────
ENLACES
───────────────────────────────────────────────────

🔗 Ver proceso completo:
   https://col.licitaciones.info/detalle-contrato?random=...
📡 Portal de origen: secop II

═══════════════════════════════════════════════════
Importado automáticamente por TecnoLeads
═══════════════════════════════════════════════════
```

## 🔄 Transformaciones Especiales

### Ubicación → Ciudad + Departamento

**Formato de entrada:** `"Departamento : Ciudad"`

**Ejemplo:**
```
"Tolima : Espinal" → {
  city: "Espinal",
  x_departamento: "Tolima"
}
```

### Cuantía → Expected Revenue

**Procesamiento:**
1. Eliminar símbolos: `$`, `,`, `.`
2. Convertir a número decimal
3. Guardar como float

**Ejemplo:**
```
"$455.017.822" → 455017822.00
"142831615" → 142831615.00
```

### Fecha → Date Deadline

**Formato de entrada:** `"YYYY-MM-DD HH:mm:ss"`

**Procesamiento:**
1. Split por espacio
2. Tomar solo la parte de fecha
3. Validar formato
4. Convertir a Date

**Ejemplo:**
```
"2025-10-20 17:23:10" → "2025-10-20"
```

## 📋 Ejemplo Completo de Transformación

### Entrada (CSV)

```csv
Entidad,Objeto,Cuantía,Modalidad,Número,Estado,"F. Publicación",Ubicación,"Actividad Económica","Códigos UNSPSC",Enlace,"Portal de origen",Contratista(s)
"ALCALDÍA MUNICIPAL DE EL ESPINAL","CONTRATAR LA COMPRA DE IMPRESORAS Y ESCANNER",142831615,"Selección Abreviada Subasta Inversa",SASI-06-2025,Convocatoria,"2025-10-20 17:53:34","Tolima : Espinal","Suministro partes de computador",32131000,https://col.licitaciones.info/detalle-contrato?random=123,"secop II",
```

### Salida (JSON para Odoo)

```json
{
  "type": "opportunity",
  "name": "SASI-06-2025",
  "partner_id": 1234,
  "expected_revenue": 142831615,
  "probability": 25,
  "date_deadline": "2025-10-20",
  "city": "Espinal",
  "email_from": "contacto@alcaldia.gov.co",
  "phone": "1234567890",
  "description": "═══════════════...(descripción completa)...═══════",
  "website": "https://col.licitaciones.info/detalle-contrato?random=123"
}
```

### Visualización en Odoo CRM

```
┌─────────────────────────────────────────────────────────────┐
│ SASI-06-2025                                                │
├─────────────────────────────────────────────────────────────┤
│ 💰 Ingreso esperado: $142.831.615      📊 Probabilidad: 25% │
│ 👤 Cliente: ALCALDÍA MUNICIPAL DE EL ESPINAL (ID: 1234)    │
│ 📧 Email: contacto@alcaldia.gov.co (autocompletado)        │
│ 📞 Teléfono: 1234567890 (autocompletado)                   │
│ 📅 Cierre esperado: 2025-10-20                              │
│ 📍 Ciudad: Espinal                                          │
│                                                             │
│ 🔗 Website: https://col.licitaciones.info/...              │
│                                                             │
│ 📝 Notas internas:                                         │
│ ═══════════════════════════════════════════════════        │
│ INFORMACIÓN DEL PROCESO DE CONTRATACIÓN                    │
│ ═══════════════════════════════════════════════════        │
│                                                             │
│ 🏢 ENTIDAD CONTRATANTE:                                    │
│    ALCALDÍA MUNICIPAL DE EL ESPINAL                        │
│                                                             │
│ 📋 OBJETO DEL CONTRATO:                                    │
│    CONTRATAR LA COMPRA DE IMPRESORAS Y ESCANNER...        │
│                                                             │
│ ⚖️  Modalidad: Selección Abreviada Subasta Inversa        │
│ 🔢 Número de Proceso: SASI-06-2025                        │
│ 📊 Estado: Convocatoria                                    │
│ 📍 Ubicación: Tolima : Espinal                             │
│ 🏷️  Actividad Económica: Suministro partes de computador  │
│ 🔖 Códigos UNSPSC: 32131000                                │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Campos Opcionales (Si existen en el CSV)

| Campo CSV | Campo Odoo | Uso |
|-----------|------------|-----|
| Email Contacto | `email_from` | Email del contacto |
| Teléfono Contacto | `phone` | Teléfono del contacto |
| Nombre del Proceso | `name` | Si no hay Modalidad+Número |
| Descripción del Proceso | `description` | Si existe |
| Valor del Contrato | `expected_revenue` | Si no hay Cuantía |

## ✅ Validaciones Aplicadas

1. **Nombre requerido**: El campo `name` SIEMPRE debe tener valor
2. **URL válida**: El campo `website` valida formato de URL
3. **Email válido**: El campo `email_from` valida formato de email
4. **Teléfono limpio**: Solo números y símbolo `+`
5. **Texto limpio**: Elimina espacios múltiples y saltos de línea

## 🔧 Notas para Desarrolladores

### Agregar Nuevos Campos

Para agregar un nuevo campo de SECOP II:

1. Agregar al `fieldMapping` en `dataTransformer.service.js`
2. Procesar en `transformRecord()`
3. Si es campo personalizado, usar prefijo `x_`
4. Documentar en esta guía
5. Crear el campo en Odoo (ver `CONFIGURACION_ODOO_CAMPOS.md`)

### Modificar Transformaciones

Las transformaciones están en:
- `backend/src/services/dataTransformer.service.js`

Métodos principales:
- `transformRecord()`: Transformación principal
- `buildDescription()`: Genera descripción
- `parseLocation()`: Procesa ubicación
- `parseDateTimestamp()`: Procesa fechas
- `parseMoneyValue()`: Procesa valores monetarios

## 📚 Ver También

- [FORMATO_SECOP_II.md](./FORMATO_SECOP_II.md) - Formato de archivo soportado
- [CONFIGURACION_ODOO_CAMPOS.md](./CONFIGURACION_ODOO_CAMPOS.md) - Cómo crear campos en Odoo
- [README.md](./README.md) - Documentación general

