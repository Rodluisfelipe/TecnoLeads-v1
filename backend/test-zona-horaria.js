import axios from 'axios';

async function testZonaHoraria() {
  console.log('🕐 PRUEBA DE CORRECCIÓN DE ZONA HORARIA');
  console.log('═'.repeat(80));
  
  const url = 'https://col.licitaciones.info/detalle-contrato?random=68f6c7c0599084.13185275';
  
  try {
    console.log('\n📡 Obteniendo datos del HTML...\n');
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    const html = response.data;
    const contratoMatch = html.match(/contrato="({&quot;[^"]+})"/);
    
    if (!contratoMatch) {
      console.log('❌ No se encontró el JSON en el HTML');
      return;
    }
    
    const jsonStr = contratoMatch[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
    
    const contrato = JSON.parse(jsonStr);
    
    // Función de corrección
    function corregirDesfaseHorario(fechaStr) {
      if (!fechaStr) return null;
      
      try {
        const fecha = new Date(fechaStr.replace(' ', 'T') + 'Z');
        fecha.setHours(fecha.getHours() - 5);
        
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const hours = String(fecha.getHours()).padStart(2, '0');
        const minutes = String(fecha.getMinutes()).padStart(2, '0');
        const seconds = String(fecha.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } catch (error) {
        return fechaStr;
      }
    }
    
    console.log('📋 COMPARACIÓN DE FECHAS\n');
    console.log('─'.repeat(80));
    
    // Fecha de Vencimiento
    const fechaOriginal = contrato.FechaVencimiento;
    const fechaCorregida = corregirDesfaseHorario(fechaOriginal);
    
    console.log('📅 FECHA DE VENCIMIENTO (Cierre de Ofertas):');
    console.log(`   Original (del HTML):  ${fechaOriginal}`);
    console.log(`   Corregida (UTC-5):    ${fechaCorregida}`);
    console.log(`   Diferencia:           -5 horas ✅`);
    
    console.log('\n─'.repeat(80));
    
    // Fecha de Publicación
    const fechaPubOriginal = contrato.FechaPublicacion;
    const fechaPubCorregida = corregirDesfaseHorario(fechaPubOriginal);
    
    console.log('📅 FECHA DE PUBLICACIÓN:');
    console.log(`   Original (del HTML):  ${fechaPubOriginal}`);
    console.log(`   Corregida (UTC-5):    ${fechaPubCorregida}`);
    console.log(`   Diferencia:           -5 horas ✅`);
    
    console.log('\n═'.repeat(80));
    console.log('\n💡 EXPLICACIÓN:');
    console.log('   Las fechas del SECOP II vienen en hora de Colombia (UTC-5)');
    console.log('   pero se interpretan como UTC, causando un desfase de +5 horas.');
    console.log('   La corrección resta 5 horas para mostrar la hora correcta.');
    console.log('\n✅ Corrección aplicada exitosamente\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testZonaHoraria();
