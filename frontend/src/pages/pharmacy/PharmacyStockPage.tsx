import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Package, Plus, Search, AlertTriangle, Clock, TrendingDown,
  TrendingUp, Filter, BarChart3, ArrowDownUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { pharmacyStockService, PharmacyProduct, StockMovement } from '@/services/pharmacyStockService';

type TabType = 'dashboard' | 'products' | 'movements' | 'alerts';

const PharmacyStockPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<any>(null);
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [expiringBatches, setExpiringBatches] = useState<any[]>([]);
  const [filters, setFilters] = useState({ search: '', category: '', lowStock: false });

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadDashboard();
  }, [establishmentId]);

  useEffect(() => {
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'movements') loadMovements();
    if (activeTab === 'alerts') loadAlerts();
  }, [activeTab, establishmentId, filters]);

  const loadDashboard = async () => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      const [dashRes, alertsRes] = await Promise.all([
        pharmacyStockService.getDashboard(establishmentId),
        pharmacyStockService.getAlerts(establishmentId)
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      const response = await pharmacyStockService.listProducts({
        establishmentId,
        search: filters.search,
        category: filters.category,
        lowStock: filters.lowStock,
        page: 1,
        limit: 50
      });
      if (response.success) setProducts(response.items);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async () => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      const response = await pharmacyStockService.listMovements({
        establishmentId,
        page: 1,
        limit: 50
      });
      if (response.success) setMovements(response.items);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      const [alertsRes, expiringRes] = await Promise.all([
        pharmacyStockService.getAlerts(establishmentId),
        pharmacyStockService.getExpiringBatches(establishmentId, 30)
      ]);
      if (alertsRes.success) setAlerts(alertsRes.data);
      if (expiringRes.success) setExpiringBatches(expiringRes.data);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'exit':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <ArrowDownUp className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getMovementTypeName = (type: string) => {
    const types: Record<string, string> = {
      entry: 'Entrada',
      exit: 'Saída',
      adjustment: 'Ajuste',
      transfer: 'Transferência',
      loss: 'Perda',
      return: 'Devolução'
    };
    return types[type] || type;
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'movements', label: 'Movimentações', icon: ArrowDownUp },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <Package className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Farmácia - Estoque</h1>
              <p className="text-text-secondary">Controle de medicamentos e insumos</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <GlassButton variant="secondary">
              <TrendingUp className="w-4 h-4 mr-2" />
              Entrada
            </GlassButton>
            <GlassButton variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </GlassButton>
          </div>
        </motion.div>

        {/* Tabs */}
        <GlassCard className="p-2 mb-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <GlassButton
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  variant={activeTab === tab.id ? 'primary' : 'ghost'}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'alerts' && alerts && (alerts.lowStock + alerts.expiring + alerts.expired) > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 rounded-full text-xs text-white">
                      {alerts.lowStock + alerts.expiring + alerts.expired}
                    </span>
                  )}
                </GlassButton>
              );
            })}
          </div>
        </GlassCard>

        {/* Dashboard */}
        {activeTab === 'dashboard' && dashboard && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <GlassCard className="p-4">
                <p className="text-text-secondary text-sm">Total Produtos</p>
                <p className="text-2xl font-bold text-white">{dashboard.totalProducts}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-text-secondary text-sm">Itens em Estoque</p>
                <p className="text-2xl font-bold text-emerald-300">{dashboard.totalItems}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-text-secondary text-sm">Movimentações Hoje</p>
                <p className="text-2xl font-bold text-blue-300">{dashboard.todayMovements}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-text-secondary text-sm">Dispensações Mês</p>
                <p className="text-2xl font-bold text-purple-300">{dashboard.monthDispensations}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-text-secondary text-sm">Alertas</p>
                <p className="text-2xl font-bold text-red-300">
                  {dashboard.alerts ? (dashboard.alerts.lowStock + dashboard.alerts.expiring + dashboard.alerts.expired) : 0}
                </p>
              </GlassCard>
            </div>

            {/* By Category */}
            {dashboard.byCategory && dashboard.byCategory.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Estoque por Categoria</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dashboard.byCategory.map((cat: any) => (
                    <div key={cat.category} className="p-4 bg-white/5 rounded-lg">
                      <p className="text-white font-medium capitalize">{cat.category}</p>
                      <p className="text-sm text-text-secondary">{cat.count} produtos</p>
                      <p className="text-lg font-bold text-emerald-400">{cat.stock} itens</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <GlassCard className="overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-medical-blue"
                  />
                </div>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none"
                >
                  <option value="">Todas as Categorias</option>
                  <option value="medication">Medicamentos</option>
                  <option value="supply">Insumos</option>
                  <option value="equipment">Equipamentos</option>
                  <option value="controlled">Controlados</option>
                </select>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.lowStock}
                    onChange={(e) => setFilters(prev => ({ ...prev, lowStock: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-white text-sm">Estoque baixo</span>
                </label>
                <GlassButton onClick={loadProducts} size="sm" variant="secondary">
                  Buscar
                </GlassButton>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Categoria</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Apresentação</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Estoque</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Mínimo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                        Nenhum produto encontrado
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                        <td className="px-4 py-3 text-sm text-text-secondary">{product.code}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-white font-medium">{product.name}</p>
                            {product.genericName && (
                              <p className="text-xs text-text-secondary">{product.genericName}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white capitalize">{product.category}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">{product.presentation}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={`font-bold ${
                            product.currentStock <= product.minStock ? 'text-red-400' :
                            product.currentStock <= product.minStock * 1.5 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {product.currentStock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-text-secondary">{product.minStock}</td>
                        <td className="px-4 py-3">
                          {product.currentStock <= product.minStock ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-300">
                              Crítico
                            </span>
                          ) : product.currentStock <= product.minStock * 1.5 ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300">
                              Baixo
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Movements */}
        {activeTab === 'movements' && (
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data/Hora</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Produto</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Quantidade</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Estoque Anterior</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Novo Estoque</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                        Nenhuma movimentação encontrada
                      </td>
                    </tr>
                  ) : (
                    movements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-white">
                          {new Date(movement.performedAt).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {getMovementTypeIcon(movement.movementType)}
                            <span className="text-sm text-white">{getMovementTypeName(movement.movementType)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">{movement.product?.name}</td>
                        <td className="px-4 py-3 text-sm text-right font-bold">
                          <span className={movement.movementType === 'entry' ? 'text-green-400' : 'text-red-400'}>
                            {movement.movementType === 'entry' ? '+' : '-'}{movement.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-text-secondary">{movement.previousStock}</td>
                        <td className="px-4 py-3 text-sm text-right text-white">{movement.newStock}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary truncate max-w-[150px]">
                          {movement.reason || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Alerts */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Summary */}
            {alerts && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Estoque Baixo</p>
                      <p className="text-3xl font-bold text-red-300">{alerts.lowStock}</p>
                    </div>
                    <TrendingDown className="w-10 h-10 text-red-400" />
                  </div>
                </GlassCard>
                <GlassCard className="p-4 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Vencendo em 30 dias</p>
                      <p className="text-3xl font-bold text-yellow-300">{alerts.expiring}</p>
                    </div>
                    <Clock className="w-10 h-10 text-yellow-400" />
                  </div>
                </GlassCard>
                <GlassCard className="p-4 border-l-4 border-red-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Vencidos</p>
                      <p className="text-3xl font-bold text-red-500">{alerts.expired}</p>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Expiring Batches */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Lotes Próximos do Vencimento</h3>
              {expiringBatches.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhum lote próximo do vencimento</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expiringBatches.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{batch.product?.name}</p>
                        <p className="text-sm text-text-secondary">Lote: {batch.batchNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          new Date(batch.expirationDate) < new Date() ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {new Date(batch.expirationDate).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-text-secondary">{batch.currentQuantity} unidades</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyStockPage;

