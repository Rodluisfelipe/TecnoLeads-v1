import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fileParserService from './src/services/fileParser.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧪 Script de prueba para validar corrección automática de CSV

console.log('🧪 Iniciando prueba de corrección automática de CSV...\n');

// Crear archivo CSV de prueba con formato incorrecto
const malFormedCSV = `"Entidad,Objeto,Cuantía,Modalidad,Número,Estado,""F. Publicación"",Ubicación,""Actividad Económica"",""Códigos UNSPSC"",Enlace,""Portal de origen"",Contratista(s)"
"ALCALDÍA LOCAL DE BARRIOS UNIDOS,""ADQUISICIÓN DE PANTALLAS INTERACTIVAS PARA USO EDUCATIVO"",339458833,""Selección Abreviada Subasta Inversa"",FDLBU-SASI-008-2025,Convocatoria,""2025-10-31 12:31:21"",""Cundinamarca : Bogotá D.C."",""Equipos audiovisuales"",""43211900 | 45111600"",https://col.licitaciones.info/detalle-contrato?random=123,""secop II"","`;

const wellFormedCSV = `Entidad,Objeto,Cuantía,Modalidad,Número,Estado,"F. Publicación",Ubicación,"Actividad Económica","Códigos UNSPSC",Enlace,"Portal de origen",Contratista(s)
"ALCALDÍA LOCAL DE BARRIOS UNIDOS","ADQUISICIÓN DE PANTALLAS INTERACTIVAS PARA USO EDUCATIVO",339458833,"Selección Abreviada Subasta Inversa",FDLBU-SASI-008-2025,Convocatoria,"2025-10-31 12:31:21","Cundinamarca : Bogotá D.C.","Equipos audiovisuales","43211900 | 45111600",https://col.licitaciones.info/detalle-contrato?random=123,"secop II",`;

const testDir = path.join(__dirname, 'test-files');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

const malFormedFile = path.join(testDir, 'test-malformed.csv');
const wellFormedFile = path.join(testDir, 'test-wellformed.csv');

fs.writeFileSync(malFormedFile, malFormedCSV);
fs.writeFileSync(wellFormedFile, wellFormedCSV);

console.log('📁 Archivos de prueba creados:');
console.log(`   - ${malFormedFile}`);
console.log(`   - ${wellFormedFile}\n`);

// Test 1: Archivo mal formateado
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('TEST 1: Archivo CSV mal formateado (con corrección automática)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

try {
  const result1 = await fileParserService.parseCSV(malFormedFile);
  
  console.log('✅ ÉXITO - Archivo parseado correctamente\n');
  console.log(`📊 Columnas detectadas: ${result1.headers.length}`);
  console.log(`📋 Headers: ${result1.headers.join(', ')}\n`);
  console.log(`📄 Registros: ${result1.rowCount}`);
  
  if (result1.headers.length >= 10) {
    console.log('\n✅ CORRECCIÓN AUTOMÁTICA FUNCIONÓ');
    console.log('   El archivo mal formateado fue corregido y parseado correctamente\n');
  } else {
    console.log('\n❌ ERROR - Solo se detectaron', result1.headers.length, 'columnas');
    console.log('   Esperadas: 13 columnas mínimo\n');
  }
  
  console.log('📦 Datos de ejemplo:');
  if (result1.data.length > 0) {
    console.log(JSON.stringify(result1.data[0], null, 2));
  }
} catch (error) {
  console.log('❌ ERROR al parsear archivo mal formateado:');
  console.log(`   ${error.message}\n`);
}

// Test 2: Archivo bien formateado
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('TEST 2: Archivo CSV bien formateado (control)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

try {
  const result2 = await fileParserService.parseCSV(wellFormedFile);
  
  console.log('✅ ÉXITO - Archivo parseado correctamente\n');
  console.log(`📊 Columnas detectadas: ${result2.headers.length}`);
  console.log(`📋 Headers: ${result2.headers.join(', ')}\n`);
  console.log(`📄 Registros: ${result2.rowCount}`);
  
  console.log('\n📦 Datos de ejemplo:');
  if (result2.data.length > 0) {
    console.log(JSON.stringify(result2.data[0], null, 2));
  }
} catch (error) {
  console.log('❌ ERROR al parsear archivo bien formateado:');
  console.log(`   ${error.message}\n`);
}

// Limpiar archivos de prueba
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧹 Limpiando archivos de prueba...');
fs.unlinkSync(malFormedFile);
fs.unlinkSync(wellFormedFile);
fs.rmdirSync(testDir);
console.log('✅ Archivos de prueba eliminados\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ PRUEBAS COMPLETADAS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
