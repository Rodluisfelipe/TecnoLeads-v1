# Formato SECOP II - Guía de Importación

## Descripción

TecnoLeads está optimizado para procesar archivos CSV/Excel exportados directamente desde el portal SECOP II (Sistema Electrónico de Contratación Pública).

## Formato de Archivo Soportado

### Columnas Requeridas

El sistema requiere al menos las siguientes columnas:

- **Entidad**: Nombre de la entidad contratante
- **Objeto**: Descripción del proceso de contratación

### Columnas Opcionales (Recomendadas)

| Columna | Descripción | Mapeo en Odoo |
|---------|-------------|---------------|
| `Entidad` | Entidad contratante | `partner_name` |
| `Objeto` | Descripción del contrato | `name` (Nombre de la oportunidad) |
| `Cuantía` | Valor del contrato | `expected_revenue` |
| `Modalidad` | Tipo de modalidad de contratación | Campo personalizado |
| `Número` | Número del proceso | `numero_proceso` |
| `Estado` | Estado actual del proceso | `stage_name` |
| `F. Publicación` | Fecha de publicación (formato: YYYY-MM-DD HH:mm:ss) | `date_deadline` |
| `Ubicación` | Ubicación (formato: "Departamento : Ciudad") | `city` y `state_id` |
| `Actividad Económica` | Actividad económica relacionada | Campo personalizado |
| `Códigos UNSPSC` | Códigos de clasificación UNSPSC | Campo personalizado |
| `Enlace` | URL del proceso en SECOP II | `website` |
| `Portal de origen` | Portal de donde proviene | Campo personalizado |
| `Contratista(s)` | Contratistas adjudicados (si aplica) | Campo personalizado |

## Ejemplo de Archivo

### Formato CSV

```csv
Entidad,Objeto,Cuantía,Modalidad,Número,Estado,"F. Publicación",Ubicación,"Actividad Económica","Códigos UNSPSC",Enlace,"Portal de origen",Contratista(s)
"ALCALDÍA MUNICIPAL DE EL ESPINAL","CONTRATAR LA COMPRA DE IMPRESORAS Y ESCANNER",142831615,"Selección Abreviada Subasta Inversa",SASI-06-2025,Convocatoria,"2025-10-20 17:53:34","Tolima : Espinal","Suministro partes de computador",32131000,https://col.licitaciones.info/detalle-contrato?random=123,"secop II",
```

## Procesamiento de Datos

### 1. Extracción de Ubicación

El campo `Ubicación` se procesa automáticamente para extraer:
- **Departamento** (antes de los dos puntos)
- **Ciudad** (después de los dos puntos)

Ejemplo: `"Tolima : Espinal"` → Departamento: "Tolima", Ciudad: "Espinal"

### 2. Procesamiento de Fechas

El sistema reconoce el formato de fecha de SECOP II:
- Formato: `YYYY-MM-DD HH:mm:ss`
- Ejemplo: `"2025-10-20 17:53:34"`
- Se convierte a: `2025-10-20` en Odoo

### 3. Procesamiento de Cuantía

El sistema procesa valores monetarios:
- Elimina símbolos de moneda
- Elimina puntos y comas de separadores
- Convierte a número decimal

### 4. Generación de Descripción

Si el registro no tiene una descripción explícita, el sistema genera una automáticamente con:
- Objeto del contrato
- Modalidad
- Número de proceso
- Actividad económica
- Códigos UNSPSC
- Enlace al proceso

## Ejemplo de Descripción Generada

```
Objeto: CONTRATAR LA COMPRA DE IMPRESORAS Y ESCANNER
Modalidad: Selección Abreviada Subasta Inversa
Número de Proceso: SASI-06-2025
Actividad: Suministro partes de computador
Códigos UNSPSC: 32131000
Enlace: https://col.licitaciones.info/detalle-contrato?random=123
```

## Validación de Archivos

### Estructura Válida

El sistema validará que el archivo contenga:
- ✅ Columnas `Entidad` y `Objeto` (formato SECOP II)
- ✅ O columna `Nombre del Proceso` (formato anterior)

### Errores Comunes

| Error | Solución |
|-------|----------|
| "Faltan campos requeridos" | Verificar que el CSV tenga las columnas `Entidad` y `Objeto` |
| "El archivo está vacío" | Asegurarse de que el archivo tenga al menos 1 registro de datos |
| "Tipo de archivo no soportado" | Usar formato .csv, .xlsx o .xls |

## Estadísticas Generadas

Al importar un archivo, el sistema genera estadísticas automáticas:

- **Total de registros**: Número de oportunidades
- **Valor total**: Suma de todas las cuantías
- **Valor promedio**: Promedio de las cuantías
- **Por ubicación**: Cantidad de procesos por ciudad
- **Por modalidad**: Cantidad de procesos por tipo de modalidad
- **Por estado**: Cantidad de procesos por estado

## Detección de Duplicados

El sistema detecta duplicados basándose en:
- Nombre del proceso (`Objeto`)
- Entidad contratante (`Entidad`)

## Compatibilidad

El sistema es compatible con:
- ✅ **SECOP II** (formato actual)
- ✅ **Formato personalizado anterior** (retrocompatibilidad)
- ✅ **CSV exportado directamente de SECOP II**
- ✅ **Excel (.xlsx, .xls)**

## Cómo Exportar desde SECOP II

1. Ingresa al portal SECOP II: https://www.colombiacompra.gov.co/secop-ii
2. Realiza la búsqueda de procesos según tus criterios
3. Selecciona los procesos de interés
4. Haz clic en "Exportar"
5. Descarga el archivo CSV
6. Importa el archivo en TecnoLeads

## Límites

- **Tamaño máximo de archivo**: 10 MB
- **Formatos soportados**: .csv, .xlsx, .xls
- **Codificación recomendada**: UTF-8

## Soporte

Si tienes problemas con la importación:
1. Verifica que el archivo tenga las columnas mínimas requeridas
2. Revisa que el formato de fechas sea correcto
3. Asegúrate de que los valores de cuantía sean numéricos
4. Consulta los logs de importación para detalles de errores


