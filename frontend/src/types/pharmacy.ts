// Tipos para o sistema de gestão de estoque da farmácia

export interface PharmacyMedication {
  id: string;
  nomeComercial: string;
  principioAtivo: string;
  dosagem: string;
  apresentacao: string;
  viaAdministracao: string;
  categoria: string;
  tarja: 'Sem tarja' | 'Vermelha' | 'Preta';
  laboratorio: string;
  concentracao?: string;
  unidadeMedida: string;
  estoqueMinimo: number;
  estoqueMaximo: number;
  valorUnitario: number;
  valorReferencia?: number;
  codigoBarras?: string;
  principioAtivoId: string;
  ativo: boolean;
  necessitaPrescricao: boolean;
  medicamentoControlado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationBatch {
  id: string;
  medicationId: string;
  lote: string;
  fornecedorId: string;
  dataFabricacao: Date;
  dataValidade: Date;
  quantidadeInicial: number;
  quantidadeAtual: number;
  valorUnitarioCompra: number;
  valorUnitarioVenda: number;
  localArmazenamento: string;
  temperaturaArmazenamento?: number;
  umidadeArmazenamento?: number;
  status: 'ativo' | 'vencido' | 'quarentena' | 'bloqueado';
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PharmacySupplier {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  contatoResponsavel: string;
  prazoEntregaDias: number;
  condicoesPagamento: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PharmacyMovement {
  id: string;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
  motivo: string;
  medicationId: string;
  batchId: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  dataMovimento: Date;
  responsavelId: string;
  responsavelNome: string;
  pacienteId?: string;
  pacienteNome?: string;
  prescricaoId?: string;
  atendimentoId?: string;
  observacoes?: string;
  createdAt: Date;
}

export interface PharmacyStock {
  medicationId: string;
  medication: PharmacyMedication;
  quantidadeTotal: number;
  valorTotalEstoque: number;
  batches: MedicationBatch[];
  statusEstoque: 'normal' | 'baixo' | 'critico' | 'excessivo';
  ultimoMovimento: Date;
  proximaValidade?: Date;
  alertas: StockAlert[];
}

export interface StockAlert {
  id: string;
  tipo: 'estoque_baixo' | 'estoque_critico' | 'proximo_vencimento' | 'vencido' | 'excessivo';
  medicationId: string;
  medicationNome: string;
  mensagem: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  resolvido: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface PharmacyOrder {
  id: string;
  fornecedorId: string;
  fornecedor: PharmacySupplier;
  itens: PharmacyOrderItem[];
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recebido' | 'cancelado';
  dataPedido: Date;
  dataPrevistaEntrega?: Date;
  dataEntrega?: Date;
  valorTotal: number;
  observacoes?: string;
  responsavelId: string;
  responsavelNome: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PharmacyOrderItem {
  id: string;
  medicationId: string;
  medication: PharmacyMedication;
  quantidadeSolicitada: number;
  quantidadeRecebida: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface PharmacyDispensation {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  prescricaoId?: string;
  atendimentoId?: string;
  medicoId?: string;
  medicoNome?: string;
  itens: PharmacyDispensationItem[];
  status: 'pendente' | 'dispensado' | 'cancelado';
  dataDispensacao?: Date;
  responsavelId: string;
  responsavelNome: string;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PharmacyDispensationItem {
  id: string;
  medicationId: string;
  medication: PharmacyMedication;
  batchId: string;
  quantidadePrescrita: number;
  quantidadeDispensada: number;
  dosagem: string;
  frequencia: string;
  duracao: string;
  instrucoesUso?: string;
}

export interface PharmacyInventory {
  id: string;
  dataInventario: Date;
  responsavelId: string;
  responsavelNome: string;
  status: 'em_andamento' | 'concluido' | 'cancelado';
  itens: PharmacyInventoryItem[];
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PharmacyInventoryItem {
  id: string;
  medicationId: string;
  medication: PharmacyMedication;
  quantidadeContada: number;
  quantidadeSistema: number;
  diferenca: number;
  observacoes?: string;
}

export interface PharmacyDashboardData {
  totalMedicamentos: number;
  medicamentosAtivos: number;
  medicamentosVencendo: number;
  medicamentosVencidos: number;
  medicamentosEstoqueBaixo: number;
  medicamentosEstoqueCritico: number;
  valorTotalEstoque: number;
  movimentacoesHoje: number;
  dispensacoesHoje: number;
  alertasAtivos: number;
  pedidosPendentes: number;
}

export interface PharmacyReport {
  id: string;
  tipo: 'consumo' | 'estoque' | 'movimentacao' | 'validade' | 'financeiro';
  titulo: string;
  periodo: {
    inicio: Date;
    fim: Date;
  };
  filtros?: Record<string, any>;
  dados: any[];
  geradoPor: string;
  geradoEm: Date;
  createdAt: Date;
}

// Tipos para filtros e busca
export interface PharmacyFilters {
  categoria?: string[];
  tarja?: string[];
  fornecedor?: string[];
  statusEstoque?: string[];
  principioAtivo?: string[];
  laboratorio?: string[];
  dataValidadeInicio?: Date;
  dataValidadeFim?: Date;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
}

export interface PharmacySearchParams {
  query: string;
  filtros: PharmacyFilters;
  ordenacao: {
    campo: string;
    direcao: 'asc' | 'desc';
  };
  pagina: number;
  limite: number;
}









