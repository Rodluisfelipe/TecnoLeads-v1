import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState } from 'react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Cerrado por defecto

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1">
        {/* Sidebar oculto en móviles, visible en desktop */}
        <div className="hidden lg:block">
          <Sidebar isOpen={sidebarOpen} />
        </div>
        
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
          }`}
        >
          <div className="app-padding py-4 sm:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
      }`}>
        <div className="app-padding py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4 text-center sm:text-left">
            {/* Información del desarrollador */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium hidden sm:inline">Desarrollado por</span>
              <a
                href="https://github.com/Rodluisfelipe"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-semibold group"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="truncate">Felipe Rodríguez</span>
              </a>
            </div>

            {/* Empresa */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium hidden sm:inline">para</span>
              <div className="flex items-center gap-1 sm:gap-2 text-blue-600 dark:text-blue-400 font-semibold group">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="truncate max-w-[200px] sm:max-w-none">Tecnophone Colombia SAS</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;


