import { Menu, Moon, Sun, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left side */}
          <div className="flex items-center space-x-1 sm:space-x-3 min-w-0">
            {/* Hamburger solo visible en desktop */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors items-center justify-center min-w-[44px] min-h-[44px]"
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400 truncate">
              TecnoLeads
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
              aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
                aria-label="Menú de usuario"
                aria-expanded={showUserMenu}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden md:block max-w-[100px] lg:max-w-[150px] truncate">
                  {user?.name}
                </span>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  {/* Overlay para cerrar el menú al hacer click fuera */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                    aria-hidden="true"
                  />
                  
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm sm:text-base font-medium truncate">{user?.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm sm:text-base hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[48px]"
                    >
                      <User className="w-5 h-5 flex-shrink-0" />
                      <span>Mi Perfil</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm sm:text-base text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[48px] rounded-b-lg"
                    >
                      <LogOut className="w-5 h-5 flex-shrink-0" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


