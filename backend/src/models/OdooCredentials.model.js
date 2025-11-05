import mongoose from 'mongoose';

const odooCredentialsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: [true, 'La URL de Odoo es requerida'],
    trim: true,
  },
  database: {
    type: String,
    required: [true, 'El nombre de la base de datos es requerido'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'El usuario de Odoo es requerido'],
    trim: true,
  },
  // Password cifrado con AES
  encryptedPassword: {
    type: String,
    required: [true, 'La contraseña es requerida'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastTested: {
    type: Date,
  },
  lastTestResult: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending',
  },
  lastTestMessage: {
    type: String,
  },
}, {
  timestamps: true,
});

// Nota: userId ya tiene índice único definido en el schema (línea 8)
// No es necesario definirlo nuevamente aquí

const OdooCredentials = mongoose.model('OdooCredentials', odooCredentialsSchema);

export default OdooCredentials;

