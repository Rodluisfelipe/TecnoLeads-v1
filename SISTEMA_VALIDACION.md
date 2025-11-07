# 🛡️ Sistema de Validación y Corrección Automática de Datos

## Descripción General

TecnoLeads ahora cuenta con un **sistema robusto de validación y corrección automática** que detecta y soluciona los errores más comunes en archivos de importación **antes** de procesarlos.

## ✅ Errores Detectados y Corregidos Automáticamente

### 1. **Problemas de Estructura**

#### a) Columnas Colapsadas (CSV dentro de Excel)
**Problema:** Excel guarda todo el CSV en una sola columna
```
"Entidad,Objeto,Cuantía,Modalidad..." (todo en celda A1)
```

**Solución:** Detecta y re-parsea como CSV
```javascript
if (headers.length === 1 && headers[0].includes(',')) {
  // Extraer y re-parsear
}
```

#### b) Columnas Vacías (Unnamed: X)
**Problema:** Excel agrega columnas vacías innecesarias

**Solución:** Elimina automáticamente columnas sin datos

#### c) Filas Vacías
**Problema:** Filas con todos los campos vacíos

**Solución:** Filtra y elimina automáticamente

---

### 2. **Problemas de Nomenclatura**

#### a) Nombres de Columnas Variados
**Problema:** Diferentes nombres para la misma columna
```
"Entidad" vs "Entidad Contratante" vs "Nombre Entidad"
```

**Solución:** Sistema de aliases que normaliza a nombres estándar
```javascript
columnAliases = {
  'entidad contratante': 'Entidad',
  'nombre entidad': 'Entidad',
  // ... 30+ aliases
}
```

#### b) Mayúsculas/Minúsculas Inconsistentes
**Problema:** "ENTIDAD" vs "entidad" vs "Entidad"

**Solución:** Normalización automática usando `.toLowerCase()` y lookup

---

### 3. **Problemas de Codificación**

#### a) BOM (Byte Order Mark)
**Problema:** Caracteres invisibles al inicio del archivo (0xFEFF)

**Solución:** Detecta y elimina automáticamente

#### b) Comillas Tipográficas
**Problema:** " " ' ' (tipográficas) vs " ' (rectas)

**Solución:** Reemplaza automáticamente
```javascript
fileContent.replace(/[""]/g, '"').replace(/['']/g, "'")
```

---

### 4. **Problemas de Tipos de Datos**

#### a) Números con Diferentes Formatos
**Problema:**
- Europeo: `1.000.000,50`
- Americano: `1,000,000.50`
- Sin formato: `1000000.5`

**Solución:** Detecta formato y normaliza
```javascript
normalizeNumber(value) {
  const hasCommaAsDecimal = /,\d{1,2}$/.test(numStr);
  if (hasCommaAsDecimal) {
    return parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
  }
  return parseFloat(numStr.replace(/,/g, ''));
}
```

#### b) Fechas en Múltiples Formatos
**Problema:**
- `DD/MM/YYYY`
- `YYYY-MM-DD`
- `DD-MMM-YYYY`
- `1 de noviembre de 2024`

**Solución:** Patrones de expresiones regulares para detectar y normalizar

---

### 5. **Problemas de Datos Faltantes**

#### a) Campos Opcionales Vacíos
**Problema:** `Contratista(s)` vacío en procesos no adjudicados

**Solución:** Rellena con valores por defecto
```javascript
fillMissingValues() {
  if (!row['Contratista(s)']) {
    row['Contratista(s)'] = 'Sin adjudicar';
  }
}
```

---

### 6. **Problemas de Duplicados**

#### a) Registros Duplicados
**Problema:** Mismos números de proceso repetidos

**Solución:** Detecta y reporta (no elimina para revisión manual)

---

## 🔄 Flujo de Procesamiento

```
1. PARSEO INICIAL
   ├─ CSV → Papa.parse()
   └─ Excel → ExcelJS
        └─ Detecta colapso → Re-parsea como CSV

2. VALIDACIÓN
   ├─ Verificar datos existen
   ├─ Verificar columnas críticas
   ├─ Detectar filas vacías
   └─ Detectar duplicados

3. CORRECCIÓN AUTOMÁTICA
   ├─ Normalizar nombres de columnas
   ├─ Eliminar columnas vacías
   ├─ Eliminar filas vacías
   ├─ Normalizar tipos de datos
   ├─ Rellenar valores faltantes
   └─ Limpiar espacios en blanco

4. REPORTE
   ├─ Resumen de validación
   ├─ Lista de errores
   ├─ Lista de advertencias
   └─ Lista de correcciones aplicadas

5. RETORNO
   └─ Datos limpios y normalizados
```

