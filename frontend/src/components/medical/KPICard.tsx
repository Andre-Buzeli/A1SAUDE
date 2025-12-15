import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-400/30',
    text: 'text-blue-100',
    icon: 'text-blue-300',
    trend: 'text-blue-200'
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-400/30',
    text: 'text-green-100',
    icon: 'text-green-300',
    trend: 'text-green-200'
  },
  red: {
    bg: 'bg-red-500/20',
    border: 'border-red-400/30',
    text: 'text-red-100',
    icon: 'text-red-300',
    trend: 'text-red-200'
  },
  orange: {
    bg: 'bg-orange-500/20',
    border: 'border-orange-400/30',
    text: 'text-orange-100',
    icon: 'text-orange-300',
    trend: 'text-orange-200'
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-400/30',
    text: 'text-purple-100',
    icon: 'text-purple-300',
    trend: 'text-purple-200'
  },
  gray: {
    bg: 'bg-gray-500/20',
    border: 'border-gray-400/30',
    text: 'text-gray-100',
    icon: 'text-gray-300',
    trend: 'text-gray-200'
  }
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  onClick
}) => {
  const colors = colorClasses[color];
  
  return (
    <div 
      className={`
        backdrop-blur-sm border rounded-xl p-6 transition-all duration-200
        ${colors.bg} ${colors.border}
        ${onClick ? 'cursor-pointer hover:bg-white/20 hover:scale-105' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text} opacity-80`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${colors.text} mt-2`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className={`text-sm ${colors.text} opacity-60 mt-1`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${colors.trend}`}>
              <span className={trend.isPositive ? 'text-green-400' : 'text-red-400'}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-1 opacity-60">vs. ontem</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
};