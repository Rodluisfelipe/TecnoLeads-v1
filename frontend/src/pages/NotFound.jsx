import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold mb-4">Página No Encontrada</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver Atrás</span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary flex items-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Ir al Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


