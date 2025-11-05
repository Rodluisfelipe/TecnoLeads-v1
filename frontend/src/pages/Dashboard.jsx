import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Settings,
} from 'lucide-react';
import importService from '../services/importService';
import odooService from '../services/odooService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [hasOdooConfig, setHasOdooConfig] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Verificar configuración de Odoo
      try {
        await odooService.getCredentials();
        setHasOdooConfig(true);
      } catch (error) {
        setHasOdooConfig(false);
      }

      // Cargar estadísticas
      const response = await importService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      title: 'Total Importaciones',
      value: stats?.stats.totalImports || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Registros Procesados',
      value: stats?.stats.totalRecords || 0,
      icon: Upload,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      title: 'Exitosos',
      value: stats?.stats.totalSuccessful || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Fallidos',
      value: stats?.stats.totalFailed || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen de tus importaciones y estadísticas
        </p>
      </div>

      {/* Alerta de configuración */}
      {!hasOdooConfig && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <Settings className="w-5 h-5 text-yellow-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Configuración de Odoo requerida
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Debes configurar tus credenciales de Odoo antes de importar datos.
              </p>
            </div>
            <button
              onClick={() => navigate('/odoo-config')}
              className="btn-primary text-sm"
            >
              Configurar Ahora
            </button>
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico y acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Importaciones recientes */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-bold mb-4">Importaciones Recientes</h2>
          
          {stats?.recentImports && stats.recentImports.length > 0 ? (
            <div className="space-y-3">
              {stats.recentImports.map((importItem) => (
                <div
                  key={importItem._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{importItem.fileName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {importItem.successfulRecords} de {importItem.totalRecords} registros
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        importItem.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : importItem.status === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {importItem.status === 'completed' ? 'Completado' : 
                       importItem.status === 'failed' ? 'Fallido' : 'Procesando'}
                    </span>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(importItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay importaciones recientes</p>
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/import')}
              disabled={!hasOdooConfig}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Nueva Importación</span>
            </button>

            <button
              onClick={() => navigate('/odoo-config')}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Settings className="w-5 h-5" />
              <span>Configurar Odoo</span>
            </button>

            <button
              onClick={() => navigate('/history')}
              className="w-full btn-outline flex items-center justify-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Ver Historial</span>
            </button>
          </div>

          {/* Tiempo promedio */}
          {stats?.stats.avgDuration && (
            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tiempo Promedio</span>
                <TrendingUp className="w-4 h-4 text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {Math.round(stats.stats.avgDuration)}s
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


