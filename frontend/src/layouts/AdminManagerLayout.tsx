import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crown,
  MapPin,
  BarChart3,
  Menu,
  X,
  Home,
  Users,
  Building2,
  DollarSign,
  FileBarChart,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { useAuth } from '../contexts/AuthContext';

interface AdminManagerLayoutProps {
  managerType: 'geral' | 'local' | 'total';
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
  children?: MenuItem[];
}

const AdminManagerLayout: React.FC<AdminManagerLayoutProps> = ({ managerType }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Configuração específica para cada tipo de gestor
  const managerConfig = {
    geral: {
      title: 'Gestor Geral',
      subtitle: 'Visão completa de todos os estabelecimentos',
      icon: <Crown className="w-6 h-6" />,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20'
    },
    local: {
      title: 'Gestor Local',
      subtitle: 'Gestão específica do estabelecimento',
      icon: <MapPin className="w-6 h-6" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20'
    },
    total: {
      title: 'Gestor Total',
      subtitle: 'Visão consolidada da rede',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20'
    }
  };

  // Menu items específicos para cada tipo de gestor
  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: `/dev/gestor-${managerType}`,
        icon: <Home className="w-5 h-5" />,
        description: 'Visão geral e métricas principais'
      }
    ];

    if (managerType === 'geral') {
      return [
        ...baseItems,
        {
          id: 'establishments',
          label: 'Estabelecimentos',
          path: `/dev/gestor-geral/estabelecimentos`,
          icon: <Building2 className="w-5 h-5" />,
          description: 'Gestão de todos os estabelecimentos'
        },
        {
          id: 'users',
          label: 'Usuários e Profissionais',
          path: `/dev/gestor-geral/usuarios`,
          icon: <Users className="w-5 h-5" />,
          description: 'Gestão completa de usuários'
        },
        {
          id: 'financial',
          label: 'Gestão Financeira',
          path: `/dev/gestor-geral/financeiro`,
          icon: <DollarSign className="w-5 h-5" />,
          description: 'Orçamentos e contratos'
        },
        {
          id: 'reports',
          label: 'Relatórios Executivos',
          path: `/dev/gestor-geral/relatorios`,
          icon: <FileBarChart className="w-5 h-5" />,
          description: 'Relatórios consolidados'
        }
      ];
    }

    if (managerType === 'local') {
      return [
        ...baseItems,
        {
          id: 'local-operations',
          label: 'Operações Locais',
          path: `/dev/gestao/${managerType}/operations`,
          icon: <Building2 className="w-5 h-5" />,
          description: 'Gestão do estabelecimento'
        },
        {
          id: 'local-staff',
          label: 'Equipe Local',
          path: `/dev/gestao/${managerType}/staff`,
          icon: <Users className="w-5 h-5" />,
          description: 'Gestão da equipe'
        },
        {
          id: 'local-resources',
          label: 'Recursos e Equipamentos',
          path: `/dev/gestao/${managerType}/resources`,
          icon: <Settings className="w-5 h-5" />,
          description: 'Gestão de recursos'
        }
      ];
    }

    if (managerType === 'total') {
      return [
        ...baseItems,
        {
          id: 'consolidated-view',
          label: 'Visão Consolidada',
          path: `/dev/gestao/${managerType}/consolidated`,
          icon: <BarChart3 className="w-5 h-5" />,
          description: 'Métricas consolidadas'
        },
        {
          id: 'executive-reports',
          label: 'Relatórios Executivos',
          path: `/dev/gestao/${managerType}/executive-reports`,
          icon: <FileBarChart className="w-5 h-5" />,
          description: 'Relatórios para diretoria'
        },
        {
          id: 'strategic-analysis',
          label: 'Análise Estratégica',
          path: `/dev/gestao/${managerType}/strategic`,
          icon: <BarChart3 className="w-5 h-5" />,
          description: 'Análises estratégicas'
        }
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();
  const config = managerConfig[managerType];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </GlassButton>
            
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                <div className={config.color}>
                  {config.icon}
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {config.title}
                </h1>
                <p className="text-sm text-white/70">
                  {config.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <GlassButton variant="ghost" size="sm">
              <Search className="w-5 h-5" />
            </GlassButton>

            {/* Notifications */}
            <GlassButton variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </GlassButton>

            {/* User Menu */}
            <div className="relative">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </GlassButton>

              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-64"
                >
                  <GlassCard className="p-4">
                    <div className="mb-3">
                      <p className="text-white font-medium">{user?.name || 'Usuário Dev'}</p>
                      <p className="text-white/70 text-sm">{user?.email || 'dev@a1saude.com'}</p>
                      <p className="text-white/50 text-xs mt-1">
                        Perfil: {config.title}
                      </p>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <Link to="/dev">
                        <GlassButton variant="ghost" size="sm" className="w-full justify-start">
                          <Home className="w-4 h-4 mr-2" />
                          Voltar ao Dev
                        </GlassButton>
                      </Link>
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="w-full justify-start mt-2 text-red-400 hover:text-red-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </GlassButton>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: sidebarOpen ? 280 : 0,
            opacity: sidebarOpen ? 1 : 0
          }}
          className={`fixed left-0 top-20 bottom-0 z-40 overflow-hidden ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {sidebarOpen && (
            <div className="h-full w-280 bg-black/20 backdrop-blur-md border-r border-white/10 p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActiveRoute(item.path)
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-white/50 mt-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Submenu */}
                  {item.children && isActiveRoute(item.path) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="ml-4 mt-2 space-y-1"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          to={child.path}
                          className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActiveRoute(child.path)
                              ? 'bg-white/10 text-white'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {child.icon}
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>
            </div>
          )}
        </motion.aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-280' : 'ml-0'
          } p-6`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminManagerLayout;