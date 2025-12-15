import { PrismaClient } from '@prisma/client';

interface SupervisorMetrics {
  totalTeamMembers: number;
  activeAttendances: number;
  pendingTasks: number;
  completedTasks: number;
  overdueTasks: number;
  performanceScore: number;
}

interface TeamMember {
  id: string;
  name: string;
  profile: string;
  status: 'active' | 'inactive' | 'busy';
  currentPatients: number;
  performance: number;
  lastActivity: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  assignedBy: string;
  dueDate: Date;
  createdAt: Date;
}

interface Alert {
  id: string;
  type: 'performance' | 'attendance' | 'task' | 'system';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  isRead: boolean;
}

export class SupervisorService {
  constructor(private prisma: PrismaClient) {}

  async getDashboardMetrics(supervisorId: string): Promise<SupervisorMetrics> {
    try {
      // Mock implementation - in real scenario, calculate from database
      return {
        totalTeamMembers: 12,
        activeAttendances: 8,
        pendingTasks: 15,
        completedTasks: 42,
        overdueTasks: 3,
        performanceScore: 87.5
      };
    } catch (error) {
      console.error('Error fetching supervisor metrics:', error);
      throw new Error('Failed to fetch supervisor metrics');
    }
  }

  async getTeamMembers(supervisorId: string): Promise<TeamMember[]> {
    try {
      // Mock implementation - in real scenario, query database
      return [
        {
          id: '1',
          name: 'Dr. João Silva',
          profile: 'medico',
          status: 'active',
          currentPatients: 3,
          performance: 92,
          lastActivity: new Date(Date.now() - 300000) // 5 minutes ago
        },
        {
          id: '2',
          name: 'Enf. Maria Santos',
          profile: 'enfermeiro',
          status: 'busy',
          currentPatients: 2,
          performance: 88,
          lastActivity: new Date(Date.now() - 600000) // 10 minutes ago
        },
        {
          id: '3',
          name: 'Tec. Pedro Oliveira',
          profile: 'tecnico_enfermagem',
          status: 'active',
          currentPatients: 1,
          performance: 85,
          lastActivity: new Date(Date.now() - 900000) // 15 minutes ago
        },
        {
          id: '4',
          name: 'Dr. Ana Costa',
          profile: 'medico',
          status: 'inactive',
          currentPatients: 0,
          performance: 95,
          lastActivity: new Date(Date.now() - 7200000) // 2 hours ago
        }
      ];
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw new Error('Failed to fetch team members');
    }
  }

  async getTasks(supervisorId: string, status?: string): Promise<Task[]> {
    try {
      // Mock implementation - in real scenario, query database
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Revisar protocolo de triagem',
          description: 'Atualizar protocolo de triagem de Manchester',
          priority: 'high',
          status: 'pending',
          assignedTo: 'Dr. João Silva',
          assignedBy: 'Supervisor',
          dueDate: new Date(Date.now() + 86400000), // Tomorrow
          createdAt: new Date(Date.now() - 86400000) // Yesterday
        },
        {
          id: '2',
          title: 'Treinamento sobre novos medicamentos',
          description: 'Capacitar equipe sobre novos protocolos medicamentosos',
          priority: 'medium',
          status: 'in_progress',
          assignedTo: 'Enf. Maria Santos',
          assignedBy: 'Supervisor',
          dueDate: new Date(Date.now() + 172800000), // In 2 days
          createdAt: new Date(Date.now() - 172800000) // 2 days ago
        },
        {
          id: '3',
          title: 'Auditoria de prontuários',
          description: 'Realizar auditoria mensal dos prontuários',
          priority: 'urgent',
          status: 'overdue',
          assignedTo: 'Tec. Pedro Oliveira',
          assignedBy: 'Supervisor',
          dueDate: new Date(Date.now() - 86400000), // Yesterday
          createdAt: new Date(Date.now() - 345600000) // 4 days ago
        }
      ];

      if (status) {
        return tasks.filter(task => task.status === status);
      }

      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  async getAlerts(supervisorId: string): Promise<Alert[]> {
    try {
      // Mock implementation - in real scenario, query database
      return [
        {
          id: '1',
          type: 'performance',
          title: 'Desempenho abaixo do esperado',
          description: 'Dr. João Silva tem 15% de ausências nos últimos 30 dias',
          priority: 'medium',
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
          isRead: false
        },
        {
          id: '2',
          type: 'task',
          title: 'Tarefa atrasada',
          description: 'Auditoria de prontuários está 1 dia atrasada',
          priority: 'high',
          createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
          isRead: false
        },
        {
          id: '3',
          type: 'attendance',
          title: 'Alta demanda de atendimentos',
          description: '8 atendimentos ativos, considerar redistribuição',
          priority: 'medium',
          createdAt: new Date(Date.now() - 900000), // 15 minutes ago
          isRead: true
        }
      ];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw new Error('Failed to fetch alerts');
    }
  }

  async getPerformanceData(supervisorId: string, period: 'week' | 'month' | 'quarter' = 'month') {
    try {
      // Mock implementation - in real scenario, calculate from database
      const data = {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [
          {
            label: 'Atendimentos',
            data: [45, 52, 48, 58],
            color: '#3B82F6'
          },
          {
            label: 'Tarefas Completadas',
            data: [38, 45, 42, 50],
            color: '#10B981'
          },
          {
            label: 'Performance Geral',
            data: [82, 85, 83, 87],
            color: '#F59E0B'
          }
        ]
      };

      if (period === 'week') {
        data.labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        data.datasets[0].data = [8, 12, 10, 15, 18, 8, 5];
        data.datasets[1].data = [6, 10, 8, 12, 15, 6, 3];
        data.datasets[2].data = [85, 88, 82, 90, 92, 80, 75];
      }

      return data;
    } catch (error) {
      console.error('Error fetching performance data:', error);
      throw new Error('Failed to fetch performance data');
    }
  }

  async createTask(supervisorId: string, taskData: Partial<Task>): Promise<Task> {
    try {
      // Mock implementation - in real scenario, create in database
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskData.title || 'Nova Tarefa',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        status: 'pending',
        assignedTo: taskData.assignedTo || 'Não atribuído',
        assignedBy: 'Supervisor',
        dueDate: taskData.dueDate || new Date(Date.now() + 86400000),
        createdAt: new Date()
      };

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    try {
      // Mock implementation - in real scenario, update in database
      return {
        id: taskId,
        title: 'Tarefa Atualizada',
        description: 'Descrição da tarefa',
        priority: 'medium',
        status: status,
        assignedTo: 'Funcionário',
        assignedBy: 'Supervisor',
        dueDate: new Date(),
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      // Mock implementation - in real scenario, update in database
      console.log(`Alert ${alertId} marked as read`);
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw new Error('Failed to mark alert as read');
    }
  }
}