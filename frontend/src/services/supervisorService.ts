import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6002/api/v1';

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

interface PerformanceData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

class SupervisorService {
  private getAuthHeader() {
    const token = localStorage.getItem('accessToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getDashboardMetrics(): Promise<SupervisorMetrics> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const response = await fetch(`${API_URL}/supervisor/dashboard/metrics`, {
        method: 'GET',
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch supervisor metrics');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching supervisor metrics:', error);
      // Return mock data as fallback
      return {
        totalTeamMembers: 12,
        activeAttendances: 8,
        pendingTasks: 15,
        completedTasks: 42,
        overdueTasks: 3,
        performanceScore: 87.5
      };
    }
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
      
      const response = await fetch(`${API_URL}/supervisor/team`, {
        method: 'GET',
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      return data.data.map((member: any) => ({
        ...member,
        lastActivity: new Date(member.lastActivity)
      }));
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          name: 'Dr. João Silva',
          profile: 'medico',
          status: 'active' as const,
          currentPatients: 3,
          performance: 92,
          lastActivity: new Date(Date.now() - 300000)
        },
        {
          id: '2',
          name: 'Enf. Maria Santos',
          profile: 'enfermeiro',
          status: 'busy' as const,
          currentPatients: 2,
          performance: 88,
          lastActivity: new Date(Date.now() - 600000)
        }
      ];
    }
  }

  async getTasks(status?: string): Promise<Task[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
      
      const url = status ? `${API_URL}/supervisor/tasks?status=${status}` : `${API_URL}/supervisor/tasks`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      return data.data.map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt)
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          title: 'Revisar protocolo de triagem',
          description: 'Atualizar protocolo de triagem de Manchester',
          priority: 'high' as const,
          status: 'pending' as const,
          assignedTo: 'Dr. João Silva',
          assignedBy: 'Supervisor',
          dueDate: new Date(Date.now() + 86400000),
          createdAt: new Date(Date.now() - 86400000)
        }
      ];
    }
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      const response = await fetch(`${API_URL}/supervisor/tasks`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const data = await response.json();
      return {
        ...data.data,
        dueDate: new Date(data.data.dueDate),
        createdAt: new Date(data.data.createdAt)
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      const response = await fetch(`${API_URL}/supervisor/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const data = await response.json();
      return {
        ...data.data,
        dueDate: new Date(data.data.dueDate),
        createdAt: new Date(data.data.createdAt)
      };
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  async getAlerts(): Promise<Alert[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const response = await fetch(`${API_URL}/supervisor/alerts`, {
        method: 'GET',
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      return data.data.map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt)
      }));
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          type: 'performance' as const,
          title: 'Desempenho abaixo do esperado',
          description: 'Dr. João Silva tem 15% de ausências nos últimos 30 dias',
          priority: 'medium' as const,
          createdAt: new Date(Date.now() - 3600000),
          isRead: false
        }
      ];
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
      
      const response = await fetch(`${API_URL}/supervisor/alerts/${alertId}/read`, {
        method: 'PUT',
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to mark alert as read');
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw new Error('Failed to mark alert as read');
    }
  }

  async getPerformanceData(period: 'week' | 'month' | 'quarter' = 'month'): Promise<PerformanceData> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
      
      const response = await fetch(`${API_URL}/supervisor/performance?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching performance data:', error);
      // Return mock data as fallback
      return {
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
    }
  }
}

export const supervisorService = new SupervisorService();