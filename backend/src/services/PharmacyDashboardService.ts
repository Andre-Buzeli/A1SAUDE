import { PrismaClient } from '@prisma/client';
import { EstablishmentType } from '../types/auth';

export interface PharmacyMetrics {
  totalMedications: number;
  processedPrescriptions: number;
  medicationsOutOfStock: number;
  pendingRestock: number;
  totalInventoryValue: string;
  medicationsNearExpiry: number;
  stockOccupancyRate: number;
  patientsServed: number;
  establishmentSpecificMetrics: any;
}

export class PharmacyDashboardService {
  constructor(private prisma: PrismaClient) {}

  async getPharmacyDashboard(
    establishmentId: string, 
    establishmentType: EstablishmentType
  ): Promise<PharmacyMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Métricas básicas de farmácia (mock implementation)
    const [
      processedPrescriptions,
      patientsServed
    ] = await Promise.all([
      // Prescrições processadas hoje
      this.prisma.prescription.count({
        where: {
          attendance: {
            establishmentId: establishmentId
          },
          status: 'completed',
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Pacientes atendidos hoje
      this.prisma.attendance.count({
        where: {
          establishmentId: establishmentId,
          startTime: {
            gte: today,
            lt: tomorrow
          }
        },
        distinct: ['patientId']
      })
    ]);

    // Métricas mock para farmácia
    const totalMedications = 450;
    const medicationsOutOfStock = 12;
    const pendingRestock = 8;
    const totalInventoryValue = 'R$ 125.000,00';
    const medicationsNearExpiry = 25;
    const stockOccupancyRate = 78;

    // Métricas específicas por tipo de estabelecimento
    const establishmentSpecificMetrics = await this.getEstablishmentSpecificMetrics(
      establishmentId, 
      establishmentType, 
      today, 
      tomorrow
    );

    return {
      totalMedications,
      processedPrescriptions,
      medicationsOutOfStock,
      pendingRestock,
      totalInventoryValue,
      medicationsNearExpiry,
      stockOccupancyRate,
      patientsServed,
      establishmentSpecificMetrics
    };
  }

  private async getEstablishmentSpecificMetrics(
    establishmentId: string,
    establishmentType: EstablishmentType,
    today: Date,
    tomorrow: Date
  ): Promise<any> {
    switch (establishmentType) {
      case 'hospital':
        return this.getHospitalPharmacyMetrics(establishmentId, today, tomorrow);
      case 'upa':
        return this.getUPAPharmacyMetrics(establishmentId, today, tomorrow);
      case 'ubs':
        return this.getUBSPharmacyMetrics(establishmentId, today, tomorrow);
      default:
        return {};
    }
  }

  private async getHospitalPharmacyMetrics(establishmentId: string, today: Date, tomorrow: Date) {
    // Métricas mock para hospital
    return {
      emergencyMedications: 45,
      surgicalMedications: 23,
      inpatientMedications: 156,
      dischargeMedications: 34,
      controlledSubstances: 12,
      chemotherapyMedications: 8
    };
  }

  private async getUPAPharmacyMetrics(establishmentId: string, today: Date, tomorrow: Date) {
    // Métricas mock para UPA
    return {
      emergencyMedications: 67,
      traumaMedications: 28,
      cardiacMedications: 19,
      respiratoryMedications: 34,
      painMedications: 45,
      antibioticMedications: 56
    };
  }

  private async getUBSPharmacyMetrics(establishmentId: string, today: Date, tomorrow: Date) {
    // Métricas mock para UBS
    return {
      chronicMedications: 234,
      vaccinationMedications: 89,
      preventiveMedications: 145,
      pediatricMedications: 67,
      geriatricMedications: 123,
      familyPlanningMedications: 34
    };
  }

  async getMedicationInventory(establishmentId: string) {
    // Mock inventory data
    return [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        stock: 450,
        minStock: 50,
        maxStock: 500,
        unit: 'comprimidos',
        price: 0.25,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        batch: 'ABC123',
        location: 'A1-01',
        status: 'in_stock'
      },
      {
        id: '2',
        name: 'Ibuprofeno 600mg',
        stock: 234,
        minStock: 30,
        maxStock: 300,
        unit: 'comprimidos',
        price: 0.45,
        expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        batch: 'DEF456',
        location: 'A1-02',
        status: 'in_stock'
      },
      {
        id: '3',
        name: 'Amoxicilina 500mg',
        stock: 12,
        minStock: 20,
        maxStock: 200,
        unit: 'cápsulas',
        price: 1.20,
        expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
        batch: 'GHI789',
        location: 'B2-01',
        status: 'low_stock'
      }
    ];
  }

  async getPrescriptionsForPharmacy(establishmentId: string, status?: string) {
    const where: any = {
      attendance: {
        establishmentId: establishmentId
      }
    };

    if (status) {
      where.status = status;
    }

    return this.prisma.prescription.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true
          }
        },
        attendance: {
          select: {
            id: true,
            professional: {
              select: {
                id: true,
                name: true,
                profile: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getMedicationAlerts(establishmentId: string) {
    // Mock alerts data
    return [
      {
        id: '1',
        type: 'low_stock',
        title: 'Estoque Baixo - Amoxicilina',
        description: 'Apenas 12 unidades restantes do lote GHI789',
        severity: 'high',
        createdAt: new Date(),
        medication: {
          id: '3',
          name: 'Amoxicilina 500mg'
        }
      },
      {
        id: '2',
        type: 'expiry',
        title: 'Medicamento Próximo do Vencimento',
        description: 'Ibuprofeno vence em 30 dias',
        severity: 'medium',
        createdAt: new Date(),
        medication: {
          id: '2',
          name: 'Ibuprofeno 600mg'
        }
      }
    ];
  }

  async getPharmacyReports(establishmentId: string, startDate: Date, endDate: Date) {
    // Mock reports data
    return {
      consumption: {
        totalMedications: 1250,
        totalValue: 15678.50,
        topConsumed: [
          { name: 'Paracetamol', quantity: 450, value: 112.50 },
          { name: 'Ibuprofeno', quantity: 234, value: 105.30 },
          { name: 'Amoxicilina', quantity: 189, value: 226.80 }
        ]
      },
      stockMovements: {
        entries: 45,
        exits: 1234,
        adjustments: 12,
        transfers: 3
      },
      financial: {
        openingBalance: 125000.00,
        entries: 15678.50,
        exits: 13456.75,
        closingBalance: 127221.75
      }
    };
  }
}