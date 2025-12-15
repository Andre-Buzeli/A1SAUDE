import React from 'react';
import { Clock, User, FileText, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'patient' | 'attendance' | 'prescription' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface RecentActivitiesProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
  className?: string;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'patient':
      return <User className="w-4 h-4" />;
    case 'attendance':
      return <FileText className="w-4 h-4" />;
    case 'prescription':
      return <FileText className="w-4 h-4" />;
    case 'alert':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getActivityColor = (type: Activity['type'], priority?: Activity['priority']) => {
  if (priority === 'high') return 'text-red-600 bg-red-50';
  if (priority === 'medium') return 'text-yellow-600 bg-yellow-50';
  
  switch (type) {
    case 'patient':
      return 'text-blue-600 bg-blue-50';
    case 'attendance':
      return 'text-green-600 bg-green-50';
    case 'prescription':
      return 'text-purple-600 bg-purple-50';
    case 'alert':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  if (hours < 24) return `há ${hours} h`;
  if (days < 7) return `há ${days} d`;
  
  return date.toLocaleDateString('pt-BR');
};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  title = 'Atividades Recentes',
  maxItems = 10,
  className = ''
}) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma atividade recente</p>
          </div>
        ) : (
          displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type, activity.priority)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                
                {activity.user && (
                  <p className="text-xs text-gray-500 mt-1">
                    por {activity.user}
                  </p>
                )}
                
                {activity.priority && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    activity.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : activity.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.priority === 'high' ? 'Alta' : activity.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > maxItems && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Ver todas as atividades ({activities.length})
          </button>
        </div>
      )}
    </div>
  );
};