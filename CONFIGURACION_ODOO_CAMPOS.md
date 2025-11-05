# Configuración de Campos Personalizados en Odoo CRM

## 📋 Descripción

Para que TecnoLeads funcione correctamente con todos los datos de SECOP II, necesitas crear campos personalizados en tu instancia de Odoo CRM.

## 🔧 Campos Requeridos

### Campos Estándar (Ya existen en Odoo)

Estos campos NO necesitan ser creados, ya vienen por defecto:

| Campo en Odoo | Descripción | Dato de SECOP II |
|---------------|-------------|------------------|
| `name` | Nombre de la oportunidad | Modalidad + Número |
| `partner_name` | Cliente/Empresa | Entidad |
| `expected_revenue` | Ingreso esperado | Cuantía |
| `probability` | Probabilidad de cierre | Calculado según Estado |
| `date_deadline` | Fecha de cierre | F. Publicación |
| `email_from` | Email de contacto | Email Contacto |
| `phone` | Teléfono | Teléfono Contacto |
| `city` | Ciudad | Ubicación (parte ciudad) |
| `description` | Descripción | Generado automáticamente |
| `website` | Sitio web | Enlace |

### Campos Personalizados (Deben crearse)

Estos campos DEBEN ser creados en tu Odoo para almacenar toda la información de SECOP II:

| Nombre Técnico | Nombre Visible | Tipo | Descripción |
|----------------|----------------|------|-------------|
| `x_modalidad` | Modalidad | Char | Tipo de modalidad de contratación |
| `x_numero_proceso` | Número de Proceso | Char | Número único del proceso |
| `x_estado` | Estado SECOP | Selection | Estado actual del proceso |
| `x_actividad_economica` | Actividad Económica | Text | Actividad económica relacionada |
| `x_codigos_unspsc` | Códigos UNSPSC | Char | Códigos de clasificación |
| `x_portal_origen` | Portal de Origen | Char | Portal de donde proviene |
| `x_departamento` | Departamento | Char | Departamento de Colombia |
| `x_contratistas` | Contratistas | Text | Contratistas adjudicados |

## 🛠️ Cómo Crear Campos Personalizados en Odoo

### Opción 1: Modo Desarrollador (Interfaz)

1. **Activar Modo Desarrollador**
   - Ve a **Ajustes** → **General Settings**
   - Scroll hasta el final
   - Click en **Activate the developer mode**

2. **Crear Campo Personalizado**
   - Ve a **Ajustes** → **Technical** → **Database Structure** → **Models**
   - Busca el modelo: `crm.lead`
   - Click en el modelo
   - Ve a la pestaña **Fields**
   - Click en **Create**

3. **Configurar cada campo** según la tabla anterior:

#### Ejemplo: Campo "Modalidad"

```
Field Name: x_modalidad
Field Label: Modalidad
Field Type: Char
Size: 255
Required: No
Readonly: No
```

#### Ejemplo: Campo "Estado SECOP"

```
Field Name: x_estado
Field Label: Estado SECOP
Field Type: Selection
Selection Options:
  - Convocatoria
  - Evaluación
  - Adjudicado
  - Celebrado
  - Desierto
  - Cancelado
Required: No
```

### Opción 2: Módulo Personalizado (Recomendado para Producción)

Crea un módulo Odoo personalizado:

**1. Crear estructura del módulo:**

```
addons/
└── tecnoleads_fields/
    ├── __init__.py
    ├── __manifest__.py
    └── models/
        ├── __init__.py
        └── crm_lead.py
```

**2. Archivo `__manifest__.py`:**

```python
{
    'name': 'TecnoLeads - Campos SECOP II',
    'version': '1.0',
    'category': 'CRM',
    'summary': 'Campos personalizados para importación de SECOP II',
    'description': '''
        Agrega campos personalizados al CRM de Odoo para 
        gestionar información de procesos SECOP II
    ''',
    'depends': ['crm'],
    'data': [],
    'installable': True,
    'application': False,
    'auto_install': False,
}
```

**3. Archivo `models/__init__.py`:**

```python
from . import crm_lead
```

**4. Archivo `models/crm_lead.py`:**

