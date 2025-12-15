import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LabOrder,
  LabTest,
  LabEquipment,
  LabDashboardData,
  LabWorklist,
  LabFilters,
  LabResult
} from '@/types/laboratory';

export const useLaboratory = () => {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [equipment, setEquipment] = useState<LabEquipment[]>([]);
  const [worklists, setWorklists] = useState<LabWorklist[]>([]);
  const [dashboardData, setDashboardData] = useState<LabDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockDashboard: LabDashboardData = {
        totalOrdersToday: 247,
        totalOrdersMonth: 6234,
        ordersByStatus: {
          ordered: 45,
          sample_collected: 23,
          sample_received: 156,
          in_progress: 89,
          completed: 234,
          cancelled: 3,
          rejected: 2
        },
        ordersByUrgency: {
          routine: 198,
          urgent: 34,
          emergency: 15
        },
        ordersByCategory: {
          'Bioquímica': 89,
          'Hematologia': 67,
          'Imunologia': 45,
          'Microbiologia': 23,
          'Urinalise': 34
        },
        averageTurnaroundTime: 120,
        criticalResults: 8,
        rejectedSamples: 12,
        equipmentStatus: {
          operational: 12,
          maintenance: 3,
          repair: 1,
          total: 16
        },
        technicianWorkload: 87.5,
        qcFailures: 2,
        costPerTest: 15.50,
        utilizationRate: 78.3
      };
      setDashboardData(mockDashboard);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar pedidos
  const loadOrders = useCallback(async (filters?: LabFilters) => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockOrders: LabOrder[] = [
        {
          id: 'order-1',
          patientId: 'p1',
          patientName: 'João Silva',
          patientAge: 45,
          patientGender: 'M',
          patientBirthDate: new Date('1979-01-15'),

          requestedBy: 'dr1',
          requestedByName: 'Dr. Maria Santos',
          requestingDepartment: 'Clínica Médica',
          clinicalIndication: 'Avaliação pré-operatória',
          urgency: 'routine',

          tests: [
            {
              id: 'order-test-1',
              orderId: 'order-1',
              testId: 'test-hemograma',
              testCode: 'HEM',
              testName: 'Hemograma Completo',
              status: 'completed',
              priority: 'normal',
              completedAt: new Date()
            },
            {
              id: 'order-test-2',
              orderId: 'order-1',
              testId: 'test-glicemia',
              testCode: 'GLIC',
              testName: 'Glicemia de Jejum',
              status: 'completed',
              priority: 'normal',
              completedAt: new Date()
            }
          ],

          sampleCollectionDate: new Date(),
          sampleReceivedDate: new Date(),
          sampleType: 'blood',
          sampleVolume: 5,
          sampleCondition: 'adequate',

          status: 'completed',
          priority: 'normal',

          qualityControl: {
            id: 'qc-1',
            orderId: 'order-1',
            internalControls: [],
            externalControls: [],
            overallQC: 'passed',
            createdAt: new Date(),
            updatedAt: new Date()
          },

          results: [
            {
              id: 'result-1',
              orderId: 'order-1',
              testId: 'test-hemograma',
              testCode: 'HEM',
              testName: 'Hemograma Completo',
              valueText: 'Ver resultado detalhado',
              units: '',
              interpretation: 'normal',
              isAbnormal: false,
              isCritical: false,
              isPreliminary: false,
              qcPassed: true,
              method: 'Automação hematológica',
              instrument: 'Sysmex XN-1000',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],

          totalCost: 85.50,

          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: new Date()
        }
      ];
      setOrders(mockOrders);
    } catch (err) {
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar exames disponíveis
  const loadTests = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockTests: LabTest[] = [
        {
          id: 'test-hemograma',
          code: 'HEM',
          name: 'Hemograma Completo',
          category: {
            id: 'hematology',
            name: 'Hematologia',
            code: 'HEM',
            description: 'Exames hematológicos',
            color: '#e74c3c',
            icon: 'droplet',
            subcategories: ['Eritrócitos', 'Leucócitos', 'Plaquetas']
          },
          description: 'Contagem completa de células sanguíneas',
          method: 'Automação hematológica',
          sampleType: 'blood',
          volumeRequired: 3,
          containerType: 'edta_tube',
          fastingRequired: false,
          turnaroundTime: 2,
          referenceRanges: [],
          cost: 35.00,
          active: true,
          requiresApproval: false,
          emergencyAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-glicemia',
          code: 'GLIC',
          name: 'Glicemia de Jejum',
          category: {
            id: 'biochemistry',
            name: 'Bioquímica',
            code: 'BIO',
            description: 'Exames bioquímicos',
            color: '#3498db',
            icon: 'flask',
            subcategories: ['Glicídios', 'Lipídios', 'Proteínas', 'Enzimas']
          },
          description: 'Dosagem de glicose em sangue',
          method: 'Enzimático colorimétrico',
          sampleType: 'blood',
          volumeRequired: 2,
          containerType: 'fluoride_tube',
          fastingRequired: true,
          preparation: 'Jejum mínimo de 8 horas',
          turnaroundTime: 1,
          referenceRanges: [],
          cost: 12.50,
          active: true,
          requiresApproval: false,
          emergencyAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setTests(mockTests);
    } catch (err) {
      setError('Erro ao carregar exames');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar equipamentos
  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockEquipment: LabEquipment[] = [
        {
          id: 'equip1',
          name: 'Sysmex XN-1000',
          model: 'XN-1000',
          manufacturer: 'Sysmex',
          serialNumber: 'XN2023001',
          type: 'hematology_analyzer',
          location: 'Laboratório Central',
          room: 'Sala de Hematologia',

          specifications: {
            throughput: 100,
            precision: 0.95,
            accuracy: 0.98
          },

          status: 'operational',
          lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          lastCalibration: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          nextCalibration: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),

          totalTests: 45678,
          monthlyUsage: 1200,
          downtimeHours: 24,

          calibrationHistory: [],
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setEquipment(mockEquipment);
    } catch (err) {
      setError('Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Solicitar exames laboratoriais
  const orderTests = useCallback(async (orderData: Partial<LabOrder>) => {
    try {
      setLoading(true);
      // Mock implementation - substituir por chamada real da API
      console.log('Solicitando exames:', orderData);

      const newOrder: LabOrder = {
        id: `order-${Date.now()}`,
        patientId: orderData.patientId!,
        patientName: orderData.patientName!,
        patientAge: orderData.patientAge || 0,
        patientGender: orderData.patientGender || 'M',
        patientBirthDate: orderData.patientBirthDate || new Date(),

        requestedBy: orderData.requestedBy || 'current-user',
        requestedByName: orderData.requestedByName || 'Usuário Atual',
        requestingDepartment: orderData.requestingDepartment || '',
        clinicalIndication: orderData.clinicalIndication || '',
        urgency: orderData.urgency || 'routine',

        tests: orderData.tests || [],
        sampleType: orderData.sampleType || 'blood',
        sampleCondition: 'adequate',
        status: 'ordered',
        priority: 'normal',

        qualityControl: {
          id: `qc-${Date.now()}`,
          orderId: `order-${Date.now()}`,
          internalControls: [],
          externalControls: [],
          overallQC: 'passed',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        results: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setOrders(prev => [newOrder, ...prev]);

      return { success: true, order: newOrder };
    } catch (err) {
      setError('Erro ao solicitar exames');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Receber amostra
  const receiveSample = useCallback(async (orderId: string, sampleData: {
    receivedDate: Date;
    volume?: number;
    condition: any;
  }) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Recebendo amostra:', orderId, sampleData);

      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              sampleReceivedDate: sampleData.receivedDate,
              sampleVolume: sampleData.volume,
              sampleCondition: sampleData.condition,
              status: 'sample_received'
            }
          : order
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao receber amostra');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Iniciar processamento
  const startProcessing = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Iniciando processamento:', orderId);

      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              status: 'in_progress'
            }
          : order
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao iniciar processamento');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar resultados
  const recordResults = useCallback(async (orderId: string, results: LabResult[]) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Registrando resultados:', orderId, results);

      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              results: [...order.results, ...results],
              status: 'completed',
              completedAt: new Date()
            }
          : order
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao registrar resultados');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar resultados
  const validateResults = useCallback(async (orderId: string, validatedBy: string) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Validando resultados:', orderId, validatedBy);

      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              results: order.results.map(result => ({
                ...result,
                validatedBy,
                validatedByName: 'Responsável Atual',
                validatedAt: new Date(),
                isPreliminary: false
              }))
            }
          : order
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao validar resultados');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Liberar resultados
  const releaseResults = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Liberando resultados:', orderId);

      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              status: 'completed',
              completedAt: new Date()
            }
          : order
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao liberar resultados');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar pedidos
  const searchOrders = useCallback((query: string, filters?: LabFilters) => {
    return orders.filter(order => {
      const matchesQuery = !query ||
        order.patientName.toLowerCase().includes(query.toLowerCase()) ||
        order.id.toLowerCase().includes(query.toLowerCase());

      const matchesFilters = !filters ||
        (!filters.status?.length || filters.status.includes(order.status)) &&
        (!filters.urgency?.length || filters.urgency.includes(order.urgency));

      return matchesQuery && matchesFilters;
    });
  }, [orders]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const today = new Date();
    const todayOrders = orders.filter(order =>
      order.createdAt.toDateString() === today.toDateString()
    );

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      pendingOrders: orders.filter(o => o.status === 'ordered' || o.status === 'sample_collected').length,
      urgentOrders: orders.filter(o => o.urgency === 'urgent' || o.urgency === 'emergency').length,
      averageTurnaroundTime: 120, // mock
      rejectionRate: orders.filter(o => o.status === 'rejected').length / orders.length * 100,
      equipmentAvailable: equipment.filter(e => e.status === 'operational').length
    };
  }, [orders, equipment]);

  // Inicializar dados
  useEffect(() => {
    loadDashboardData();
    loadOrders();
    loadTests();
    loadEquipment();
  }, [loadDashboardData, loadOrders, loadTests, loadEquipment]);

  return {
    // State
    orders,
    tests,
    equipment,
    worklists,
    dashboardData,
    loading,
    error,
    stats,

    // Actions
    loadDashboardData,
    loadOrders,
    loadTests,
    loadEquipment,
    orderTests,
    receiveSample,
    startProcessing,
    recordResults,
    validateResults,
    releaseResults,
    searchOrders,

    // Utilities
    clearError: () => setError(null)
  };
};







