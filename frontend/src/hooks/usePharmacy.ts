import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PharmacyMedication,
  PharmacyStock,
  PharmacyMovement,
  PharmacySupplier,
  PharmacyOrder,
  PharmacyDispensation,
  PharmacyDashboardData,
  PharmacyFilters,
  StockAlert,
  MedicationBatch
} from '@/types/pharmacy';

export const usePharmacy = () => {
  const [medications, setMedications] = useState<PharmacyMedication[]>([]);
  const [stock, setStock] = useState<PharmacyStock[]>([]);
  const [movements, setMovements] = useState<PharmacyMovement[]>([]);
  const [suppliers, setSuppliers] = useState<PharmacySupplier[]>([]);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [dispensations, setDispensations] = useState<PharmacyDispensation[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [dashboardData, setDashboardData] = useState<PharmacyDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockDashboard: PharmacyDashboardData = {
        totalMedicamentos: 245,
        medicamentosAtivos: 223,
        medicamentosVencendo: 12,
        medicamentosVencidos: 3,
        medicamentosEstoqueBaixo: 18,
        medicamentosEstoqueCritico: 5,
        valorTotalEstoque: 45230.50,
        movimentacoesHoje: 45,
        dispensacoesHoje: 28,
        alertasAtivos: 26,
        pedidosPendentes: 3
      };
      setDashboardData(mockDashboard);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar medicamentos
  const loadMedications = useCallback(async (filters?: PharmacyFilters) => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockMedications: PharmacyMedication[] = [
        {
          id: '1',
          nomeComercial: 'Novalgina',
          principioAtivo: 'Dipirona',
          dosagem: '500mg',
          apresentacao: 'Comprimido',
          viaAdministracao: 'Oral',
          categoria: 'Analgésico/Antitérmico',
          tarja: 'Sem tarja',
          laboratorio: 'Sanofi',
          unidadeMedida: 'comprimido',
          estoqueMinimo: 100,
          estoqueMaximo: 500,
          valorUnitario: 0.15,
          principioAtivoId: 'dipirona',
          ativo: true,
          necessitaPrescricao: false,
          medicamentoControlado: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          nomeComercial: 'Cataflam',
          principioAtivo: 'Diclofenaco',
          dosagem: '50mg',
          apresentacao: 'Comprimido',
          viaAdministracao: 'Oral',
          categoria: 'Anti-inflamatório/Analgésico',
          tarja: 'Vermelha',
          laboratorio: 'Novartis',
          unidadeMedida: 'comprimido',
          estoqueMinimo: 50,
          estoqueMaximo: 200,
          valorUnitario: 0.45,
          principioAtivoId: 'diclofenaco',
          ativo: true,
          necessitaPrescricao: true,
          medicamentoControlado: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          nomeComercial: 'Rivotril',
          principioAtivo: 'Clonazepam',
          dosagem: '2mg',
          apresentacao: 'Comprimido',
          viaAdministracao: 'Oral',
          categoria: 'Ansiolítico/Benzodiazepínico',
          tarja: 'Preta',
          laboratorio: 'Roche',
          unidadeMedida: 'comprimido',
          estoqueMinimo: 20,
          estoqueMaximo: 100,
          valorUnitario: 1.20,
          principioAtivoId: 'clonazepam',
          ativo: true,
          necessitaPrescricao: true,
          medicamentoControlado: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setMedications(mockMedications);
    } catch (err) {
      setError('Erro ao carregar medicamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar estoque
  const loadStock = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockStock: PharmacyStock[] = medications.map(med => ({
        medicationId: med.id,
        medication: med,
        quantidadeTotal: Math.floor(Math.random() * 200) + 50,
        valorTotalEstoque: Math.floor(Math.random() * 1000) + 100,
        batches: [],
        statusEstoque: 'normal' as const,
        ultimoMovimento: new Date(),
        alertas: []
      }));
      setStock(mockStock);
    } catch (err) {
      setError('Erro ao carregar estoque');
    } finally {
      setLoading(false);
    }
  }, [medications]);

  // Carregar alertas
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockAlerts: StockAlert[] = [
        {
          id: '1',
          tipo: 'estoque_critico',
          medicationId: '1',
          medicationNome: 'Novalgina 500mg',
          mensagem: 'Estoque crítico: 5 unidades restantes',
          severidade: 'critica',
          resolvido: false,
          createdAt: new Date()
        },
        {
          id: '2',
          tipo: 'proximo_vencimento',
          medicationId: '2',
          medicationNome: 'Cataflam 50mg',
          mensagem: 'Lote vence em 15 dias',
          severidade: 'media',
          resolvido: false,
          createdAt: new Date()
        }
      ];
      setAlerts(mockAlerts);
    } catch (err) {
      setError('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar entrada de medicamentos
  const registerEntry = useCallback(async (data: {
    medicationId: string;
    batchId: string;
    quantidade: number;
    fornecedorId: string;
    valorUnitario: number;
    dataValidade: Date;
    lote: string;
  }) => {
    try {
      setLoading(true);
      // Mock implementation - substituir por chamada real da API
      console.log('Registrando entrada:', data);

      // Atualizar estoque
      setStock(prev => prev.map(item =>
        item.medicationId === data.medicationId
          ? { ...item, quantidadeTotal: item.quantidadeTotal + data.quantidade }
          : item
      ));

      // Registrar movimento
      const movement: PharmacyMovement = {
        id: Date.now().toString(),
        tipo: 'entrada',
        motivo: 'Compra/Fornecimento',
        medicationId: data.medicationId,
        batchId: data.batchId,
        quantidade: data.quantidade,
        valorUnitario: data.valorUnitario,
        valorTotal: data.quantidade * data.valorUnitario,
        dataMovimento: new Date(),
        responsavelId: 'user-1',
        responsavelNome: 'João Silva',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setMovements(prev => [movement, ...prev]);

      return { success: true };
    } catch (err) {
      setError('Erro ao registrar entrada');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar saída/dispensação
  const registerDispensation = useCallback(async (data: {
    pacienteId: string;
    pacienteNome: string;
    medicationId: string;
    quantidade: number;
    prescricaoId?: string;
    atendimentoId?: string;
  }) => {
    try {
      setLoading(true);
      // Mock implementation - substituir por chamada real da API
      console.log('Registrando dispensação:', data);

      // Verificar estoque
      const medicationStock = stock.find(s => s.medicationId === data.medicationId);
      if (!medicationStock || medicationStock.quantidadeTotal < data.quantidade) {
        throw new Error('Estoque insuficiente');
      }

      // Atualizar estoque
      setStock(prev => prev.map(item =>
        item.medicationId === data.medicationId
          ? { ...item, quantidadeTotal: item.quantidadeTotal - data.quantidade }
          : item
      ));

      // Registrar movimento
      const movement: PharmacyMovement = {
        id: Date.now().toString(),
        tipo: 'saida',
        motivo: 'Dispensação',
        medicationId: data.medicationId,
        batchId: 'batch-1', // Mock
        quantidade: data.quantidade,
        valorUnitario: 0, // Mock
        valorTotal: 0, // Mock
        dataMovimento: new Date(),
        responsavelId: 'user-1',
        responsavelNome: 'João Silva',
        pacienteId: data.pacienteId,
        pacienteNome: data.pacienteNome,
        prescricaoId: data.prescricaoId,
        atendimentoId: data.atendimentoId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setMovements(prev => [movement, ...prev]);

      return { success: true };
    } catch (err) {
      setError('Erro ao registrar dispensação');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [stock]);

  // Buscar medicamentos
  const searchMedications = useCallback((query: string, filters?: PharmacyFilters) => {
    return medications.filter(med => {
      const matchesQuery = !query ||
        med.nomeComercial.toLowerCase().includes(query.toLowerCase()) ||
        med.principioAtivo.toLowerCase().includes(query.toLowerCase());

      const matchesFilters = !filters ||
        (!filters.categoria?.length || filters.categoria.includes(med.categoria)) &&
        (!filters.tarja?.length || filters.tarja.includes(med.tarja)) &&
        (!filters.laboratorio?.length || filters.laboratorio.includes(med.laboratorio));

      return matchesQuery && matchesFilters;
    });
  }, [medications]);

  // Calcular estatísticas de estoque
  const stockStats = useMemo(() => {
    return {
      totalMedicamentos: medications.length,
      medicamentosAtivos: medications.filter(m => m.ativo).length,
      medicamentosControlados: medications.filter(m => m.medicamentoControlado).length,
      medicamentosComPrescricao: medications.filter(m => m.necessitaPrescricao).length,
      valorTotalEstoque: stock.reduce((sum, item) => sum + item.valorTotalEstoque, 0),
      alertasAtivos: alerts.filter(a => !a.resolvido).length,
      medicamentosEstoqueBaixo: stock.filter(s => s.statusEstoque === 'baixo' || s.statusEstoque === 'critico').length
    };
  }, [medications, stock, alerts]);

  // Inicializar dados
  useEffect(() => {
    loadDashboardData();
    loadMedications();
    loadAlerts();
  }, [loadDashboardData, loadMedications, loadAlerts]);

  useEffect(() => {
    if (medications.length > 0) {
      loadStock();
    }
  }, [medications, loadStock]);

  return {
    // State
    medications,
    stock,
    movements,
    suppliers,
    orders,
    dispensations,
    alerts,
    dashboardData,
    loading,
    error,
    stockStats,

    // Actions
    loadDashboardData,
    loadMedications,
    loadStock,
    loadAlerts,
    registerEntry,
    registerDispensation,
    searchMedications,

    // Utilities
    clearError: () => setError(null)
  };
};









