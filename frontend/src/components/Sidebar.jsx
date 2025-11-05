import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Upload,
  History,
  User,
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      to: '/odoo-config',
      icon: Settings,
      label: 'Configuración Odoo',
    },
    {
      to: '/import',
      icon: Upload,
      label: 'Importar',
    },
    {
      to: '/history',
      icon: History,
      label: 'Historial',
    },
    {
      to: '/profile',
      icon: User,
      label: 'Perfil',
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-[57px] h-[calc(100vh-57px)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: '16rem' }}
    >
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;


