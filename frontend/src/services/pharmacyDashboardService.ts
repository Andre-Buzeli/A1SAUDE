import apiService from './api.service';

export interface PharmacyDashboardData {
  metrics: {
    totalMedications: number;
    processedPrescriptions: number;
    medicationsOutOfStock: number;
    pendingRestock: number;
    totalInventoryValue: string;
    medicationsNearExpiry: number;
    stockOccupancyRate: number;
    patientsServed: number;
    establishmentSpecificMetrics: any;
  };
  pendingPrescriptions: any[];
  stockAlerts: any[];
  recentActivities: any[];
  establishmentInfo: {
    name: string;
    type: string;
  };
}

export class PharmacyDashboardService {
  async getDashboard(establishmentType: 'hospital' | 'upa' | 'ubs'): Promise<PharmacyDashboardData> {
    try {
      const response = await apiService.get<PharmacyDashboardData>(`/api/v1/pharmacy/dashboard/${establishmentType}`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar dashboard farmacêutico:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar dashboard farmacêutico');
    }
  }

  async getPendingPrescriptions(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/api/v1/pharmacy/prescriptions/pending`, { limit });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar prescrições pendentes:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar prescrições pendentes');
    }
  }

  async getStockAlerts(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/api/v1/pharmacy/stock/alerts`, { limit });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar alertas de estoque:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar alertas de estoque');
    }
  }

  async getRecentActivities(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`/api/v1/pharmacy/activities/recent`, { limit });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar atividades recentes:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar atividades recentes');
    }
  }

  async processPrescription(prescriptionId: string): Promise<any> {
    try {
      const response = await apiService.put<any>(`/api/v1/pharmacy/prescriptions/${prescriptionId}/process`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao processar prescrição:', error);
      throw new Error(error.response?.data?.error || 'Erro ao processar prescrição');
    }
  }

  async requestRestock(medicationId: string, quantity: number): Promise<any> {
    try {
      const response = await apiService.post<any>('/api/v1/pharmacy/restock/request', {
        medicationId,
        quantity
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao solicitar reposição:', error);
      throw new Error(error.response?.data?.error || 'Erro ao solicitar reposição');
    }
  }
}

export const pharmacyDashboardService = new PharmacyDashboardService();
