import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Heart, 
  ChevronDown, 
  ChevronRight,
  X,
  User,
  Shield
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { AuthUser } from '@/types/auth';
import GlassCard from '@/components/ui/GlassCard';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  permissions?: string[];
  badge?: string | number;
}

interface SidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onToggle: () => void;
  user: AuthUser | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  items,
  isOpen,
  onToggle,
  user
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const hasPermission = (permissions?: string[]) => {
    if (!permissions || permissions.length === 0) return true;
    if (!user) return false;
    
    // System master has all permissions
    if (user.permissions.includes('admin:full_access')) return true;
    
    return permissions.some(permission => user.permissions.includes(permission as any));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    if (!hasPermission(item.permissions)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const itemIsActive = isActive(item.path);

    return (
      <div key={item.id}>
        {item.path ? (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                'hover:bg-white/10 group',
                level > 0 ? 'ml-6 text-sm' : '',
                isActive || itemIsActive
                  ? 'bg-medical-blue/20 text-medical-blue border border-medical-blue/30'
                  : 'text-white/80 hover:text-white'
              )
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-1 text-xs bg-medical-red/20 text-medical-red rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpanded(item.id)}
            className={cn(
              'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
              'hover:bg-white/10 text-white/80 hover:text-white',
              level > 0 ? 'ml-6 text-sm' : ''
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-1 text-xs bg-medical-red/20 text-medical-red rounded-full">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <span className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            )}
          </button>
        )}

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1">
                {item.children?.map(child => renderSidebarItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const getProfileDisplayName = (profile: string) => {
    const profileNames: Record<string, string> = {
      gestor_geral: 'Gestor Geral',
      diretor_local: 'Diretor Local',
      gestor_local: 'Gestor Local',
      medico: 'Médico',
      enfermeiro: 'Enfermeiro',
      farmaceutico: 'Farmacêutico',
      psicologo: 'Psicólogo',
      fisioterapeuta: 'Fisioterapeuta',
      recepcionista: 'Recepcionista',
      system_master: 'Administrador'
    };
    return profileNames[profile] || profile;
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -320,
          transition: { type: 'spring', damping: 25, stiffness: 200 }
        }}
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-bg-secondary/80 backdrop-blur-xl',
          'border-r border-white/10 flex flex-col'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-medical-blue/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-medical-blue" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">A1 Saúde</h1>
                <p className="text-xs text-text-secondary">Sistema de Gestão</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* User info */}
        {user && (
          <div className="p-4 border-b border-white/10">
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-medical-blue/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-medical-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {getProfileDisplayName(user.profile)}
                  </p>
                </div>
                {user.permissions.includes('admin:full_access') && (
                  <Shield className="w-4 h-4 text-medical-orange" />
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {items.map(item => renderSidebarItem(item))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-text-muted text-center">
            © 2024 A1 Saúde v1.0.0
          </p>
        </div>
      </motion.aside>
    </>
  );
};

export { Sidebar };