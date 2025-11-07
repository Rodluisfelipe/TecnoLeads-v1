import { useEffect, useState } from 'react';
import { Server, Database, User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import odooService from '../services/odooService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const OdooConfig = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [formData, setFormData] = useState({
    url: '',
    database: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const response = await odooService.getCredentials();
      if (response.success) {
        setCredentials(response.data);
        setFormData({
          url: response.data.url,
          database: response.data.database,
          username: response.data.username,
          password: '', // No mostramos la contraseña
        });
      }
    } catch (error) {
      // No hay credenciales configuradas
      console.log('No hay credenciales configuradas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await odooService.saveCredentials(formData);
      if (response.success) {
        toast.success('Credenciales guardadas exitosamente');
        await loadCredentials();
        setFormData({ ...formData, password: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar credenciales');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);

    try {
      const response = await odooService.testConnection();
      if (response.success) {
        toast.success('Conexión exitosa con Odoo');
        await loadCredentials();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al conectar con Odoo');
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar las credenciales de Odoo?')) {
      return;
    }

    try {
      const response = await odooService.deleteCredentials();
      if (response.success) {
        toast.success('Credenciales eliminadas');
        setCredentials(null);
        setFormData({
          url: '',
          database: '',
          username: '',
          password: '',
        });
      }
    } catch (error) {
      toast.error('Error al eliminar credenciales');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuración de Odoo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configura las credenciales de conexión a tu instancia de Odoo
        </p>
      </div>

      {/* Estado de la conexión */}
      {credentials && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {credentials.lastTestResult === 'success' ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-600">Conexión Activa</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Última prueba: {new Date(credentials.lastTested).toLocaleString()}
                    </p>
                  </div>
                </>
              ) : credentials.lastTestResult === 'failed' ? (
                <>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-600">Conexión Fallida</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {credentials.lastTestMessage}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-600">Sin Probar</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Prueba la conexión para verificar
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="btn-primary"
            >
              {testing ? <LoadingSpinner size="sm" /> : 'Probar Conexión'}
            </button>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Credenciales de Acceso</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              URL del Servidor Odoo
            </label>
            <div className="relative">
              <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="https://tu-empresa.odoo.com"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ejemplo: https://miempresa.odoo.com o https://odoo.midominio.com
            </p>
          </div>

          {/* Database */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre de la Base de Datos
            </label>
            <div className="relative">
              <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="database"
                value={formData.database}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="mi-base-datos"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Usuario / Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="admin@empresa.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {credentials ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="••••••••"
                required={!credentials}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Las credenciales se cifran con AES-256 antes de guardarse
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? <LoadingSpinner size="sm" /> : 'Guardar Credenciales'}
            </button>

            {credentials && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Información adicional */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-bold mb-2 text-blue-900 dark:text-blue-200">
          ℹ️ Información Importante
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Necesitas permisos de administrador o acceso al modelo crm.lead en Odoo</li>
          <li>Puedes usar tu contraseña de Odoo o un API token</li>
          <li>Las credenciales se almacenan de forma segura con cifrado AES-256</li>
          <li>Compatible con Odoo 14, 15, 16, 17, 18, 19</li>
        </ul>
      </div>
    </div>
  );
};

export default OdooConfig;


