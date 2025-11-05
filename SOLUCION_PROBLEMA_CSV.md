# 🔧 Solución al Problema de CSV Mal Formateado

## 🔴 Problema Detectado

El archivo `contratos (7).csv` tiene un **formato incorrecto** que impide su procesamiento.

### Síntomas
- ❌ Error al importar el archivo
- ❌ Vista previa no muestra columnas correctamente
- ❌ Parser detecta solo 1 columna en lugar de 13

## 🔍 Causa Raíz

### Archivo Incorrecto (contratos 7.csv)
```csv
"Entidad,Objeto,Cuantía,Modalidad,Número,Estado,""F. Publicación"",Ubicación,..."
```

**Problemas:**
1. ❌ Todo el encabezado está envuelto en comillas → Parser lo ve como 1 columna
2. ❌ Comillas dobles mal escapadas: `""F. Publicación""` en lugar de `"F. Publicación"`
3. ❌ Datos también mal formateados

### Archivo Correcto (contratos plantilla.csv)
```csv
Entidad,Objeto,Cuantía,Modalidad,Número,Estado,"F. Publicación",Ubicación,...
```

**Correcto:**
1. ✅ Encabezados SIN comillas externas
2. ✅ Solo columnas con espacios llevan comillas: `"F. Publicación"`
3. ✅ Datos correctamente separados por comas

## ✅ Soluciones Implementadas

### Solución 1: Archivo Corregido ✨
He creado un archivo limpio: **`contratos (7) - CORREGIDO.csv`**

**Usa este archivo** para importar ahora mismo.

### Solución 2: Código Mejorado 🛠️
He actualizado `fileParser.service.js` para:
- ✅ Detectar automáticamente encabezados mal formateados
- ✅ Limpiar comillas externas de la primera línea
- ✅ Validar que se detecten al menos 3 columnas
- ✅ Mostrar error descriptivo si el formato es inválido

## 🎯 Cómo Prevenir este Problema

### Al Exportar desde SECOP II:

1. **Opción A: Exportar como CSV UTF-8**
   - Clic derecho → "Exportar a CSV"
   - Seleccionar "CSV UTF-8 (delimitado por comas)"

2. **Opción B: Usar Excel como intermediario**
   - Exportar desde SECOP II a Excel
   - Abrir en Excel
   - Guardar como → "CSV (delimitado por comas)"

3. **Opción C: Limpiar en un editor de texto**
   - Abrir el CSV en Notepad++ o VS Code
   - Verificar primera línea:
     ```
     // ❌ MAL
     "Entidad,Objeto,Cuantía,..."
     
     // ✅ BIEN
     Entidad,Objeto,Cuantía,...
     ```

### Formato Correcto de CSV

```csv
Entidad,Objeto,Cuantía,Modalidad,Número,Estado,"F. Publicación",Ubicación,"Actividad Económica","Códigos UNSPSC",Enlace,"Portal de origen",Contratista(s)
"NOMBRE ENTIDAD","Descripción del objeto",123456789,"Modalidad",NUM-001,Estado,"2025-10-20 12:00:00","Depto : Ciudad","Actividad","12345",https://ejemplo.com,"secop II",
```

**Reglas:**
- ✅ Encabezados sin comillas externas
- ✅ Columnas con espacios/caracteres especiales entre comillas: `"F. Publicación"`
- ✅ Datos de texto entre comillas: `"NOMBRE ENTIDAD"`
- ✅ Números sin comillas: `123456789`
- ✅ Separador: coma (`,`)

## 🚀 Pasos para Importar Ahora

### Opción 1: Usar el archivo corregido
```bash
1. Ve a la página de Importación en TecnoLeads
2. Arrastra el archivo: "contratos (7) - CORREGIDO.csv"
3. Verifica la vista previa
4. Clic en "Iniciar Importación"
```

### Opción 2: Corregir el archivo original

**En Excel:**
1. Abrir `contratos (7).csv` en Excel
2. Verificar que se vean 13 columnas
3. Si ves solo 1 columna → usar "Datos" → "Texto en columnas"
4. Guardar como → "CSV (delimitado por comas)" → Guardar
5. Importar el archivo guardado

**En VS Code / Notepad++:**
1. Abrir `contratos (7).csv`
2. Primera línea debe ser:
   ```
   Entidad,Objeto,Cuantía,Modalidad,Número,Estado,"F. Publicación",Ubicación,"Actividad Económica","Códigos UNSPSC",Enlace,"Portal de origen",Contratista(s)
   ```
3. Segunda línea debe empezar:
   ```
   "ALCALDÍA LOCAL DE BARRIOS UNIDOS","ADQUISICIÓN DE PANTALLAS...
   ```
4. Guardar con codificación UTF-8

## 🧪 Validar CSV Antes de Importar

### Método 1: Visual en Excel
- Abrir en Excel
- ¿Se ven 13 columnas? ✅ BIEN
- ¿Se ve solo 1 columna con todo el texto? ❌ MAL

### Método 2: Vista previa en TecnoLeads
- Subir el archivo
- Vista previa debe mostrar:
  - ✅ 13 columnas detectadas
  - ✅ Datos organizados en tabla
  - ✅ Estadísticas del archivo

### Método 3: Herramienta Online
Usa: https://csvlint.io/
- Pega la primera línea del CSV
- Debe validar sin errores

## 📝 Checklist de Formato Correcto

- [ ] Primera línea NO tiene comillas al inicio y final
- [ ] Campos con espacios tienen comillas: `"F. Publicación"`
- [ ] Campos sin espacios NO tienen comillas: `Entidad`
- [ ] Separador es coma (`,`)
- [ ] Datos de texto entre comillas: `"ALCALDÍA..."`
- [ ] Al abrir en Excel se ven 13 columnas
- [ ] Codificación UTF-8

## 🆘 Errores Comunes

### Error: "El archivo CSV tiene un formato inválido"
**Causa:** Encabezados mal formateados
**Solución:** Verificar primera línea según formato correcto arriba

### Error: "Solo se detecta 1 columna"
**Causa:** Todo el encabezado está entre comillas
**Solución:** Quitar comillas externas de la primera línea

### Error: "Caracteres extraños en el archivo"
**Causa:** Codificación incorrecta
**Solución:** Guardar como UTF-8

### Error: "Campos no reconocidos"
**Causa:** Nombres de columnas diferentes
**Solución:** Usar nombres exactos del formato SECOP II

## 📞 Soporte

Si el problema persiste:
1. Verifica que el archivo tenga el formato correcto
2. Usa el archivo corregido: `contratos (7) - CORREGIDO.csv`
3. Intenta con el archivo plantilla: `contratos plantilla.csv`
4. Revisa los logs del backend para más detalles

---

**Última actualización:** Noviembre 4, 2025
**Versión TecnoLeads:** 1.0.0
