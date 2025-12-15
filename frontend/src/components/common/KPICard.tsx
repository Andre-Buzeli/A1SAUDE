import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  className = ''
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className={`text-2xl font-bold ${colorClasses[color]}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          {Icon && (
            <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};