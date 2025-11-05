# 🔍 Búsqueda Automática de Clientes en Odoo

## ✨ Nueva Funcionalidad Implementada

**TecnoLeads ahora busca automáticamente los clientes en Odoo** antes de crear las oportunidades. Si el cliente ya existe, **completa automáticamente** su información de contacto (email, teléfono, etc.).

---

## 🎯 ¿Cómo Funciona?

### Flujo Automático

```
1. CSV SECOP II
   ↓
   Campo "Entidad" → "INSTITUTO NACIONAL DE MEDICINA LEGAL..."
   ↓
2. TecnoLeads busca en Odoo
   ↓
   ¿Existe un cliente con ese nombre?
   ↓
   ┌─────────────┬─────────────┐
   │     SÍ      │     NO      │
   └─────────────┴─────────────┘
        │              │
        ▼              ▼
   REUTILIZAR      CREAR NUEVO
   ↓               ↓
   - ID: 1234      - ID: 5678
   - Email: ✅     - Email: ❌
   - Tel: ✅       - Tel: ❌
   - Ciudad: ✅    - Ciudad: desde CSV
   ↓               ↓
3. Crear Oportunidad
   ↓
   ✅ Vinculada al cliente (partner_id)
   ✅ Email autocompletado (si existía)
   ✅ Teléfono autocompletado (si existía)
```

---

## 📋 Ejemplo Real

### Escenario 1: Cliente YA EXISTE en Odoo

**CSV de entrada:**
```csv
Entidad,Cuantía,Número
"INSTITUTO NACIONAL DE MEDICINA LEGAL",455017822,SASI-029-SG-2025
```

**Cliente en Odoo:**
```javascript
{
  id: 1234,
  name: "INSTITUTO NACIONAL DE MEDICINA LEGAL Y CIENCIAS FORENSES",
  email: "sgeneral@medicinalegal.gov.co",
  phone: "4069944/77 EXT. 1829",
  city: "Bogotá D.C."
}
```

**Resultado en la Oportunidad:**
```javascript
{
  name: "Subasta SASI-029-SG-2025",
  partner_id: 1234,  // ← Vinculado al cliente existente
  email_from: "sgeneral@medicinalegal.gov.co",  // ← ✅ AUTOCOMPLETADO
  phone: "4069944/77 EXT. 1829",  // ← ✅ AUTOCOMPLETADO
  expected_revenue: 455017822,
  ...
}
```

**Logs del backend:**
```
✅ Partner encontrado: INSTITUTO NACIONAL DE MEDICINA LEGAL (ID: 1234)
  📧 Email autocompletado: sgeneral@medicinalegal.gov.co
  📞 Teléfono autocompletado: 4069944/77 EXT. 1829
```

---

### Escenario 2: Cliente NO EXISTE

**CSV de entrada:**
```csv
Entidad,Cuantía,Número
"ALCALDÍA MUNICIPAL DE NUEVO MUNICIPIO",142831615,SASI-06-2025
```

**Resultado:**
1. **Se crea automáticamente** el cliente en Odoo:
   ```javascript
   {
     id: 5678,  // ← Nuevo ID
     name: "ALCALDÍA MUNICIPAL DE NUEVO MUNICIPIO",
     customer_rank: 1,  // Marcado como cliente
     city: "Nuevo Municipio"  // Desde CSV
   }
   ```

2. **Se crea la oportunidad** vinculada al nuevo cliente:
   ```javascript
   {
     name: "Subasta SASI-06-2025",
     partner_id: 5678,  // ← Vinculado al nuevo cliente
     expected_revenue: 142831615,
     ...
   }
   ```

**Logs del backend:**
```
📝 Creando nuevo partner: ALCALDÍA MUNICIPAL DE NUEVO MUNICIPIO
```

---

## 📊 Estadísticas de Importación

Después de la importación, verás:

```javascript
{
  success: true,
  message: "Importación completada",
  data: {
    total: 10,
    successful: 8,
    duplicates: 1,
    failed: 1,
    
    // ✨ NUEVAS ESTADÍSTICAS
    partnersFound: 5,     // ← Clientes que ya existían
    partnersCreated: 3    // ← Clientes creados automáticamente
  }
}
```

---

## 🔍 Búsqueda Inteligente

La búsqueda de clientes usa **`ilike`** (insensible a mayúsculas/minúsculas) para encontrar coincidencias:

| Texto en CSV | Búsqueda en Odoo | ¿Coincide? |
|--------------|------------------|------------|
| `"INSTITUTO NACIONAL DE MEDICINA LEGAL"` | `"Instituto Nacional de Medicina Legal y Ciencias Forenses"` | ✅ SÍ |
| `"alcaldía municipal"` | `"ALCALDÍA MUNICIPAL DE ESPINAL"` | ✅ SÍ (parcial) |
| `"Gobernación de Boyacá"` | `"GOBERNACIÓN DE BOYACÁ"` | ✅ SÍ |

**Nota:** Si hay múltiples coincidencias, se usa la **primera** encontrada.

---

## 💾 Datos que se Completan Automáticamente

Si el cliente **YA EXISTE** en Odoo:

| Campo | Autocompletado | Prioridad |
|-------|----------------|-----------|
| `partner_id` | ✅ Siempre | ID del cliente |
| `email_from` | ✅ Si existe | Email del cliente |
| `phone` | ✅ Si existe | Teléfono o móvil |
| `city` | ⚠️ Del CSV | No se sobrescribe |

Si el cliente **NO EXISTE**, se crea con:

