import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthUser } from '@/types/auth';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { cn } from '@/utils/cn';

interface Notification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'urgent';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  title?: string;
  user: AuthUser | null;
  onMenuClick: () => void;
  showSearch?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  user,
  onMenuClick,
  showSearch = true,
  className = ''
}) => {
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'urgent',
      title: 'Triagem Pendente',
      message: 'Paciente Maria Silva aguardando triagem há 15 min',
      time: '5 min atrás',
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Estoque Baixo',
      message: 'Dipirona 500mg com estoque abaixo do mínimo',
      time: '30 min atrás',
      read: false
    },
    {
      id: '3',
      type: 'success',
      title: 'Alta Aprovada',
      message: 'Alta do paciente João Santos aprovada',
      time: '1h atrás',
      read: true
    },
    {
      id: '4',
      type: 'info',
      title: 'Escala Atualizada',
      message: 'Nova escala de dezembro publicada',
      time: '2h atrás',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    if (read) return 'bg-white/5';
    switch (type) {
      case 'urgent':
        return 'bg-red-500/10 border-l-2 border-red-500';
      case 'warning':
        return 'bg-yellow-500/10 border-l-2 border-yellow-500';
      case 'success':
        return 'bg-green-500/10 border-l-2 border-green-500';
      default:
        return 'bg-blue-500/10 border-l-2 border-blue-500';
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getEstablishmentDisplayName = (type: string) => {
    const establishmentNames: Record<string, string> = {
      ubs: 'UBS',
      upa: 'UPA',
      hospital: 'Hospital'
    };
    return establishmentNames[type] || type;
  };

  return (
    <header className={cn(
      'bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4',
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </GlassButton>

          {/* Title and breadcrumb */}
          <div>
            {title ? (
              <h1 className="text-xl font-semibold text-white">{title}</h1>
            ) : (
              <div>
                <h1 className="text-lg font-medium text-white">
                  {getWelcomeMessage()}, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-sm text-text-secondary">
                  {getEstablishmentDisplayName(user?.establishmentType || '')} - {user?.establishmentName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center section - Search */}
        {showSearch && (
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <GlassInput
              placeholder="Buscar pacientes, atendimentos..."
              value={searchTerm}
              onChange={setSearchTerm}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <GlassButton 
              variant="ghost" 
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-medical-red rounded-full text-xs flex items-center justify-center text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </GlassButton>

            {/* Notifications dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">Notificações</h3>
                      <p className="text-text-secondary text-xs">{unreadCount} não lida(s)</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-medical-blue hover:text-blue-300 transition-colors"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>

                  {/* Notifications list */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 mx-auto text-text-secondary/50 mb-2" />
                        <p className="text-text-secondary text-sm">Nenhuma notificação</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={cn(
                            'p-3 cursor-pointer hover:bg-white/5 transition-colors',
                            getNotificationBg(notification.type, notification.read)
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                'text-sm',
                                notification.read ? 'text-text-secondary' : 'text-white font-medium'
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-text-secondary text-xs mt-0.5 truncate">
                                {notification.message}
                              </p>
                              <p className="text-text-secondary/60 text-xs mt-1 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-medical-blue rounded-full flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-white/10">
                    <button className="w-full text-center text-sm text-medical-blue hover:text-blue-300 transition-colors">
                      Ver todas as notificações
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <GlassButton variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </GlassButton>

          {/* User menu */}
          <div className="relative">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-medical-blue/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-medical-blue" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-text-secondary">{user?.profile}</p>
              </div>
              <ChevronDown className="w-4 h-4" />
            </GlassButton>

            {/* User dropdown */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-64 bg-white/15 backdrop-blur-md border border-white/30 rounded-xl shadow-glass-xl z-50"
              >
                {/* User info */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-medical-blue/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-medical-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{user?.name}</p>
                      <p className="text-sm text-text-secondary">{user?.email}</p>
                      <p className="text-xs text-medical-blue">{user?.profile}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white">
                    <User className="w-4 h-4" />
                    <span>Meu Perfil</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white">
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </button>
                  <hr className="my-2 border-white/10" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-medical-red/20 transition-colors text-medical-red"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      {showSearch && (
        <div className="md:hidden mt-4">
          <GlassInput
            placeholder="Buscar..."
            value={searchTerm}
            onChange={setSearchTerm}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
      )}
    </header>
  );
};

export { Header };