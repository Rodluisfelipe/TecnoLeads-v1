import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.model.js';

dotenv.config();

async function checkUsers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar todos los usuarios
    const users = await User.find({});
    
    console.log('\n📊 Usuarios en la base de datos:');
    console.log('================================');
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados');
      console.log('\n💡 Necesitas registrar un usuario primero.');
      console.log('   Opciones:');
      console.log('   1. Usar el botón "Registrarse" en la app');
      console.log('   2. Ejecutar: node create-test-user.js');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. Usuario:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nombre: ${user.name}`);
        console.log(`   Compañía: ${user.company || 'N/A'}`);
        console.log(`   Activo: ${user.isActive ? '✅' : '❌'}`);
        console.log(`   Último login: ${user.lastLogin || 'Nunca'}`);
      });
    }
    
    console.log('\n================================');
    
    await mongoose.connection.close();
    console.log('\n✅ Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
