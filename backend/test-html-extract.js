import axios from 'axios';

async function extractFromHTML() {
  try {
    console.log('🔍 Extrayendo fecha del HTML de licitaciones.info...\n');
    
    const htmlUrl = 'https://col.licitaciones.info/detalle-contrato?random=6904f45f1fe004.44179235';
    const response = await axios.get(htmlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const html = response.data;
    
    // Extraer el JSON embebido del componente Vue
    const contratoMatch = html.match(/contrato="({&quot;[^"]+})"/);
    if (contratoMatch) {
      // Decodificar HTML entities
      const jsonStr = contratoMatch[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
      
      const contrato = JSON.parse(jsonStr);
      console.log('✅ Datos extraídos del HTML:');
      console.log('  Código:', contrato.CodigoProceso);
      console.log('  Nombre:', contrato.Nombre?.substring(0, 80));
      console.log('  Entidad:', contrato.EntidadContratante);
      console.log('  Valor:', contrato.Valor);
      console.log('\n📅 FECHAS:');
      console.log('  Fecha Vencimiento:', contrato.FechaVencimiento);
      console.log('  Fecha Publicación:', contrato.FechaPublicacion);
      console.log('  Estado:', contrato.estado_agrupado);
      
      console.log('\n🎯 FECHA DE CIERRE DE OFERTAS:', contrato.FechaVencimiento);
      console.log('✅ Formato correcto para usar en el sistema!');
      
      return contrato;
    } else {
      console.log('❌ No se pudo extraer el JSON del HTML');
      console.log('Buscando patrón alternativo...');
      
      // Intentar con el patrón que funciona
      const codigoMatch = html.match(/"CodigoProceso":"([^"]+)"/);
      const fechaMatch = html.match(/"FechaVencimiento":"([^"]+)"/);
      
      if (codigoMatch && fechaMatch) {
        console.log('✅ Extraído con patrón alternativo:');
        console.log('  Código:', codigoMatch[1]);
        console.log('  Fecha Vencimiento:', fechaMatch[1]);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

extractFromHTML();
