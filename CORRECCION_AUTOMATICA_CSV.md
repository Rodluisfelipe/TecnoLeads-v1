# 🔧 Sistema de Corrección Automática de CSV

## ✨ Nueva Funcionalidad

**TecnoLeads ahora detecta y corrige automáticamente archivos CSV con formato no estándar.**

Ya no necesitas preocuparte por el formato exacto de tus archivos CSV. El sistema los arreglará automáticamente.

## 🎯 Problemas que se Corrigen Automáticamente

### 1. ✅ Encabezados completamente entre comillas

**Antes (no funcionaba):**
```csv
"Entidad,Objeto,Cuantía,Modalidad,Número,Estado,""F. Publicación"",Ubicación,..."
```

**Ahora se corrige automáticamente a:**
```csv
Entidad,Objeto,Cuantía,Modalidad,Número,Estado,"F. Publicación",Ubicación,...
```

### 2. ✅ Comillas dobles mal escapadas

**Antes:**
```csv
""F. Publicación"" → "F. Publicación"
""Actividad Económica"" → "Actividad Económica"
```

### 3. ✅ Filas de datos entre comillas

**Antes:**
```csv
"ALCALDÍA LOCAL,""ADQUISICIÓN DE PANTALLAS"",123456,..."
```

**Ahora se corrige a:**
```csv
"ALCALDÍA LOCAL","ADQUISICIÓN DE PANTALLAS",123456,...
```

### 4. ✅ Nombres de campos diferentes (NUEVO)

El sistema ahora **normaliza automáticamente** nombres de campos variantes:

**Ejemplos de normalización:**
```csv
"entidad" → "Entidad"
"OBJETO" → "Objeto"
"cuantia" → "Cuantía"
"Valor Contrato" → "Cuantía"
"numero" → "Número"
"No. Proceso" → "Número"
"Fecha Publicacion" → "F. Publicación"
"ubicacion" → "Ubicación"
"Codigos UNSPSC" → "Códigos UNSPSC"
"Link" → "Enlace"
"Portal" → "Portal de origen"
"Contratista" → "Contratista(s)"
```

**Más de 40 variantes soportadas** - El archivo se adapta automáticamente al formato esperado.

## 🚀 Cómo Funciona

### Proceso Automático

1. **Subir archivo** - El usuario arrastra cualquier CSV
2. **Detección** - El sistema detecta formato no estándar
3. **Corrección** - Se aplican correcciones automáticas
4. **Validación** - Se valida que tenga al menos 3 columnas
5. **Notificación** - Se informa al usuario si hubo correcciones
6. **Continuar** - El proceso de importación continúa normalmente

### En el Frontend

Cuando se detecta una corrección, el usuario verá:

```
✅ Archivo parseado exitosamente
⚠️  El archivo tenía un formato no estándar y fue corregido automáticamente

📊 Columnas detectadas: 13
📄 Registros: 150
```

### En el Backend

Logs del servidor:
```
⚠️  Detectado: Encabezados mal formateados (toda la línea entre comillas)
✅ Encabezados corregidos automáticamente
⚠️  Detectado: Fila 2 mal formateada (toda entre comillas)
✅ CSV parseado: 13 columnas, 150 registros
```

## 🧪 Probar la Funcionalidad

### Método 1: Script de Prueba

```bash
cd backend
node test-csv-parser.js
```

Esto ejecutará pruebas automáticas con archivos CSV mal formateados.

### Método 2: Prueba Manual

1. Usa el archivo: `contratos (7).csv` (formato incorrecto)
2. Súbelo en TecnoLeads → Importar
3. Verás el mensaje de corrección automática
4. La importación funcionará normalmente

## 📋 Validaciones Aplicadas

Después de la corrección, el sistema valida:

- ✅ **Mínimo 3 columnas** detectadas
- ✅ **Headers reconocidos** (Entidad, Objeto, etc.)
- ✅ **Datos parseables** en cada fila
- ✅ **Formato CSV estándar** resultante

Si alguna validación falla, se muestra un error descriptivo.

## 🎨 Experiencia de Usuario

### Caso 1: Archivo Correcto
```
✅ Archivo parseado exitosamente
📊 13 columnas, 150 registros
```

### Caso 2: Archivo Corregido
```
✅ Archivo parseado exitosamente
⚠️  El archivo fue corregido automáticamente
📊 13 columnas, 150 registros
formatCorrected: true
```

### Caso 3: Archivo Inválido (no se puede corregir)
```
❌ Error al parsear archivo
El archivo CSV tiene un formato inválido.
Columnas detectadas: 1
Asegúrate de que los encabezados estén correctamente separados por comas.
```

## 🔧 Detalles Técnicos

### Función de Limpieza

**Ubicación:** `backend/src/services/fileParser.service.js`

**Método:** `cleanCSVFormat(fileContent)`

**Correcciones aplicadas:**

1. **Línea de encabezados**: Quita comillas externas
2. **Comillas escapadas**: `""` → `"`
3. **Filas entre comillas**: Detecta y corrige
4. **Patrones específicos**: 
   - `,""campo""` → `,"campo"`
   - `^""campo""` → `"campo"`

### Configuración Papa Parse

```javascript
{
  header: true,           // Usar primera fila como headers
  skipEmptyLines: true,   // Ignorar líneas vacías
  dynamicTyping: true,    // Convertir tipos automáticamente
  delimiter: ',',         // Separador de columnas
  quoteChar: '"',         // Carácter de comillas
  escapeChar: '"',        // Carácter de escape
  newline: '\n'          // Salto de línea
}
```

## ⚠️ Limitaciones

El sistema NO puede corregir:

- ❌ Archivos completamente corruptos
- ❌ Formatos que NO sean CSV
- ❌ Archivos con menos de 3 columnas válidas
- ❌ Codificaciones extrañas (solo UTF-8)
- ❌ Delimitadores diferentes de coma (`,`)

En estos casos, se mostrará un error específico.

## 📊 Estadísticas de Corrección

El sistema registra:

- Total de archivos procesados
- Total de archivos corregidos
- Tipos de correcciones aplicadas
- Tasa de éxito de corrección

Visible en: `Dashboard → Estadísticas de Importación`

## 🆘 Solución de Problemas

### "Solo 1 columna detectada"

**Causa:** El archivo tiene un formato muy corrupto
**Solución:** 
1. Abrir en Excel
2. Guardar como "CSV UTF-8 (delimitado por comas)"
3. Reintentar importación

### "Error parseando CSV"

**Causa:** Formato completamente inválido
**Solución:**
1. Verificar que sea un archivo CSV real
2. Verificar codificación UTF-8
3. Usar archivo de plantilla como referencia

### "Headers no reconocidos"

**Causa:** Nombres de columnas diferentes
**Solución:**
1. Verificar que tenga al menos: `Entidad`, `Objeto`
2. Usar formato SECOP II estándar
3. Ver: `FORMATO_SECOP_II.md`

## 📚 Referencias

- [FORMATO_SECOP_II.md](./FORMATO_SECOP_II.md) - Formato estándar
- [MAPEO_CAMPOS.md](./MAPEO_CAMPOS.md) - Mapeo de campos
- [README.md](./README.md) - Documentación general

## 🎉 Beneficios

✅ **No más errores de formato** - El sistema los corrige
✅ **Carga más rápida** - Sin necesidad de pre-procesamiento
✅ **Menos frustración** - Cualquier CSV de SECOP II funciona
✅ **Mayor productividad** - Importar sin preocupaciones

---

**Última actualización:** Noviembre 4, 2025  
**Versión:** 1.1.0 (Con corrección automática)
