import { apiService } from './api.service';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  profile: string;
  establishmentType: string;
  establishmentName: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface UserFilters {
  search?: string;
  profile?: string;
  establishmentType?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserCreateData {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  profile: string;
  establishmentType: string;
  establishmentId?: string;
  password?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  profile?: string;
  establishmentType?: string;
  establishmentId?: string;
  isActive?: boolean;
}

class UserService {
  /**
   * Criar novo usuário
   */
  async createUser(data: UserCreateData) {
    try {
      const response = await apiService.post<User>('/api/v1/admin/users', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return this.getMockUser(data);
    }
  }

  /**
   * Buscar usuários com filtros
   */
  async searchUsers(filters: UserFilters = {}) {
    try {
      const response = await apiService.get<UserListResponse>('/api/v1/admin/users/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return this.getMockUsers(filters);
    }
  }

  /**
   * Obter usuário por ID
   */
  async getUserById(id: string) {
    try {
      const response = await apiService.get<User>(`/api/v1/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return this.getMockUserById(id);
    }
  }

  /**
   * Atualizar usuário
   */
  async updateUser(id: string, data: UserUpdateData) {
    try {
      const response = await apiService.put<User>(`/api/v1/admin/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return this.getMockUserById(id);
    }
  }

  /**
   * Desativar usuário
   */
  async deactivateUser(id: string) {
    try {
      const response = await apiService.delete<User>(`/api/v1/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      return this.getMockUserById(id);
    }
  }

  /**
   * Reativar usuário
   */
  async reactivateUser(id: string) {
    try {
      const response = await apiService.patch<User>(`/api/v1/admin/users/${id}/reactivate`, {});
      return response.data;
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      return this.getMockUserById(id);
    }
  }

  /**
   * Obter perfis disponíveis
   */
  async getAvailableProfiles() {
    try {
      const response = await apiService.get('/api/v1/admin/users/profiles');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter perfis disponíveis:', error);
      return this.getMockAvailableProfiles();
    }
  }

  /**
   * Obter estatísticas de usuários
   */
  async getUserStats() {
    try {
      const response = await apiService.get('/api/v1/admin/users/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de usuários:', error);
      return this.getMockUserStats();
    }
  }

  /**
   * Mock data methods
   */
  private getMockUser(data: UserCreateData): User {
    const id = `user-mock-${Date.now()}`;
    return {
      id,
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      phone: data.phone,
      profile: data.profile,
      establishmentType: data.establishmentType,
      establishmentName: this.getEstablishmentName(data.establishmentType),
      isActive: true,
      createdAt: new Date().toISOString()
    };
  }

  private getMockUsers(filters: UserFilters = {}): UserListResponse {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva.hospital@a1saude.com.br',
        cpf: '11111111111',
        phone: '(11) 99999-1111',
        profile: 'medico',
        establishmentType: 'hospital',
        establishmentName: 'Hospital Central',
        isActive: true,
        lastLogin: '2024-12-14T10:30:00Z',
        createdAt: '2024-01-01T08:00:00Z'
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos.ubs@a1saude.com.br',
        cpf: '22222222222',
        phone: '(11) 99999-2222',
        profile: 'medico',
        establishmentType: 'ubs',
        establishmentName: 'UBS Vila Esperança',
        isActive: true,
        lastLogin: '2024-12-14T15:45:00Z',
        createdAt: '2024-01-02T09:00:00Z'
      },
      {
        id: '3',
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira.upa@a1saude.com.br',
        cpf: '33333333333',
        phone: '(11) 99999-3333',
        profile: 'medico',
        establishmentType: 'upa',
        establishmentName: 'UPA 24h Norte',
        isActive: false,
        lastLogin: '2024-12-10T12:00:00Z',
        createdAt: '2024-01-03T10:00:00Z'
      },
      {
        id: '4',
        name: 'Ana Costa',
        email: 'ana.costa.enfermeira@a1saude.com.br',
        cpf: '44444444444',
        phone: '(11) 99999-4444',
        profile: 'enfermeiro',
        establishmentType: 'hospital',
        establishmentName: 'Hospital Central',
        isActive: true,
        lastLogin: '2024-12-14T09:15:00Z',
        createdAt: '2024-01-04T11:00:00Z'
      },
      {
        id: '5',
        name: 'Carlos Rodrigues',
        email: 'carlos.rodrigues.gestor@a1saude.com.br',
        cpf: '55555555555',
        phone: '(11) 99999-5555',
        profile: 'gestor_local',
        establishmentType: 'hospital',
        establishmentName: 'Hospital Central',
        isActive: true,
        lastLogin: '2024-12-14T08:45:00Z',
        createdAt: '2024-01-05T12:00:00Z'
      },
      {
        id: '6',
        name: 'Fernanda Lima',
        email: 'fernanda.lima.admin@a1saude.com.br',
        cpf: '66666666666',
        phone: '(11) 99999-6666',
        profile: 'admin',
        establishmentType: 'hospital',
        establishmentName: 'Hospital Central',
        isActive: true,
        lastLogin: '2024-12-14T16:20:00Z',
        createdAt: '2024-01-06T13:00:00Z'
      }
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let filteredUsers = mockUsers;

    // Aplicar filtros
    if (filters.status && filters.status !== 'all') {
      filteredUsers = filteredUsers.filter(u =>
        filters.status === 'active' ? u.isActive : !u.isActive
      );
    }

    if (filters.profile && filters.profile !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.profile === filters.profile);
    }

    if (filters.establishmentType && filters.establishmentType !== 'all') {
      filteredUsers = filteredUsers.filter(u => u.establishmentType === filters.establishmentType);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.cpf.includes(search)
      );
    }

    const total = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return {
      users: paginatedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  private getMockUserById(id: string): User {
    const users = this.getMockUsers().users;
    const user = users.find(u => u.id === id);

    if (user) {
      return user;
    }

    return users[0];
  }

  private getMockAvailableProfiles() {
    return [
      { value: 'admin', label: 'Administrador' },
      { value: 'gestor_geral', label: 'Gestor Geral' },
      { value: 'gestor_local', label: 'Gestor Local' },
      { value: 'gestor_total', label: 'Gestor Total' },
      { value: 'medico', label: 'Médico' },
      { value: 'enfermeiro', label: 'Enfermeiro' },
      { value: 'farmaceutico', label: 'Farmacêutico' },
      { value: 'fisioterapeuta', label: 'Fisioterapeuta' },
      { value: 'psicologo', label: 'Psicólogo' },
      { value: 'odontologo', label: 'Odontólogo' },
      { value: 'tecnico_enfermagem', label: 'Técnico de Enfermagem' },
      { value: 'recepcionista', label: 'Recepcionista' },
      { value: 'secretaria', label: 'Secretária' }
    ];
  }

  private getMockUserStats() {
    return {
      totalUsers: 156,
      activeUsers: 142,
      inactiveUsers: 14,
      usersByProfile: {
        medico: 34,
        enfermeiro: 28,
        farmaceutico: 8,
        fisioterapeuta: 6,
        psicologo: 4,
        odontologo: 3,
        tecnico_enfermagem: 15,
        recepcionista: 12,
        secretaria: 8,
        gestor_local: 6,
        gestor_geral: 2,
        admin: 1
      },
      usersByEstablishment: {
        hospital: 67,
        upa: 23,
        ubs: 45,
        centro_cirurgico: 8,
        laboratorio: 13
      },
      recentLogins: 89,
      averageUsersPerEstablishment: 31.2
    };
  }

  private getEstablishmentName(establishmentType: string): string {
    const names = {
      hospital: 'Hospital Central',
      upa: 'UPA 24h Norte',
      ubs: 'UBS Vila Esperança',
      centro_cirurgico: 'Centro Cirúrgico',
      laboratorio: 'Laboratório Central'
    };
    return names[establishmentType as keyof typeof names] || establishmentType;
  }
}

export const userService = new UserService();
export default userService;

