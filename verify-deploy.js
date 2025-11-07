#!/usr/bin/env node

/**
 * Script de verificación pre-deploy
 * Verifica que el proyecto esté listo para desplegar en Render + Vercel
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const checks = [];
let errors = 0;
let warnings = 0;

console.log('🔍 VERIFICACIÓN PRE-DEPLOY - TecnoLeads\n');
console.log('═'.repeat(60));

// Check 1: package.json backend sin puppeteer
console.log('\n📦 Verificando package.json del backend...');
try {
  const backendPkg = JSON.parse(readFileSync(join(__dirname, 'backend/package.json'), 'utf8'));
  
  if (backendPkg.dependencies.puppeteer) {
    console.log('❌ ERROR: Puppeteer aún está en dependencies');
    errors++;
  } else {
    console.log('✅ Puppeteer eliminado correctamente');
  }
  
  if (backendPkg.scripts.postinstall && backendPkg.scripts.postinstall.includes('puppeteer')) {
    console.log('❌ ERROR: Script postinstall aún menciona puppeteer');
    errors++;
  } else {
    console.log('✅ Script postinstall limpio');
  }
  
  // Verificar dependencias necesarias
  const requiredDeps = ['axios', 'express', 'mongoose', 'cors', 'dotenv'];
  const missing = requiredDeps.filter(dep => !backendPkg.dependencies[dep]);
  if (missing.length > 0) {
    console.log(`⚠️  WARNING: Faltan dependencias: ${missing.join(', ')}`);
    warnings++;
  } else {
    console.log('✅ Todas las dependencias necesarias presentes');
  }
} catch (error) {
  console.log('❌ ERROR: No se pudo leer backend/package.json');
  errors++;
}

// Check 2: .env.example existe
console.log('\n🔐 Verificando archivos de configuración...');
if (existsSync(join(__dirname, 'backend/.env.example'))) {
  console.log('✅ backend/.env.example existe');
} else {
  console.log('⚠️  WARNING: backend/.env.example no existe');
  warnings++;
}

if (existsSync(join(__dirname, 'frontend/.env.example'))) {
  console.log('✅ frontend/.env.example existe');
} else {
  console.log('⚠️  WARNING: frontend/.env.example no existe');
  warnings++;
}

// Check 3: .gitignore protege .env
console.log('\n🛡️  Verificando .gitignore...');
try {
  const gitignore = readFileSync(join(__dirname, '.gitignore'), 'utf8');
  if (gitignore.includes('.env') || gitignore.includes('*.env')) {
    console.log('✅ .env protegido en .gitignore');
  } else {
    console.log('❌ ERROR: .env no está en .gitignore');
    errors++;
  }
} catch (error) {
  console.log('⚠️  WARNING: No se pudo leer .gitignore');
  warnings++;
}

// Check 4: render.yaml existe y es válido
console.log('\n🚀 Verificando configuración de Render...');
if (existsSync(join(__dirname, 'render.yaml'))) {
  const renderConfig = readFileSync(join(__dirname, 'render.yaml'), 'utf8');
  if (renderConfig.includes('puppeteer')) {
    console.log('⚠️  WARNING: render.yaml menciona puppeteer');
    warnings++;
  } else {
    console.log('✅ render.yaml sin referencias a puppeteer');
  }
  
  if (renderConfig.includes('rootDir: backend')) {
    console.log('✅ rootDir configurado correctamente');
  } else {
    console.log('❌ ERROR: rootDir no apunta a backend');
    errors++;
  }
} else {
  console.log('⚠️  WARNING: render.yaml no existe');
  warnings++;
}

// Check 5: vercel.json existe
console.log('\n🌐 Verificando configuración de Vercel...');
if (existsSync(join(__dirname, 'vercel.json'))) {
  try {
    const vercelConfig = JSON.parse(readFileSync(join(__dirname, 'vercel.json'), 'utf8'));
    console.log('✅ vercel.json existe y es válido');
    
    if (vercelConfig.buildCommand && vercelConfig.buildCommand.includes('frontend')) {
      console.log('⚠️  WARNING: buildCommand incluye carpeta frontend (puede causar problemas)');
      warnings++;
    }
  } catch (error) {
    console.log('❌ ERROR: vercel.json tiene errores de sintaxis');
    errors++;
  }
} else {
  console.log('⚠️  WARNING: vercel.json no existe');
  warnings++;
}

// Check 6: Archivos de scraping sin puppeteer
console.log('\n🔧 Verificando servicios de backend...');
try {
  const scraperService = readFileSync(join(__dirname, 'backend/src/services/scraper.service.js'), 'utf8');
  if (scraperService.includes('puppeteer')) {
    console.log('❌ ERROR: scraper.service.js aún importa puppeteer');
    errors++;
  } else {
    console.log('✅ scraper.service.js sin puppeteer');
  }
  
  if (scraperService.includes('axios')) {
    console.log('✅ scraper.service.js usa axios');
  } else {
    console.log('⚠️  WARNING: scraper.service.js no parece usar axios');
    warnings++;
  }
} catch (error) {
  console.log('⚠️  WARNING: No se pudo verificar scraper.service.js');
  warnings++;
}

// Check 7: Frontend tiene build script
console.log('\n⚛️  Verificando frontend...');
try {
  const frontendPkg = JSON.parse(readFileSync(join(__dirname, 'frontend/package.json'), 'utf8'));
  if (frontendPkg.scripts.build) {
    console.log('✅ Script de build configurado');
  } else {
    console.log('❌ ERROR: No hay script de build en frontend');
    errors++;
  }
} catch (error) {
  console.log('❌ ERROR: No se pudo leer frontend/package.json');
  errors++;
}

// Check 8: Zona horaria corregida
console.log('\n⏰ Verificando corrección de zona horaria...');
try {
  const secopService = readFileSync(join(__dirname, 'backend/src/services/secopApi.service.js'), 'utf8');
  if (secopService.includes('setHours(fecha.getHours() + 5)')) {
    console.log('✅ Corrección de zona horaria aplicada (+5 horas)');
  } else if (secopService.includes('setHours(fecha.getHours() - 5)')) {
    console.log('❌ ERROR: Corrección de zona horaria incorrecta (-5 en lugar de +5)');
    errors++;
  } else {
    console.log('⚠️  WARNING: No se detectó corrección de zona horaria');
    warnings++;
  }
} catch (error) {
  console.log('⚠️  WARNING: No se pudo verificar secopApi.service.js');
  warnings++;
}

// Resumen final
console.log('\n' + '═'.repeat(60));
console.log('\n📊 RESUMEN DE VERIFICACIÓN\n');

if (errors === 0 && warnings === 0) {
  console.log('✅ ¡TODO PERFECTO! El proyecto está listo para deploy\n');
  console.log('Próximos pasos:');
  console.log('1. git add . && git commit -m "chore: preparar para deploy"');
  console.log('2. git push origin main');
  console.log('3. Seguir DEPLOY_GUIDE.md para desplegar en Render + Vercel');
  process.exit(0);
} else {
  console.log(`❌ Errores críticos: ${errors}`);
  console.log(`⚠️  Advertencias: ${warnings}\n`);
  
  if (errors > 0) {
    console.log('⚠️  Hay errores que deben corregirse antes del deploy');
    process.exit(1);
  } else {
    console.log('⚠️  Hay advertencias, pero puedes continuar con precaución');
    process.exit(0);
  }
}
