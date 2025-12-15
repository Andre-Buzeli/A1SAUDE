import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Crown,
  MapPin,
  BarChart3,
  Home,
  Users,
  Building2,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

interface AdminManagerLayoutProps {
  children: React.ReactNode;
  managerType: 'geral' | 'local' | 'total';
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const AdminManagerLayout: React.FC<AdminManagerLayoutProps> = ({ children, managerType }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getManagerConfig = () => {
    switch (managerType) {
      case 'geral':
        return {
          title: 'Gestor Geral',
          subtitle: 'Administração Completa da Rede',
          icon: <Crown className="w-6 h-6" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/20'
        };
      case 'local':
        return {
          title: 'Gestor Local',
          subtitle: 'Gestão do Estabelecimento',
          icon: <MapPin className="w-6 h-6" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          borderColor: 'border-blue-400/20'
        };
      case 'total':
        return {
          title: 'Gestor Total',
          subtitle: 'Visão Estratégica Consolidada',
          icon: <BarChart3 className="w-6 h-6" />,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/20'
        };
      default:
        return {
          title: 'Gestor',
          subtitle: 'Administração',
          icon: <Crown className="w-6 h-6" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20'
        };
    }
  };

  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home className="w-5 h-5" />,
        path: `/dev/gestor-${managerType}`
      }
    ];

    switch (managerType) {
      case 'geral':
        return [
          ...baseItems,
          {
            id: 'establishments',
            label: 'Estabelecimentos',
            icon: <Building2 className="w-5 h-5" />,
            path: `/dev/gestor-${managerType}/establishments`
          },
          {
            id: 'users',
            label: 'Usuários',
            icon: <Users className="w-5 h-5" />,
            path: `/dev/gestor-${managerType}/users`,
            badge: 3
          },
          {
            id: 'reports',
            label: 'Relatórios',
            icon: <FileText className="w-5 h-5" />,
            path: `/dev/gestor-${managerType}/reports`
          },
          {
            id: 'settings',
            label: 'Configurações',
            icon: <Settings className="w-5 h-5" />,
            path: `/dev/gestor-${managerType}/settings`
          }
        ];
      case 'local':
        return [
          ...baseItems,
          {
            id: 'staff',
            label: 'Equipe',
            icon: <Users className="w-5 h-5" />,
            path: `/dev/gestor-${managerType}/staff`
          },
          {
            id: 'operations',
            label: 'Operações',
            icon: <Settings className="w-5 h-5" />,
            path: `/dev/gestor-${managerType}/operations`
          },
          {
            id: 'reports',
            label: 'Relatórios',
            icon: <FileText className="w-5 h-5" />,
            path: `/dev/gestor-${managerType}/reports`
          }
        ];
      case 'total':
        return [
          ...baseItems,
          {
            id: 'analytics',
            label: 'Análises',
            icon: <BarChart3 className="w-5 h-5" />,
            path: `/dev/gestor-${managerType}/analytics`
          },
          {
            id: 'regions',
            label: 'Regiões',
            icon: <MapPin className="w-5 h-5" />,
            path: `/dev/gestor-${managerType}/regions`
          },
          {
            id: 'strategic',
            label: 'Estratégico',
            icon: <Crown className="w-5 h-5" />,
            path: `/dev/gestor-${managerType}/strategic`
          }
        ];
      default:
        return baseItems;
    }
  };

  const config = getManagerConfig();
  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        transition={{ duration: 0.3 }}
        aria-hidden={!sidebarOpen}
        className={`fixed left-0 top-0 h-full w-80 z-40 ${sidebarOpen ? '' : 'pointer-events-none'}`}
      >
        <GlassCard className="h-full rounded-none border-r border-white/10">
          <div className="p-6">
            {/* Header */}
            <div className={`flex items-center space-x-3 p-4 rounded-lg ${config.bgColor} ${config.borderColor} border mb-6`}>
              <div className={config.color}>
                {config.icon}
              </div>
              <div>
                <h2 className="text-white font-semibold">{config.title}</h2>
                <p className="text-white/60 text-sm">{config.subtitle}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Menu Items */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 4 }}
                  className="group"
                >
                  <Link
                    to={item.path}
                    className="flex items-center justify-between p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="group-hover:text-white/90">
                        {item.icon}
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          {/* User Profile */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-medium">Admin User</p>
                  <p className="text-white/60 text-sm">{config.title}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-0 right-0 mb-2"
                >
                  <GlassCard className="p-2">
                    <button className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors">
                      <User className="w-4 h-4" />
                      <span>Perfil</span>
                    </button>
                    <button className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />
                      <span>Configurações</span>
                    </button>
                    <hr className="border-white/10 my-2" />
                    <button className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors">
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </GlassCard>
                </motion.div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-8'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-2">
                <div className={config.color}>
                  {config.icon}
                </div>
                <h1 className="text-xl font-semibold text-white">{config.title}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <GlassButton variant="ghost" size="sm">
                <a href="/dev" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Voltar ao Dev</span>
                </a>
              </GlassButton>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminManagerLayout;
