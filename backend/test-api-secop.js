import axios from 'axios';

async function testSecopAPI() {
  try {
    console.log('🔍 Probando API oficial de SECOP II...\n');
    
    // OPCIÓN 1: API de SECOP II Community
    console.log('1️⃣ Intentando API Community SECOP...');
    try {
      // Basado en el link del HTML: https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9044343
      const apiUrl = 'https://www.secop.gov.co/CO1BPSC/api/Tender/GetOpportunity';
      const params = {
        noticeUID: 'CO1.NTC.9044343'
      };
      
      const response = await axios.get(apiUrl, {
        params,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 15000
      });
      
      console.log('✅ API Community respondió');
      console.log('Status:', response.status);
      console.log('Data keys:', Object.keys(response.data));
      
      // Buscar fechas en la respuesta
      const dataStr = JSON.stringify(response.data);
      if (dataStr.includes('2025-11-20')) {
        console.log('🎯 Fecha encontrada en la respuesta!');
      }
      console.log('\nRespuesta completa:');
      console.log(JSON.stringify(response.data, null, 2).substring(0, 2000));
      return;
    } catch (e) {
      console.log('❌ Falló:', e.response?.status || e.message);
    }
    
    // OPCIÓN 2: API pública de SECOP II
    console.log('\n2️⃣ Intentando API pública...');
    try {
      const publicUrl = 'https://www.colombiacompra.gov.co/api/v1/notices';
      const params = {
        reference: 'FDLBU-SASI-008-2025'
      };
      
      const response = await axios.get(publicUrl, {
        params,
        timeout: 15000
      });
      
      console.log('✅ API pública respondió');
      console.log(JSON.stringify(response.data, null, 2));
    } catch (e) {
      console.log('❌ Falló:', e.response?.status || e.message);
    }
    
    // OPCIÓN 3: Scraping del HTML con el código que ya tenemos
    console.log('\n3️⃣ Extrayendo del HTML de licitaciones.info...');
    try {
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
        console.log('  Nombre:', contrato.Nombre);
        console.log('  Entidad:', contrato.EntidadContratante);
        console.log('  Valor:', contrato.Valor);
        console.log('  📅 Fecha Vencimiento:', contrato.FechaVencimiento);
        console.log('  Fecha Publicación:', contrato.FechaPublicacion);
        console.log('  Estado:', contrato.estado_agrupado);
        console.log('  Link SECOP:', contrato.Link);
        
        console.log('\n🎯 FECHA DE CIERRE ENCONTRADA:', contrato.FechaVencimiento);
        return contrato;
      } else {
        console.log('❌ No se pudo extraer el JSON del HTML');
      }
    } catch (e) {
      console.log('❌ Falló:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testSecopAPI();
