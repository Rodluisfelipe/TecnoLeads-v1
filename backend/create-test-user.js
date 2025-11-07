import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.model.js';

dotenv.config();

async function createTestUser() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Datos del usuario de prueba
    const testUserData = {
      name: 'Usuario de Prueba',
      email: 'admin@tecnoleads.com',
      password: 'admin123',
      company: 'TecnoLeads',
    };

    // Verificar si ya existe
    const existingUser = await User.findOne({ email: testUserData.email });
    
    if (existingUser) {
      console.log('\n⚠️  El usuario ya existe:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Nombre: ${existingUser.name}`);
      console.log('\n💡 Puedes usar estas credenciales para iniciar sesión:');
      console.log(`   Email: ${testUserData.email}`);
      console.log(`   Password: ${testUserData.password}`);
    } else {
      // Crear usuario
      const user = await User.create(testUserData);
      
      console.log('\n✅ Usuario de prueba creado exitosamente!');
      console.log('\n📋 Credenciales:');
      console.log('================================');
      console.log(`Email: ${testUserData.email}`);
      console.log(`Password: ${testUserData.password}`);
      console.log('================================');
      console.log('\n💡 Usa estas credenciales para iniciar sesión en la app.');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Desconectado de MongoDB\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
