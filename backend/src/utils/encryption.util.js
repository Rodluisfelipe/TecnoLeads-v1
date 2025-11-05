import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';

export const encrypt = (text) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Error al cifrar:', error);
    throw new Error('Error al cifrar los datos');
  }
};

export const decrypt = (encryptedText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Error al descifrar');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Error al descifrar:', error);
    throw new Error('Error al descifrar los datos');
  }
};