```python
from odoo import models, fields

class CrmLead(models.Model):
    _inherit = 'crm.lead'

    # Campos SECOP II
    x_modalidad = fields.Char(
        string='Modalidad',
        help='Tipo de modalidad de contratación SECOP II'
    )
    
    x_numero_proceso = fields.Char(
        string='Número de Proceso',
        help='Número único del proceso de contratación'
    )
    
    x_estado = fields.Selection([
        ('convocatoria', 'Convocatoria'),
        ('evaluacion', 'Evaluación'),
        ('adjudicado', 'Adjudicado'),
        ('celebrado', 'Celebrado'),
        ('desierto', 'Desierto'),
        ('cancelado', 'Cancelado'),
    ], string='Estado SECOP', help='Estado actual del proceso')
    
    x_actividad_economica = fields.Text(
        string='Actividad Económica',
        help='Actividad económica relacionada con el proceso'
    )
    
    x_codigos_unspsc = fields.Char(
        string='Códigos UNSPSC',
        help='Códigos de clasificación UNSPSC'
    )
    
    x_portal_origen = fields.Char(
        string='Portal de Origen',
        help='Portal desde donde se importó (SECOP I, SECOP II, etc.)'
    )
    
    x_departamento = fields.Char(
        string='Departamento',
        help='Departamento de Colombia donde se realiza el proceso'
    )
    
    x_contratistas = fields.Text(
        string='Contratistas',
        help='Contratistas adjudicados (si aplica)'
    )
```

**5. Instalar el módulo:**

- Actualizar lista de aplicaciones en Odoo
- Buscar "TecnoLeads - Campos SECOP II"
- Click en **Install**

### Opción 3: SQL Directo (Solo si tienes acceso a la BD)

⚠️ **ADVERTENCIA**: Solo usar en entornos de desarrollo. Hacer backup antes.

```sql
-- Agregar campos a ir_model_fields
INSERT INTO ir_model_fields 
(name, field_description, model, model_id, ttype, state, readonly, required)
SELECT 
    'x_modalidad',
    'Modalidad',
    'crm.lead',
    (SELECT id FROM ir_model WHERE model = 'crm.lead'),
    'char',
    'manual',
    false,
    false;

-- Repetir para cada campo...
```

## 🎨 Personalizar Vista del CRM

Para mostrar los campos en la vista del CRM:

### Agregar a la Vista de Formulario

1. Ve a **Settings** → **Technical** → **User Interface** → **Views**
2. Busca la vista `crm.lead.view.form`
3. Click en **Edit**
4. Agrega los campos en la sección deseada:

```xml
<group name="secop_info" string="Información SECOP II">
    <field name="x_modalidad"/>
    <field name="x_numero_proceso"/>
    <field name="x_estado"/>
    <field name="x_departamento"/>
    <field name="x_codigos_unspsc"/>
    <field name="x_portal_origen"/>
</group>
```

### Agregar a la Vista de Lista

```xml
<field name="x_numero_proceso"/>
<field name="x_estado"/>
<field name="x_modalidad"/>
```

## ✅ Verificación

Para verificar que los campos están creados correctamente:

1. Ve a una oportunidad en el CRM
2. Click en **Edit**
3. Deberías ver los campos personalizados
4. Prueba guardando valores en cada campo

## 🔄 Compatibilidad

Si NO creas los campos personalizados:
- ✅ El sistema seguirá funcionando
- ✅ Los datos se guardarán en los campos estándar
- ❌ Se perderá información específica de SECOP II (modalidad, códigos UNSPSC, etc.)
- ❌ Los campos `x_*` se ignorarán silenciosamente

## 📊 Mapeo Completo de Datos

### Ejemplo de Registro Transformado

**Entrada (CSV SECOP II):**
```csv
Entidad,Objeto,Cuantía,Modalidad,Número,Estado,F. Publicación,Ubicación
"INSTITUTO NACIONAL DE MEDICINA LEGAL","ADQUISICIÓN DE CÁMARAS",455017822,"Selección Abreviada Subasta Inversa",SASI-029-SG-2025,Convocatoria,"2025-10-20 17:23:10","Cundinamarca : Bogotá D.C."
```

**Salida (Odoo CRM):**
```javascript
{
  // Campos estándar
  name: "Subasta SASI-029-SG-2025",
  partner_name: "INSTITUTO NACIONAL DE MEDICINA LEGAL",
  expected_revenue: 455017822,
  probability: 25,
  date_deadline: "2025-10-20",
  city: "Bogotá D.C.",
  
  // Campos personalizados
  x_modalidad: "Selección Abreviada Subasta Inversa",
  x_numero_proceso: "SASI-029-SG-2025",
  x_estado: "Convocatoria",
  x_departamento: "Cundinamarca",
  
  // Descripción generada
  description: "...(descripción completa formateada)..."
}
```

## 🆘 Soporte

Si tienes problemas creando los campos:
1. Verifica que tienes permisos de administrador en Odoo
2. Asegúrate de estar en modo desarrollador
3. Revisa los logs de Odoo para errores
4. Consulta la documentación oficial de Odoo sobre campos personalizados

## 📚 Referencias

- [Odoo Documentation - Custom Fields](https://www.odoo.com/documentation/16.0/developer/reference/backend/orm.html#fields)
- [Odoo Studio - Field Creation](https://www.odoo.com/documentation/16.0/applications/studio/fields.html)


