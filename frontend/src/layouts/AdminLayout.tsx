import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Menu items específicos para perfis administrativos
  const adminMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: React.createElement('div', {}, '📊'), // Placeholder icon
      permissions: ['gestor_geral:read', 'diretor_local:read', 'gestor_local:read']
    },
    {
      id: 'users',
      label: 'Usuários',
      path: '/admin/users',
      icon: React.createElement('div', {}, '👥'),
      permissions: ['gestor_geral:recursos_humanos', 'diretor_local:write']
    },
    {
      id: 'establishments',
      label: 'Estabelecimentos',
      path: '/admin/establishments',
      icon: React.createElement('div', {}, '🏢'),
      permissions: ['gestor_geral:estrutura_administrativa', 'diretor_local:read']
    },
    {
      id: 'financial',
      label: 'Financeiro',
      path: '/admin/financial',
      icon: React.createElement('div', {}, '💰'),
      permissions: ['gestor_geral:financeiro', 'diretor_local:read', 'gestor_local:read']
    },
    {
      id: 'professionals',
      label: 'Profissionais',
      path: '/admin/professionals',
      icon: React.createElement('div', {}, '👨‍⚕️'),
      permissions: ['gestor_geral:recursos_humanos', 'diretor_local:write']
    },
    {
      id: 'reports',
      label: 'Relatórios',
      path: '/admin/reports',
      icon: React.createElement('div', {}, '📋'),
      permissions: ['reports:read', 'reports:write']
    },
    {
      id: 'audit',
      label: 'Auditoria',
      path: '/admin/audit',
      icon: React.createElement('div', {}, '🛡️'),
      permissions: ['gestor_geral:auditoria', 'admin:full_access']
    },
    {
      id: 'inventory',
      label: 'Inventário',
      path: '/admin/inventory',
      icon: React.createElement('div', {}, '📦'),
      permissions: ['gestor_geral:read', 'diretor_local:read', 'gestor_local:read']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header
        user={user}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex">
        <Sidebar
          items={adminMenuItems}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
        <main className="flex-1 ml-64 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;