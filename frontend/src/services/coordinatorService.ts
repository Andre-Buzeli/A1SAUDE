import axios from 'axios';

export interface CoordinatorMetrics {
  totalPatients: number;
  activeAttendances: number;
  completedAttendances: number;
  pendingTasks: number;
  teamMembers: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

export interface TeamMember {
  id: string;
  name: string;
  profile: string;
  email: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  totalAttendances: number;
  completedTasks: number;
  performance: number;
}

export interface TeamPerformance {
  memberId: string;
  memberName: string;
  profile: string;
  attendances: number;
  completedTasks: number;
  performance: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CoordinatorAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  createdAt: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface CoordinatorReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  period: string;
  status: 'draft' | 'completed' | 'submitted';
  createdAt: Date;
  submittedAt: Date | null;
}

export interface CoordinatorTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: Date;
  assignee: string;
  createdAt: Date;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6002/api/v1';

class CoordinatorService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getCoordinatorMetrics(): Promise<CoordinatorMetrics> {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data para desenvolvimento
      return {
        totalPatients: 1247,
        activeAttendances: 23,
        completedAttendances: 856,
        pendingTasks: 12,
        teamMembers: 18,
        monthlyGoal: 200,
        monthlyProgress: 78
      };

      // Implementação real quando o backend estiver completo:
      /*
      const response = await fetch(`${API_URL}/coordinator/dashboard`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao obter métricas do coordenador');
      }

      const data = await response.json();
      return data.data;
      */
    } catch (error) {
      console.error('Erro ao obter métricas do coordenador:', error);
      throw error;
    }
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 600));

      // Mock data para desenvolvimento
      return [
        {
          id: '1',
          name: 'Dr. João Silva',
          profile: 'doctor',
          email: 'joao.silva@a1saude.com',
          isActive: true,
          lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          totalAttendances: 45,
          completedTasks: 38,
          performance: 92
        },
        {
          id: '2',
          name: 'Enf. Maria Santos',
          profile: 'nurse',
          email: 'maria.santos@a1saude.com',
          isActive: true,
          lastLoginAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          totalAttendances: 67,
          completedTasks: 52,
          performance: 88
        },
        {
          id: '3',
          name: 'Tec. Pedro Oliveira',
          profile: 'nurse_technician',
          email: 'pedro.oliveira@a1saude.com',
          isActive: true,
          lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          totalAttendances: 89,
          completedTasks: 76,
          performance: 95
        },
        {
          id: '4',
          name: 'Recep. Ana Costa',
          profile: 'receptionist',
          email: 'ana.costa@a1saude.com',
          isActive: true,
          lastLoginAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          totalAttendances: 34,
          completedTasks: 29,
          performance: 85
        }
      ];

      // Implementação real:
      /*
      const response = await fetch(`${API_URL}/coordinator/team-members`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao obter membros da equipe');
      }

      const data = await response.json();
      return data.data;
      */
    } catch (error) {
      console.error('Erro ao obter membros da equipe:', error);
      throw error;
    }
  }

  async getTeamPerformance(period: 'week' | 'month' = 'month'): Promise<TeamPerformance[]> {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 700));

      // Mock data para desenvolvimento
      return [
        {
          memberId: '1',
          memberName: 'Dr. João Silva',
          profile: 'doctor',
          attendances: 45,
          completedTasks: 38,
          performance: 92,
          trend: 'up'
        },
        {
          memberId: '2',
          memberName: 'Enf. Maria Santos',
          profile: 'nurse',
          attendances: 67,
          completedTasks: 52,
          performance: 88,
          trend: 'stable'
        },
        {
          memberId: '3',
          memberName: 'Tec. Pedro Oliveira',
          profile: 'nurse_technician',
          attendances: 89,
          completedTasks: 76,
          performance: 95,
          trend: 'up'
        },
        {
          memberId: '4',
          memberName: 'Recep. Ana Costa',
          profile: 'receptionist',
          attendances: 34,
          completedTasks: 29,
          performance: 85,
          trend: 'down'
        }
      ];

      // Implementação real:
      /*
      const response = await fetch(`${API_URL}/coordinator/team-performance?period=${period}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao obter performance da equipe');
      }

      const data = await response.json();
      return data.data;
      */
    } catch (error) {
      console.error('Erro ao obter performance da equipe:', error);
      throw error;
    }
  }

  async getCoordinatorAlerts(): Promise<CoordinatorAlert[]> {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock data para desenvolvimento
      return [
        {
          id: '1',
          type: 'urgent',
          title: 'Atendimentos Críticos',
          description: '3 atendimentos críticos em andamento',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          isRead: false,
          priority: 'high'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Atendimentos Atrasados',
          description: '5 atendimentos aguardando há mais de 2 horas',
          createdAt: new Date(Date.now() - 60 * 60 * 1000),
          isRead: false,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'info',
          title: 'Tarefas Pendentes',
          description: 'Relatório mensal pendente de revisão',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isRead: false,
          priority: 'low'
        }
      ];

      // Implementação real:
      /*
      const response = await fetch(`${API_URL}/coordinator/alerts`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao obter alertas do coordenador');
      }

      const data = await response.json();
      return data.data;
      */
    } catch (error) {
      console.error('Erro ao obter alertas do coordenador:', error);
      throw error;
    }
  }

  async getCoordinatorReports(): Promise<CoordinatorReport[]> {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 400));

      // Mock data para desenvolvimento
      return [
        {
          id: '1',
          title: 'Relatório Semanal - Atendimentos',
          type: 'weekly',
          period: 'Semana 45/2024',
          status: 'completed',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          title: 'Relatório Mensal - Performance da Equipe',
          type: 'monthly',
          period: 'Outubro 2024',
          status: 'completed',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Relatório Mensal - Novembro 2024',
          type: 'monthly',
          period: 'Novembro 2024',
          status: 'draft',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          submittedAt: null
        }
      ];

      // Implementação real:
      /*
      const response = await fetch(`${API_URL}/coordinator/reports`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao obter relatórios do coordenador');
      }

      const data = await response.json();
      return data.data;
      */
    } catch (error) {
      console.error('Erro ao obter relatórios do coordenador:', error);
      throw error;
    }
  }

  async getCoordinatorTasks(): Promise<CoordinatorTask[]> {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock data para desenvolvimento
      return [
        {
          id: '1',
          title: 'Revisar escalas da semana',
          description: 'Verificar e ajustar escalas de plantão',
          priority: 'high',
          status: 'pending',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignee: 'Você',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          title: 'Avaliar performance da equipe',
          description: 'Analisar indicadores de desempenho mensal',
          priority: 'medium',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          assignee: 'Você',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Atualizar protocolos',
          description: 'Revisar protocolos de atendimento',
          priority: 'low',
          status: 'completed',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          assignee: 'Você',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ];

      // Implementação real:
      /*
      const response = await fetch(`${API_URL}/coordinator/tasks`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao obter tarefas do coordenador');
      }

      const data = await response.json();
      return data.data;
      */
    } catch (error) {
      console.error('Erro ao obter tarefas do coordenador:', error);
      throw error;
    }
  }
}

export const coordinatorService = new CoordinatorService();