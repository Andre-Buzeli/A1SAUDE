import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { cn } from '@/utils/cn';

interface BaseLayoutProps {
  children: React.ReactNode;
  sidebarItems?: any[];
  title?: string;
  className?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  sidebarItems = [],
  title,
  className = ''
}) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          title={title}
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content */}
        <main className={cn('flex-1 p-6 overflow-auto', className)}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;