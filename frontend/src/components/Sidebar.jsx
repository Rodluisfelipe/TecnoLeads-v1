import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Upload, History, User, X } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/odoo-config', icon: Settings, label: 'Configuración Odoo' },
  { to: '/import', icon: Upload, label: 'Importar' },
  { to: '/history', icon: History, label: 'Historial' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

const SidebarNav = ({ onNavigate }) => (
  <nav className="px-4 py-6 space-y-1">
    {navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`
        }
      >
        <item.icon className="w-5 h-5" />
        <span>{item.label}</span>
      </NavLink>
    ))}
  </nav>
);

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">TecnoLeads</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:bg-white lg:dark:bg-gray-900 lg:border-r lg:border-gray-200 lg:dark:border-gray-800 lg:min-h-screen">
        <div className="sticky top-0">
          <SidebarNav />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


