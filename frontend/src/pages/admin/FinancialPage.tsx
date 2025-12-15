import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  FileText,
  Calendar,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Banknote,
  Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { financialService, type FinancialDashboard, type Expense } from '@/services/financialService';

const FinancialPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budgets' | 'expenses'>('dashboard');

  useEffect(() => {
    loadDashboard();
  }, [selectedYear, selectedMonth]);

  const loadDashboard = async () => {
    try {
      const data = await financialService.getFinancialDashboard(
        user?.establishmentId,
        selectedYear,
        selectedMonth
      );
      setDashboard(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard financeiro:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'over_budget':
        return 'text-red-400 bg-red-500/20 border-red-400/30';
      case 'under_budget':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getExpenseStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'approved':
        return 'text-blue-400 bg-blue-500/20 border-blue-400/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'debit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'bank_transfer':
        return <Building2 className="w-4 h-4" />;
      case 'check':
        return <FileText className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestão Financeira</h1>
          <p className="text-gray-400">Controle de orçamentos e despesas</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg"
      >
        {[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'budgets', label: 'Orçamentos', icon: FileText },
          { id: 'expenses', label: 'Despesas', icon: DollarSign }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Orçamento Total</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(dashboard.totalBudget)}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Gasto Total</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(dashboard.totalSpent)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-400" />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Saldo Restante</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(dashboard.totalRemaining)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Utilização</p>
                  <p className="text-2xl font-bold text-purple-400">{dashboard.budgetUtilizationPercentage}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </GlassCard>
          </div>

          {/* Monthly Trend Chart Placeholder */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Tendência Mensal</h3>
            <div className="h-64 flex items-center justify-center bg-gray-800/30 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">Gráfico de tendência mensal</p>
                <p className="text-sm text-gray-500">Implementação em desenvolvimento</p>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expenses by Category */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Gastos por Categoria</h3>
              <div className="space-y-3">
                {dashboard.expensesByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="text-gray-300">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{formatCurrency(category.amount)}</div>
                      <div className="text-sm text-gray-400">{category.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Top Expenses */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Principais Despesas</h3>
              <div className="space-y-3">
                {dashboard.topExpenses.map((expense, index) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-medium">{expense.description}</div>
                      <div className="text-sm text-gray-400">{expense.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{formatCurrency(expense.amount)}</div>
                      <div className={`text-xs px-2 py-1 rounded-full border ${getExpenseStatusColor(expense.status)}`}>
                        {expense.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Alerts */}
          {dashboard.alerts.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Alertas Financeiros
              </h3>
              <div className="space-y-3">
                {dashboard.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      alert.type === 'danger'
                        ? 'bg-red-500/10 border-red-400/30 text-red-300'
                        : 'bg-yellow-500/10 border-yellow-400/30 text-yellow-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        alert.type === 'danger' ? 'text-red-400' : 'text-yellow-400'
                      }`} />
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        {alert.category && (
                          <p className="text-sm opacity-75">Categoria: {alert.category}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Orçamentos</h2>
            <GlassButton
              onClick={() => toast.success('Criar orçamento em desenvolvimento')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Orçamento
            </GlassButton>
          </div>

          <GlassCard className="p-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Gestão de Orçamentos</h3>
              <p className="text-gray-500 mb-4">Funcionalidade em desenvolvimento</p>
              <p className="text-sm text-gray-600">
                Aqui você poderá criar, editar e acompanhar orçamentos por categoria e período
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Despesas</h2>
            <div className="flex items-center gap-4">
              <GlassButton variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </GlassButton>
              <GlassButton
                onClick={() => toast.success('Criar despesa em desenvolvimento')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Despesa
              </GlassButton>
            </div>
          </div>

          {/* Filters */}
          <GlassCard className="p-6">
            <div className="flex flex-wrap gap-4">
              <GlassInput
                placeholder="Buscar despesas..."
                className="flex-1 min-w-64"
                icon={<Filter className="w-4 h-4" />}
              />
              <select className="px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todas as categorias</option>
                <option value="pessoal">Pessoal</option>
                <option value="medicamentos">Medicamentos</option>
                <option value="manutencao">Manutenção</option>
                <option value="materiais">Materiais</option>
              </select>
              <select className="px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="paid">Pago</option>
              </select>
            </div>
          </GlassCard>

          {/* Mock Expenses List */}
          <div className="space-y-4">
            {[
              {
                id: '1',
                description: 'Compra de medicamentos analgésicos',
                category: 'Medicamentos',
                amount: 2500,
                date: '2024-12-14',
                status: 'approved',
                paymentMethod: 'credit_card',
                supplier: 'Farmácia Central'
              },
              {
                id: '2',
                description: 'Reparo de ar condicionado na emergência',
                category: 'Manutenção',
                amount: 1800,
                date: '2024-12-13',
                status: 'paid',
                paymentMethod: 'bank_transfer',
                supplier: 'Manutenção Técnica Ltda'
              },
              {
                id: '3',
                description: 'Horas extras equipe de enfermagem',
                category: 'Pessoal',
                amount: 3200,
                date: '2024-12-12',
                status: 'pending',
                paymentMethod: 'bank_transfer'
              }
            ].map((expense) => (
              <GlassCard key={expense.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-gray-700/50">
                      {getPaymentMethodIcon(expense.paymentMethod)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{expense.description}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span>{expense.category}</span>
                        <span>{new Date(expense.date).toLocaleDateString('pt-BR')}</span>
                        {expense.supplier && <span>{expense.supplier}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">{formatCurrency(expense.amount)}</div>
                      <div className={`text-xs px-2 py-1 rounded-full border mt-1 ${getExpenseStatusColor(expense.status)}`}>
                        {expense.status === 'paid' ? 'Pago' :
                         expense.status === 'approved' ? 'Aprovado' :
                         expense.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <GlassButton size="sm" variant="secondary">
                        <Eye className="w-4 h-4" />
                      </GlassButton>
                      <GlassButton size="sm" variant="secondary">
                        <FileText className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FinancialPage;