---

## 📊 Ejemplo de Reporte

```
📋 REPORTE DE VALIDACIÓN Y CORRECCIÓN
=====================================
Estado: ✅ Válido
Filas: 247
Columnas: 13
Correcciones aplicadas: 8

⚠️  Advertencias:
   - Se encontraron 3 filas vacías
   - Se encontraron 2 filas duplicadas

🔧 Correcciones aplicadas:
   - Columna "Entidad Contratante" normalizada a "Entidad"
   - Columna "Presupuesto Oficial" normalizada a "Cuantía"
   - Columnas vacías eliminadas: Unnamed: 1, Unnamed: 14
   - 3 filas vacías eliminadas
   - Valores faltantes rellenados en 'Contratista(s)' (15 registros)
   - Espacios en blanco limpiados
   - Estructura Excel colapsada corregida
   - 247 números normalizados

=====================================
```

---

## 🚀 Cómo Agregar Nuevas Validaciones

### 1. Agregar Alias de Columna
Editar `dataValidator.service.js`:
```javascript
this.columnAliases = {
  // ... existentes
  'nuevo alias': 'Nombre Estándar',
}
```

### 2. Agregar Patrón de Fecha
```javascript
this.datePatterns = [
  // ... existentes
  /nuevo-patron-regex/,
]
```

### 3. Agregar Validación Personalizada
```javascript
validateCustomRule(data) {
  // Tu lógica aquí
  if (conditionFails) {
    return { isValid: false, message: 'Error personalizado' };
  }
  return { isValid: true };
}
```

---

## 🔧 Archivos Modificados

1. **`backend/src/services/dataValidator.service.js`** (NUEVO)
   - Servicio principal de validación
   - 500+ líneas de lógica de corrección

2. **`backend/src/services/fileParser.service.js`** (MODIFICADO)
   - Integración del validador
   - Mejora en `parseExcel()` para detectar colapso
   - Flujo completo de validación en `parseFile()`

---

## ✅ Beneficios

1. **Menos errores manuales** - Correcciones automáticas
2. **Mejor experiencia de usuario** - Archivos "malos" funcionan
3. **Trazabilidad** - Reporte detallado de cambios
4. **Extensible** - Fácil agregar nuevas reglas
5. **Preventivo** - Detecta problemas antes de importar a Odoo

---

## 🎯 Casos de Uso Cubiertos

✅ Exportaciones de SECOP II con formato incorrecto  
✅ CSV convertidos a Excel manualmente  
✅ Archivos con diferentes separadores regionales  
✅ Datos copiados desde navegadores  
✅ Exportaciones de diferentes portales (SECOP I, Colombia Compra)  
✅ Archivos editados manualmente en Excel  
✅ Datos con caracteres especiales o acentos  

---

## 📝 Próximas Mejoras (Futuro)

- [ ] Detección de coordenadas geográficas en "Ubicación"
- [ ] Normalización automática de nombres de entidades (DIAN vs D.I.A.N.)
- [ ] Detección de monedas (COP, USD, EUR) y conversión
- [ ] Validación de URLs (verificar que enlaces estén activos)
- [ ] Machine Learning para detectar patrones de error nuevos
- [ ] Sugerencias de corrección interactivas (modo manual)

---

## 🐛 Solución de Problemas

### El archivo sigue dando error después de la validación
1. Revisar el reporte de validación en la consola del backend
2. Verificar que las columnas críticas existan
3. Comprobar que hay al menos 1 fila de datos

### Las correcciones no se aplican
1. Verificar que `dataValidator.service.js` esté importado
2. Revisar logs del backend para errores
3. Asegurar que el archivo tiene permiso de lectura

### Números o fechas mal interpretados
1. Agregar nuevo patrón en `datePatterns` o `normalizeNumber()`
2. Revisar separador decimal regional

---

**Última actualización:** Noviembre 5, 2025  
**Versión:** 2.0.0  
**Autor:** Sistema TecnoLeads
