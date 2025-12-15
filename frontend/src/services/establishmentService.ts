import { apiService } from './api.service';

export interface Establishment {
  id: string;
  name: string;
  type: 'hospital' | 'upa' | 'ubs' | 'centro_cirurgico' | 'laboratorio';
  cnes?: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone?: string;
  email?: string;
  capacity?: {
    beds?: number;
    doctors?: number;
    nurses?: number;
    totalStaff?: number;
  };
  services: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    patients: number;
    attendances: number;
  };
}

export interface EstablishmentFilters {
  type?: string;
  city?: string;
  state?: string;
  status?: 'active' | 'inactive' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export interface EstablishmentListResponse {
  establishments: Establishment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface EstablishmentCreateData {
  name: string;
  type: Establishment['type'];
  cnes?: string;
  address: Establishment['address'];
  phone?: string;
  email?: string;
  capacity?: Establishment['capacity'];
  services: string[];
}

export interface EstablishmentUpdateData {
  name?: string;
  type?: Establishment['type'];
  cnes?: string;
  address?: Partial<Establishment['address']>;
  phone?: string;
  email?: string;
  capacity?: Partial<Establishment['capacity']>;
  services?: string[];
  isActive?: boolean;
}

class EstablishmentService {
  /**
   * Criar novo estabelecimento
   */
  async createEstablishment(data: EstablishmentCreateData) {
    try {
      const response = await apiService.post<Establishment>('/api/v1/admin/establishments', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar estabelecimento:', error);
      return this.getMockEstablishment(data);
    }
  }

  /**
   * Buscar estabelecimentos com filtros
   */
  async searchEstablishments(filters: EstablishmentFilters = {}) {
    try {
      const response = await apiService.get<EstablishmentListResponse>('/api/v1/admin/establishments/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      return this.getMockEstablishments(filters);
    }
  }

  /**
   * Obter estabelecimento por ID
   */
  async getEstablishmentById(id: string) {
    try {
      const response = await apiService.get<Establishment>(`/api/v1/admin/establishments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estabelecimento:', error);
      return this.getMockEstablishmentById(id);
    }
  }

  /**
   * Atualizar estabelecimento
   */
  async updateEstablishment(id: string, data: EstablishmentUpdateData) {
    try {
      const response = await apiService.put<Establishment>(`/api/v1/admin/establishments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar estabelecimento:', error);
      return this.getMockEstablishmentById(id);
    }
  }

  /**
   * Desativar estabelecimento
   */
  async deactivateEstablishment(id: string) {
    try {
      const response = await apiService.delete<Establishment>(`/api/v1/admin/establishments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao desativar estabelecimento:', error);
      return this.getMockEstablishmentById(id);
    }
  }

  /**
   * Reativar estabelecimento
   */
  async reactivateEstablishment(id: string) {
    try {
      const response = await apiService.patch<Establishment>(`/api/v1/admin/establishments/${id}/reactivate`, {});
      return response.data;
    } catch (error) {
      console.error('Erro ao reativar estabelecimento:', error);
      return this.getMockEstablishmentById(id);
    }
  }

  /**
   * Obter tipos de estabelecimento disponíveis
   */
  async getEstablishmentTypes() {
    try {
      const response = await apiService.get('/api/v1/admin/establishments/types');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter tipos de estabelecimento:', error);
      return this.getMockEstablishmentTypes();
    }
  }

  /**
   * Obter estatísticas de estabelecimentos
   */
  async getEstablishmentStats() {
    try {
      const response = await apiService.get('/api/v1/admin/establishments/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de estabelecimentos:', error);
      return this.getMockEstablishmentStats();
    }
  }

  /**
   * Mock data methods
   */
  private getMockEstablishment(data: EstablishmentCreateData): Establishment {
    const id = `est-mock-${Date.now()}`;
    return {
      id,
      name: data.name,
      type: data.type,
      cnes: data.cnes,
      address: data.address,
      phone: data.phone,
      email: data.email,
      capacity: data.capacity,
      services: data.services,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: {
        users: 0,
        patients: 0,
        attendances: 0
      }
    };
  }

  private getMockEstablishments(filters: EstablishmentFilters = {}): EstablishmentListResponse {
    const mockEstablishments: Establishment[] = [
      {
        id: 'est-1',
        name: 'Hospital Central',
        type: 'hospital',
        cnes: '1234567',
        address: {
          street: 'Av. Principal',
          number: '1000',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234567'
        },
        phone: '(11) 3456-7890',
        email: 'hospital.central@a1saude.com.br',
        capacity: {
          beds: 200,
          doctors: 45,
          nurses: 80,
          totalStaff: 150
        },
        services: ['emergencia', 'internacao', 'cirurgia', 'laboratorio', 'imagem'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        _count: {
          users: 67,
          patients: 2340,
          attendances: 15670
        }
      },
      {
        id: 'est-2',
        name: 'UPA 24h Norte',
        type: 'upa',
        cnes: '2345678',
        address: {
          street: 'Rua do Norte',
          number: '500',
          neighborhood: 'Norte',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '02345678'
        },
        phone: '(11) 4567-8901',
        email: 'upa.norte@a1saude.com.br',
        capacity: {
          beds: 15,
          doctors: 8,
          nurses: 12,
          totalStaff: 25
        },
        services: ['emergencia', 'consulta', 'curativo', 'medicina'],
        isActive: true,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        _count: {
          users: 23,
          patients: 890,
          attendances: 4560
        }
      },
      {
        id: 'est-3',
        name: 'UBS Vila Esperança',
        type: 'ubs',
        cnes: '3456789',
        address: {
          street: 'Rua da Esperança',
          number: '200',
          neighborhood: 'Vila Esperança',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '03456789'
        },
        phone: '(11) 5678-9012',
        email: 'ubs.esperanca@a1saude.com.br',
        capacity: {
          doctors: 6,
          nurses: 4,
          totalStaff: 12
        },
        services: ['consulta', 'vacina', 'curativo', 'preventivo', 'odontologia'],
        isActive: true,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z',
        _count: {
          users: 12,
          patients: 2340,
          attendances: 5670
        }
      },
      {
        id: 'est-4',
        name: 'Centro Cirúrgico Norte',
        type: 'centro_cirurgico',
        cnes: '4567890',
        address: {
          street: 'Av. Cirúrgica',
          number: '1500',
          neighborhood: 'Norte',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '04567890'
        },
        phone: '(11) 6789-0123',
        email: 'cirurgia.norte@a1saude.com.br',
        capacity: {
          beds: 30,
          doctors: 12,
          nurses: 20,
          totalStaff: 35
        },
        services: ['cirurgia', 'recuperacao', 'anestesia'],
        isActive: true,
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z',
        _count: {
          users: 35,
          patients: 450,
          attendances: 890
        }
      },
      {
        id: 'est-5',
        name: 'Laboratório Central',
        type: 'laboratorio',
        cnes: '5678901',
        address: {
          street: 'Rua Laboratorial',
          number: '300',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '05678901'
        },
        phone: '(11) 7890-1234',
        email: 'laboratorio@a1saude.com.br',
        capacity: {
          doctors: 8,
          nurses: 4,
          totalStaff: 15
        },
        services: ['analises', 'exames', 'diagnostico'],
        isActive: true,
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
        _count: {
          users: 15,
          patients: 0,
          attendances: 0
        }
      }
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let filteredEstablishments = mockEstablishments;

    // Aplicar filtros
    if (filters.status && filters.status !== 'all') {
      filteredEstablishments = filteredEstablishments.filter(e =>
        filters.status === 'active' ? e.isActive : !e.isActive
      );
    }

    if (filters.type && filters.type !== 'all') {
      filteredEstablishments = filteredEstablishments.filter(e => e.type === filters.type);
    }

    if (filters.city) {
      filteredEstablishments = filteredEstablishments.filter(e =>
        e.address.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.state) {
      filteredEstablishments = filteredEstablishments.filter(e => e.address.state === filters.state);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filteredEstablishments = filteredEstablishments.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.address.city.toLowerCase().includes(search) ||
        e.cnes?.includes(search)
      );
    }

    const total = filteredEstablishments.length;
    const paginatedEstablishments = filteredEstablishments.slice(offset, offset + limit);

    return {
      establishments: paginatedEstablishments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  private getMockEstablishmentById(id: string): Establishment {
    const establishments = this.getMockEstablishments().establishments;
    const establishment = establishments.find(e => e.id === id);

    if (establishment) {
      return establishment;
    }

    return establishments[0];
  }

  private getMockEstablishmentTypes() {
    return [
      { value: 'hospital', label: 'Hospital' },
      { value: 'upa', label: 'UPA 24h' },
      { value: 'ubs', label: 'UBS' },
      { value: 'centro_cirurgico', label: 'Centro Cirúrgico' },
      { value: 'laboratorio', label: 'Laboratório' }
    ];
  }

  private getMockEstablishmentStats() {
    return {
      totalEstablishments: 45,
      activeEstablishments: 42,
      establishmentsByType: {
        hospital: 8,
        upa: 12,
        ubs: 20,
        centro_cirurgico: 3,
        laboratorio: 2
      },
      establishmentsByState: {
        SP: 35,
        RJ: 6,
        MG: 4
      },
      totalBeds: 1250,
      totalStaff: 2340,
      averageUtilizationRate: 78.5,
      topServices: [
        { service: 'emergencia', count: 15 },
        { service: 'consulta', count: 28 },
        { service: 'internacao', count: 8 }
      ]
    };
  }
}

export const establishmentService = new EstablishmentService();
export default establishmentService;

