import xmlrpc from 'xmlrpc';
import { decrypt } from '../utils/encryption.util.js';

class OdooService {
  constructor(credentials) {
    this.url = credentials.url;
    this.db = credentials.database;
    this.username = credentials.username;
    this.password = decrypt(credentials.encryptedPassword);
    this.uid = null;
  }

  // Autenticar con Odoo
  async authenticate() {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/common',
      });

      client.methodCall('authenticate', [
        this.db,
        this.username,
        this.password,
        {}
      ], (error, uid) => {
        if (error) {
          reject(new Error(`Error de autenticación: ${error.message}`));
        } else if (!uid) {
          reject(new Error('Credenciales inválidas'));
        } else {
          this.uid = uid;
          resolve(uid);
        }
      });
    });
  }

  // Probar conexión
  async testConnection() {
    try {
      const uid = await this.authenticate();
      
      // Verificar acceso al modelo crm.lead
      const hasAccess = await this.checkModelAccess('crm.lead');
      
      return {
        success: true,
        message: 'Conexión exitosa con Odoo',
        userId: uid,
        hasAccess,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Verificar acceso a un modelo
  async checkModelAccess(model) {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        model,
        'check_access_rights',
        ['read'],
        { raise_exception: false }
      ], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Obtener campos del modelo crm.lead
  async getModelFields(model = 'crm.lead') {
    if (!this.uid) {
      await this.authenticate();
    }

    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        model,
        'fields_get',
        [],
        { attributes: ['string', 'type', 'required', 'readonly'] }
      ], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Buscar leads duplicados
  async searchLeads(filters) {
    if (!this.uid) {
      await this.authenticate();
    }

    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'crm.lead',
        'search',
        [filters]
      ], (error, ids) => {
        if (error) {
          reject(error);
        } else {
          resolve(ids);
        }
      });
    });
  }

  // Buscar o crear partner/cliente en Odoo
  async findOrCreatePartner(partnerName, extraData = {}) {
    if (!this.uid) {
      await this.authenticate();
    }

    try {
      // 1. Buscar si el partner ya existe
      const existingPartners = await this.searchPartner(partnerName);
      
      if (existingPartners.length > 0) {
        // Partner existe - obtener sus datos completos
        const partnerData = await this.getPartnerData(existingPartners[0]);
        console.log(`✅ Partner encontrado: ${partnerName} (ID: ${existingPartners[0]})`);
        return {
          id: existingPartners[0],
          name: partnerData.name || partnerName,
          email: partnerData.email || null,
          phone: partnerData.phone || null,
          // mobile: NO existe en Odoo 19
          city: partnerData.city || null,
          state_id: partnerData.state_id ? partnerData.state_id[0] : null,
          country_id: partnerData.country_id ? partnerData.country_id[0] : null,
          existing: true,
        };
      }

      // 2. Partner NO existe - crear uno nuevo
      console.log(`📝 Creando nuevo partner: ${partnerName}`);
      const newPartnerId = await this.createPartner({
        name: partnerName,
        // customer_rank: 1, // Campo no disponible en Odoo 19
        ...extraData,
      });

      return {
        id: newPartnerId,
        name: partnerName,
        email: extraData.email || null,
        phone: extraData.phone || null,
        // mobile: NO existe en Odoo 19
        city: extraData.city || null,
        existing: false,
      };
    } catch (error) {
      console.error('Error en findOrCreatePartner:', error);
      throw error;
    }
  }

  // Buscar partner por nombre
  async searchPartner(name) {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'res.partner',
        'search',
        [[['name', 'ilike', name]]] // ilike = búsqueda case-insensitive
      ], (error, ids) => {
        if (error) {
          reject(error);
        } else {
          resolve(ids);
        }
      });
    });
  }

  // Obtener datos completos de un partner
  async getPartnerData(partnerId) {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'res.partner',
        'read',
        [[partnerId]],
        { fields: ['name', 'email', 'phone', 'street', 'city', 'state_id', 'country_id', 'website'] } // mobile NO existe en Odoo 19
      ], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result[0] || {});
        }
      });
    });
  }

  // Crear un nuevo partner
  async createPartner(partnerData) {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'res.partner',
        'create',
        [partnerData]
      ], (error, id) => {
        if (error) {
          reject(error);
        } else {
          resolve(id);
        }
      });
    });
  }

  // Buscar o crear tag en Odoo (crm.tag)
  async findOrCreateTag(tagName) {
    if (!this.uid) {
      await this.authenticate();
    }

    try {
      // 1. Buscar si el tag ya existe
      const existingTags = await this.searchTag(tagName);
      
      if (existingTags.length > 0) {
        console.log(`✅ Tag encontrado: ${tagName} (ID: ${existingTags[0]})`);
        return existingTags[0];
      }

      // 2. Tag NO existe - crear uno nuevo
      console.log(`📝 Creando nuevo tag: ${tagName}`);
      const newTagId = await this.createTag(tagName);
      return newTagId;
    } catch (error) {
      console.error(`Error en findOrCreateTag para "${tagName}":`, error.message);
      return null;
    }
  }

  // Buscar tag por nombre
  async searchTag(name) {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'crm.tag',
        'search',
        [[['name', '=', name]]]
      ], (error, ids) => {
        if (error) {
          reject(error);
        } else {
          resolve(ids);
        }
      });
    });
  }

  // Crear un nuevo tag
  async createTag(tagName) {
    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'crm.tag',
        'create',
        [{ name: tagName }]
      ], (error, id) => {
        if (error) {
          reject(error);
        } else {
          resolve(id);
        }
      });
    });
  }

  // Crear lead en Odoo
  async createLead(leadData) {
    if (!this.uid) {
      await this.authenticate();
    }

    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'crm.lead',
        'create',
        [[leadData]]  // Odoo XML-RPC espera [[vals]] no [vals]
      ], (error, id) => {
        if (error) {
          reject(error);
        } else {
          resolve(id);
        }
      });
    });
  }

  // Crear múltiples leads
  async createLeads(leadsData) {
    const results = {
      successful: [],
      duplicates: [],
      failed: [],
      partnersFound: 0,
      partnersCreated: 0,
    };

    console.log(`\n🔄 Procesando ${leadsData.length} leads para Odoo...`);

    for (const [index, leadData] of leadsData.entries()) {
      try {
        console.log(`\n📝 [${index + 1}/${leadsData.length}] Procesando: ${leadData.name}`);
        
        // Verificar duplicados por nombre
        const existingIds = await this.searchLeads([
          ['name', '=', leadData.name]
        ]);

        if (existingIds.length > 0) {
          console.log(`  ⚠️  Duplicado detectado (ID: ${existingIds[0]})`);
          results.duplicates.push({
            row: index + 1,
            reason: 'Ya existe una oportunidad con este nombre',
            existingId: existingIds[0],
            data: leadData,
          });
          continue;
        }

        // ✨ BUSCAR O CREAR PARTNER/CLIENTE
        let partner = null;
        const originalPartnerName = leadData.partner_name; // Guardar nombre original
        
        if (leadData.partner_name) {
          try {
            partner = await this.findOrCreatePartner(leadData.partner_name, {
              city: leadData.city,
              email: leadData.email_from,
              phone: leadData.phone,
            });

            // Actualizar estadísticas
            if (partner.existing) {
              results.partnersFound++;
            } else {
              results.partnersCreated++;
            }

            // Reemplazar partner_name con partner_id
            leadData.partner_id = partner.id;
            delete leadData.partner_name; // Eliminar para usar solo partner_id

            // Completar automáticamente email y teléfono si el partner ya existía
            if (partner.existing) {
              if (partner.email && !leadData.email_from) {
                leadData.email_from = partner.email;
                console.log(`  📧 Email autocompletado: ${partner.email}`);
              }
              if (partner.phone && !leadData.phone) {
                leadData.phone = partner.phone;
                console.log(`  📞 Teléfono autocompletado: ${partner.phone}`);
              }
              // mobile: NO existe en Odoo 19
            }
          } catch (partnerError) {
            console.warn(`⚠️ Error buscando/creando partner: ${partnerError.message}`);
            // Si falla, mantener partner_name como fallback (no se eliminó)
            // Restaurar partner_name si se eliminó
            if (!leadData.partner_name && !leadData.partner_id) {
              leadData.partner_name = originalPartnerName;
              console.log(`  ⚠️  Usando partner_name como fallback: ${originalPartnerName}`);
            }
          }
        }

        // ✨ BUSCAR O CREAR TAGS AUTOMÁTICAMENTE
        const tagIds = [];
        
        // Tag 1: Actividad Económica (Etiquetas) - Ej: "CAMARAS FOTOGRAFICAS Y AUDIO"
        if (leadData.actividad_economica) {
          try {
            // Limpiar y formatear
            const actividadTag = leadData.actividad_economica
              .toUpperCase()
              .replace(/\s+/g, ' ')
              .trim();
            const actividadTagId = await this.findOrCreateTag(actividadTag);
            if (actividadTagId) tagIds.push(actividadTagId);
            delete leadData.actividad_economica; // Remover campo temporal
          } catch (tagError) {
            console.warn(`⚠️ Error creando tag actividad: ${tagError.message}`);
          }
        }

        // Tag 3: TECNOPHONE (Empresa) - Solo si existe
        try {
          const tecnoTagId = await this.findOrCreateTag('TECNOPHONE');
          if (tecnoTagId) tagIds.push(tecnoTagId);
        } catch (tagError) {
          console.warn(`⚠️ Error buscando/creando tag TECNOPHONE: ${tagError.message}`);
        }

        // Asignar tags al lead
        if (tagIds.length > 0) {
          // Formato Odoo para asignar tags: [[6, 0, [id1, id2, id3]]]
          leadData.tag_ids = [[6, 0, tagIds]];
          console.log(`  🏷️  Tags asignados: ${tagIds.length} tags`);
        }

        // Crear lead en Odoo
        console.log(`  🔨 Creando lead en Odoo...`);
        const id = await this.createLead(leadData);
        console.log(`  ✅ Lead creado exitosamente con ID: ${id}`);
        
        results.successful.push({
          row: index + 1,
          id,
          data: leadData,
          partner: partner ? {
            id: partner.id,
            name: partner.name,
            existing: partner.existing,
          } : null,
        });
      } catch (error) {
        console.error(`  ❌ Error creando lead: ${error.message}`);
        console.error(`  📋 Stack trace completo:`, error);
        console.error(`  📄 Lead data que falló:`, JSON.stringify(leadData, null, 2));
        results.failed.push({
          row: index + 1,
          error: error.message,
          stack: error.stack,
          data: leadData,
        });
      }
    }

    console.log(`\n✅ Importación completada: ${results.successful.length} exitosos, ${results.failed.length} fallidos, ${results.duplicates.length} duplicados`);
    return results;
  }

  // 🆕 Crear o verificar campo de propiedad "FECHA Y HORA DE CIERRE"
  async ensureDatePropertyExists() {
    if (!this.uid) {
      await this.authenticate();
    }

    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      // Buscar si ya existe la definición de propiedad
      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'ir.property.definition',
        'search',
        [[
          ['name', '=', 'fecha_hora_cierre'],
          ['model', '=', 'crm.lead']
        ]]
      ], (error, ids) => {
        if (error) {
          console.warn('⚠️ No se pudo verificar propiedades (puede no estar disponible en esta versión):', error.message);
          resolve(null); // No es crítico, continuar sin error
        } else if (ids && ids.length > 0) {
          console.log('✅ Propiedad "fecha_hora_cierre" ya existe');
          resolve(ids[0]);
        } else {
          // Intentar crear la propiedad
          this.createDateProperty(client, resolve, reject);
        }
      });
    });
  }

  // Crear la definición de propiedad
  createDateProperty(client, resolve, reject) {
    console.log('🔧 Creando propiedad "FECHA Y HORA DE CIERRE"...');
    
    client.methodCall('execute_kw', [
      this.db,
      this.uid,
      this.password,
      'ir.property.definition',
      'create',
      [{
        name: 'fecha_hora_cierre',
        string: 'FECHA Y HORA DE CIERRE',
        type: 'datetime',
        model: 'crm.lead',
      }]
    ], (error, id) => {
      if (error) {
        console.warn('⚠️ No se pudo crear propiedad (puede requerir permisos):', error.message);
        resolve(null); // No es crítico
      } else {
        console.log('✅ Propiedad creada con ID:', id);
        resolve(id);
      }
    });
  }

  // Actualizar lead con valor de propiedad
  async updateLeadProperty(leadId, propertyName, value) {
    if (!this.uid) {
      await this.authenticate();
    }

    return new Promise((resolve, reject) => {
      const client = xmlrpc.createSecureClient({
        host: new URL(this.url).hostname,
        port: new URL(this.url).port || 443,
        path: '/xmlrpc/2/object',
      });

      // Actualizar usando el campo properties
      const updateData = {
        properties: {
          [propertyName]: value
        }
      };

      client.methodCall('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'crm.lead',
        'write',
        [[leadId], updateData]
      ], (error, result) => {
        if (error) {
          console.warn(`⚠️ No se pudo actualizar propiedad para lead ${leadId}:`, error.message);
          resolve(false);
        } else {
          console.log(`✅ Propiedad actualizada para lead ${leadId}`);
          resolve(result);
        }
      });
    });
  }
}

export default OdooService;

