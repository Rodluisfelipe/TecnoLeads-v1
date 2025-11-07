import axios from 'axios';

async function analizarEnlace(url) {
  try {
    console.log('🔍 Analizando enlace:', url);
    console.log('═'.repeat(80));
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const html = response.data;
    
    // Extraer el JSON del atributo contrato
    const contratoMatch = html.match(/contrato="({&quot;[^"]+})"/);
    if (!contratoMatch) {
      console.log('❌ No se encontró el JSON embebido en el HTML');
      return;
    }
    
    // Decodificar HTML entities
    const jsonStr = contratoMatch[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
    
    const contrato = JSON.parse(jsonStr);
    
    // Mostrar todos los datos en formato tabla
    console.log('\n📊 DATOS EXTRAÍDOS DEL CONTRATO\n');
    console.log('═'.repeat(80));
    
    // Función para formatear valores
    const formatear = (valor) => {
      if (valor === null || valor === undefined) return '(vacío)';
      if (typeof valor === 'object') return JSON.stringify(valor);
      if (typeof valor === 'number') return valor.toLocaleString('es-CO');
      if (typeof valor === 'string' && valor.length > 100) return valor.substring(0, 97) + '...';
      return valor;
    };
    
    // Ordenar campos por categorías
    const categorias = {
      '🔑 IDENTIFICACIÓN': [
        'id_fuente_contract',
        'idContrato',
        'CodigoProceso',
        'Numero',
        'Random',
        'idUltimaFase'
      ],
      '📋 INFORMACIÓN GENERAL': [
        'Nombre',
        'Objeto',
        'EntidadContratante',
        'name_mostrar',
        'modalidad',
        'name_proceso',
        'tipo_secop'
      ],
      '💰 VALORES': [
        'Valor',
        'precio_base',
        'Cuantia'
      ],
      '📅 FECHAS': [
        'FechaVencimiento',
        'FechaPublicacion',
        'FechaCracionSETCON',
        'FechaActualizacionEstado',
        'fechaUltimoRefresco',
        'fecha_publicacion'
      ],
      '📍 UBICACIÓN': [
        'TextoDepartamento',
        'Ubicacion',
        'departamento',
        'ciudad'
      ],
      '📊 ESTADO': [
        'Estado',
        'estado_agrupado',
        'estado',
        'fase'
      ],
      '🏷️ CLASIFICACIÓN': [
        'Clase',
        'Grupo',
        'Familia',
        'Segmento',
        'Familia',
        'actividad_filter',
        'Actividad_Economica',
        'Codigos_UNSPSC'
      ],
      '🔗 ENLACES': [
        'Link',
        'LinkDocumento',
        'urlproceso',
        'Enlace'
      ],
      '📄 DOCUMENTOS': [
        'NumeroDocumentos'
      ],
      '🏢 ENTIDAD': [
        'idDian',
        'nit_dian',
        'nombre_dian',
        'licicodigos'
      ],
      '⚙️ METADATOS': [
        'EsSecop',
        'icon',
        'nombre',
        'color',
        'alias_fuente',
        'key_config',
        'tipo',
        'leido',
        'seguimiento_vigente'
      ]
    };
    
    // Mostrar por categorías
    for (const [categoria, campos] of Object.entries(categorias)) {
      console.log(`\n${categoria}`);
      console.log('─'.repeat(80));
      
      let hayDatos = false;
      for (const campo of campos) {
        if (contrato.hasOwnProperty(campo)) {
          const valor = formatear(contrato[campo]);
          console.log(`  ${campo.padEnd(30)} │ ${valor}`);
          hayDatos = true;
        }
      }
      
      if (!hayDatos) {
        console.log('  (sin datos)');
      }
    }
    
    // Mostrar campos adicionales que no están en las categorías
    console.log('\n🔍 OTROS CAMPOS');
    console.log('─'.repeat(80));
    const camposConocidos = Object.values(categorias).flat();
    const camposAdicionales = Object.keys(contrato).filter(k => !camposConocidos.includes(k));
    
    if (camposAdicionales.length > 0) {
      camposAdicionales.forEach(campo => {
        const valor = formatear(contrato[campo]);
        console.log(`  ${campo.padEnd(30)} │ ${valor}`);
      });
    } else {
      console.log('  (ninguno)');
    }
    
    // Resumen
    console.log('\n═'.repeat(80));
    console.log(`\n📊 RESUMEN:`);
    console.log(`   Total de campos: ${Object.keys(contrato).length}`);
    console.log(`   Campos con datos: ${Object.values(contrato).filter(v => v !== null && v !== undefined && v !== '').length}`);
    console.log(`\n✅ Análisis completado`);
    
    // Mostrar JSON completo al final (opcional, comentado)
    // console.log('\n\n📄 JSON COMPLETO:');
    // console.log(JSON.stringify(contrato, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
const url = process.argv[2] || 'https://col.licitaciones.info/detalle-contrato?random=68f6c7c0599084.13185275';
analizarEnlace(url);
