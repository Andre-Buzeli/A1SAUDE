import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Plus,
  Minus,
  Eye,
  Edit,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { usePharmacy } from '@/hooks/usePharmacy';
import { PharmacyStock, PharmacyFilters } from '@/types/pharmacy';

const PharmacyStockControl: React.FC = () => {
  const { stock, medications, searchMedications, loading } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PharmacyFilters>({});
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar medicamentos
  const filteredStock = useMemo(() => {
    const searchedMedications = searchMedications(searchTerm, filters);
    return stock.filter(item =>
      searchedMedications.some(med => med.id === item.medicationId)
    );
  }, [stock, searchTerm, filters, searchMedications]);

  // Estatísticas do estoque
  const stockStats = useMemo(() => {
    return {
      totalValor: filteredStock.reduce((sum, item) => sum + item.valorTotalEstoque, 0),
      medicamentosBaixo: filteredStock.filter(item => item.statusEstoque === 'baixo').length,
      medicamentosCritico: filteredStock.filter(item => item.statusEstoque === 'critico').length,
      medicamentosNormal: filteredStock.filter(item => item.statusEstoque === 'normal').length,
      medicamentosExcessivo: filteredStock.filter(item => item.statusEstoque === 'excessivo').length
    };
  }, [filteredStock]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'baixo':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'normal':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'excessivo':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critico':
        return 'Crítico';
      case 'baixo':
        return 'Baixo';
      case 'normal':
        return 'Normal';
      case 'excessivo':
        return 'Excessivo';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Controle de Estoque</h3>
          <div className="flex items-center space-x-2">
            <GlassButton
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </GlassButton>
            <GlassButton variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Entrada
            </GlassButton>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <GlassInput
            placeholder="Buscar medicamento..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="pl-10"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Categoria</label>
                <select
                  value={filters.categoria?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    categoria: e.target.value ? [e.target.value] : undefined
                  }))}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                >
                  <option value="">Todas</option>
                  <option value="Analgésico">Analgésico</option>
                  <option value="Anti-inflamatório">Anti-inflamatório</option>
                  <option value="Antibiótico">Antibiótico</option>
                  <option value="Ansiolítico">Ansiolítico</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Tarja</label>
                <select
                  value={filters.tarja?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    tarja: e.target.value ? [e.target.value] : undefined
                  }))}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                >
                  <option value="">Todas</option>
                  <option value="Sem tarja">Sem tarja</option>
                  <option value="Vermelha">Vermelha</option>
                  <option value="Preta">Preta</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Status Estoque</label>
                <select
                  value={filters.statusEstoque?.[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    statusEstoque: e.target.value ? [e.target.value] : undefined
                  }))}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                >
                  <option value="">Todos</option>
                  <option value="normal">Normal</option>
                  <option value="baixo">Baixo</option>
                  <option value="critico">Crítico</option>
                  <option value="excessivo">Excessivo</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </GlassCard>

      {/* Stock Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Valor Total</p>
              <p className="text-xl font-bold text-white">
                R$ {stockStats.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Estoque Normal</p>
              <p className="text-xl font-bold text-green-400">{stockStats.medicamentosNormal}</p>
            </div>
            <Package className="w-6 h-6 text-green-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Estoque Baixo</p>
              <p className="text-xl font-bold text-yellow-400">{stockStats.medicamentosBaixo}</p>
            </div>
            <TrendingDown className="w-6 h-6 text-yellow-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Estoque Crítico</p>
              <p className="text-xl font-bold text-red-400">{stockStats.medicamentosCritico}</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
        </GlassCard>
      </div>

      {/* Stock Table */}
      <GlassCard className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/80 font-medium">Medicamento</th>
                <th className="text-left py-3 px-4 text-white/80 font-medium">Quantidade</th>
                <th className="text-left py-3 px-4 text-white/80 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-white/80 font-medium">Valor Total</th>
                <th className="text-left py-3 px-4 text-white/80 font-medium">Último Movimento</th>
                <th className="text-left py-3 px-4 text-white/80 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item) => (
                <motion.tr
                  key={item.medicationId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">
                        {item.medication.nomeComercial}
                      </p>
                      <p className="text-white/60 text-sm">
                        {item.medication.principioAtivo} • {item.medication.dosagem}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        {item.quantidadeTotal}
                      </span>
                      <span className="text-white/60 text-sm">
                        {item.medication.unidadeMedida}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.statusEstoque)}`}>
                      {getStatusLabel(item.statusEstoque)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white font-medium">
                      R$ {item.valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white/80 text-sm">
                      {item.ultimoMovimento.toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <GlassButton size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton size="sm" variant="ghost">
                        <Plus className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton size="sm" variant="ghost">
                        <Minus className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredStock.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">
                {searchTerm ? 'Nenhum medicamento encontrado' : 'Nenhum item em estoque'}
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Selected Medication Details */}
      {selectedMedication && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Detalhes do Medicamento</h4>
              <GlassButton
                onClick={() => setSelectedMedication(null)}
                variant="ghost"
                size="sm"
              >
                ✕
              </GlassButton>
            </div>

            {/* Medication details would go here */}
            <p className="text-white/60">Funcionalidade em desenvolvimento...</p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default PharmacyStockControl;