| Campo | Origen | Valor |
|-------|--------|-------|
| `name` | CSV | Entidad |
| `customer_rank` | Automático | `1` (marcado como cliente) |
| `city` | CSV | Ubicación (ciudad) |
| `email` | CSV | (si existe) |
| `phone` | CSV | (si existe) |

---

## 🛡️ Prevención de Duplicados

El sistema **NO crea clientes duplicados**. Si encuentra un cliente con nombre similar:
- ✅ Reutiliza el cliente existente
- ✅ Actualiza la oportunidad con sus datos
- ✅ No sobrescribe información del cliente existente

---

## 🔧 Configuración Técnica

### Código Backend

**Método principal:** `findOrCreatePartner()`

```javascript
// backend/src/services/odoo.service.js

async findOrCreatePartner(partnerName, extraData = {}) {
  // 1. Buscar cliente existente
  const existingPartners = await this.searchPartner(partnerName);
  
  if (existingPartners.length > 0) {
    // Cliente existe - obtener datos completos
    const partnerData = await this.getPartnerData(existingPartners[0]);
    return {
      id: existingPartners[0],
      email: partnerData.email,
      phone: partnerData.phone,
      existing: true,
    };
  }
  
  // 2. Cliente NO existe - crear nuevo
  const newPartnerId = await this.createPartner({
    name: partnerName,
    customer_rank: 1,
    ...extraData,
  });
  
  return {
    id: newPartnerId,
    existing: false,
  };
}
```

### Integración en la Importación

```javascript
// Antes de crear cada lead
if (leadData.partner_name) {
  const partner = await findOrCreatePartner(leadData.partner_name, {
    city: leadData.city,
    email: leadData.email_from,
    phone: leadData.phone,
  });
  
  // Usar partner_id en lugar de partner_name
  delete leadData.partner_name;
  leadData.partner_id = partner.id;
  
  // Autocompletar datos si el cliente ya existía
  if (partner.existing) {
    if (partner.email) leadData.email_from = partner.email;
    if (partner.phone) leadData.phone = partner.phone;
  }
}
```

---

## 📈 Ventajas

1. ✅ **Evita duplicados** de clientes en Odoo
2. ✅ **Completa automáticamente** información de contacto
3. ✅ **Vincula correctamente** oportunidades con clientes
4. ✅ **Reutiliza datos existentes** del CRM
5. ✅ **Crea clientes nuevos** automáticamente si no existen
6. ✅ **Estadísticas detalladas** de clientes encontrados vs creados

---

## 🎨 Visualización en el Frontend

Después de importar, verás en el historial:

```
╔════════════════════════════════════════════════╗
║  Importación Completada                        ║
╠════════════════════════════════════════════════╣
║  📊 Total de registros: 10                     ║
║  ✅ Exitosos: 8                                ║
║  🔄 Duplicados: 1                              ║
║  ❌ Fallidos: 1                                ║
║                                                ║
║  👥 CLIENTES:                                  ║
║  ✅ Encontrados en Odoo: 5                     ║
║  📝 Creados nuevos: 3                          ║
╚════════════════════════════════════════════════╝
```

---

## 🔍 Debugging

Si necesitas ver qué está pasando, revisa los logs del backend:

```bash
cd backend
npm run dev
```

**Logs que verás:**
```
✅ Partner encontrado: INSTITUTO NACIONAL... (ID: 1234)
  📧 Email autocompletado: contact@entity.gov.co
  📞 Teléfono autocompletado: 1234567

📝 Creando nuevo partner: ALCALDÍA MUNICIPAL...
```

---

## ⚠️ Casos Especiales

### 1. Múltiples Coincidencias

Si hay varios clientes con nombres similares:
```
"ALCALDÍA MUNICIPAL" → Encuentra 3 clientes
```

**Comportamiento:** Se usa el **primer** resultado.

**Solución:** Asegúrate de que los nombres en el CSV sean lo más específicos posible.

---

### 2. Cliente Sin Email/Teléfono

Si el cliente existe pero no tiene email/teléfono:
```
Cliente ID: 1234
Email: NULL
Phone: NULL
```

**Resultado:** Los campos quedarán vacíos en la oportunidad (igual que antes).

---

### 3. Error en la Búsqueda

Si falla la búsqueda/creación del cliente:
```
⚠️ Error buscando/creando partner: Connection timeout
```

**Resultado:** El sistema continúa usando `partner_name` (texto) como fallback.

---

## 🚀 Prueba

Para probar esta funcionalidad:

1. **Importa el CSV de ejemplo:**
   ```bash
   contratos plantilla.csv
   ```

2. **Revisa los logs del backend:**
   - Verás qué clientes se encontraron
   - Verás qué clientes se crearon
   - Verás qué datos se autocompletaron

3. **Verifica en Odoo:**
   - Abre las oportunidades creadas
   - Verifica que el campo "Contacto" tenga el cliente vinculado
   - Verifica que email y teléfono estén completos (si el cliente existía)

4. **Importa el mismo archivo nuevamente:**
   - Ahora TODOS los clientes deberían ser "encontrados"
   - `partnersFound: 10, partnersCreated: 0`

---

## 📚 Referencias

- **Modelo en Odoo:** `res.partner`
- **Campos importantes:**
  - `name` - Nombre del cliente
  - `email` - Email de contacto
  - `phone` - Teléfono fijo
  - `mobile` - Teléfono móvil
  - `customer_rank` - Marca como cliente (1 = es cliente)
  - `city` - Ciudad
  - `state_id` - Departamento/Estado
  - `country_id` - País

---

**¿Tienes dudas?** Revisa los logs del backend o contacta al equipo de soporte.

---

**Generado por:** TecnoLeads v1.0  
**Funcionalidad:** Búsqueda Automática de Clientes  
**Fecha:** Octubre 2025


