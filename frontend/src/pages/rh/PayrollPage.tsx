/**
 * Página de Folha de Pagamento
 * Sistema A1 Saúde - Módulo RH
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  RefreshCw,
  Search,
  Filter,
  User,
  Calendar,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Printer,
  Calculator,
  Building2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassModal from '@/components/ui/GlassModal';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { rhService, Employee } from '@/services/rhService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface PayrollItem {
  id: string;
  employeeId: string;
  employee: {
    name: string;
    registrationNumber: string;
    position: string;
    department: string;
    contractType: string;
  };
  month: number;
  year: number;
  
  // Proventos
  baseSalary: number;
  overtime50: number;
  overtime100: number;
  nightShift: number;
  hazardPay: number; // Insalubridade
  dangerPay: number; // Periculosidade
  bonus: number;
  otherEarnings: number;
  
  // Descontos
  inss: number;
  irrf: number;
  transportVoucher: number;
  mealVoucher: number;
  healthPlan: number;
  otherDeductions: number;
  
  // Totais
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  calculatedAt?: string;
  approvedAt?: string;
  paidAt?: string;
}

interface PayrollSummary {
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  cltCount: number;
  pjCount: number;
  averageSalary: number;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Tabela INSS 2024
const INSS_TABLE = [
  { min: 0, max: 1412.00, rate: 0.075 },
  { min: 1412.01, max: 2666.68, rate: 0.09 },
  { min: 2666.69, max: 4000.03, rate: 0.12 },
  { min: 4000.04, max: 7786.02, rate: 0.14 }
];

// Tabela IRRF 2024
const IRRF_TABLE = [
  { min: 0, max: 2259.20, rate: 0, deduction: 0 },
  { min: 2259.21, max: 2826.65, rate: 0.075, deduction: 169.44 },
  { min: 2826.66, max: 3751.05, rate: 0.15, deduction: 381.44 },
  { min: 3751.06, max: 4664.68, rate: 0.225, deduction: 662.77 },
  { min: 4664.69, max: Infinity, rate: 0.275, deduction: 896.00 }
];

// Mock data
const generateMockPayroll = (employees: Employee[], month: number, year: number): PayrollItem[] => {
  return employees.map(emp => {
    const baseSalary = emp.baseSalary || 3000;
    const overtime50 = Math.random() > 0.5 ? Math.floor(Math.random() * 500) : 0;
    const overtime100 = Math.random() > 0.7 ? Math.floor(Math.random() * 300) : 0;
    const nightShift = Math.random() > 0.6 ? Math.floor(Math.random() * 400) : 0;
    const hazardPay = Math.random() > 0.8 ? baseSalary * 0.2 : 0;
    const dangerPay = Math.random() > 0.9 ? baseSalary * 0.3 : 0;
    
    const grossSalary = baseSalary + overtime50 + overtime100 + nightShift + hazardPay + dangerPay;
    
    // Calcular INSS
    let inss = 0;
    let remaining = grossSalary;
    for (const bracket of INSS_TABLE) {
      if (remaining <= 0) break;
      const taxable = Math.min(remaining, bracket.max - bracket.min);
      inss += taxable * bracket.rate;
      remaining -= taxable;
    }
    inss = Math.min(inss, 908.85); // Teto INSS
    
    // Base IRRF (após INSS)
    const baseIRRF = grossSalary - inss;
    
    // Calcular IRRF
    let irrf = 0;
    for (const bracket of IRRF_TABLE) {
      if (baseIRRF >= bracket.min && baseIRRF <= bracket.max) {
        irrf = baseIRRF * bracket.rate - bracket.deduction;
        break;
      }
    }
    irrf = Math.max(0, irrf);
    
    const transportVoucher = emp.contractType === 'CLT' ? baseSalary * 0.06 : 0;
    const healthPlan = Math.random() > 0.5 ? 200 : 0;
    
    const totalDeductions = inss + irrf + transportVoucher + healthPlan;
    const netSalary = grossSalary - totalDeductions;
    
    return {
      id: `${emp.id}-${year}-${month}`,
      employeeId: emp.id,
      employee: {
        name: emp.name,
        registrationNumber: emp.registrationNumber,
        position: emp.position,
        department: emp.department,
        contractType: emp.contractType
      },
      month,
      year,
      baseSalary,
      overtime50,
      overtime100,
      nightShift,
      hazardPay,
      dangerPay,
      bonus: 0,
      otherEarnings: 0,
      inss,
      irrf,
      transportVoucher,
      mealVoucher: 0,
      healthPlan,
      otherDeductions: 0,
      grossSalary,
      totalDeductions,
      netSalary,
      status: Math.random() > 0.5 ? 'calculated' : 'draft'
    };
  });
};

export const PayrollPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PayrollItem | null>(null);

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadData();
  }, [establishmentId, selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await rhService.getEmployees({ establishmentId, isActive: true });
      setEmployees(result.employees || []);
      
      // Gerar folha de pagamento mock
      const payroll = generateMockPayroll(result.employees || [], selectedMonth, selectedYear);
      setPayrollItems(payroll);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar folha de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (): PayrollSummary => {
    const filtered = getFilteredItems();
    return {
      totalGross: filtered.reduce((acc, item) => acc + item.grossSalary, 0),
      totalDeductions: filtered.reduce((acc, item) => acc + item.totalDeductions, 0),
      totalNet: filtered.reduce((acc, item) => acc + item.netSalary, 0),
      employeeCount: filtered.length,
      cltCount: filtered.filter(item => item.employee.contractType === 'CLT').length,
      pjCount: filtered.filter(item => item.employee.contractType === 'PJ').length,
      averageSalary: filtered.length > 0 
        ? filtered.reduce((acc, item) => acc + item.netSalary, 0) / filtered.length 
        : 0
    };
  };

  const getFilteredItems = () => {
    return payrollItems.filter(item => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!item.employee.name.toLowerCase().includes(term) &&
            !item.employee.registrationNumber.toLowerCase().includes(term)) {
          return false;
        }
      }
      if (departmentFilter && item.employee.department !== departmentFilter) {
        return false;
      }
      if (statusFilter && item.status !== statusFilter) {
        return false;
      }
      return true;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(prev => prev - 1);
      } else {
        setSelectedMonth(prev => prev - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(prev => prev + 1);
      } else {
        setSelectedMonth(prev => prev + 1);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-300',
      calculated: 'bg-yellow-500/20 text-yellow-300',
      approved: 'bg-blue-500/20 text-blue-300',
      paid: 'bg-green-500/20 text-green-300'
    };
    
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      calculated: 'Calculado',
      approved: 'Aprovado',
      paid: 'Pago'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status] || status}
      </span>
    );
  };

  const openDetails = (item: PayrollItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleCalculateAll = () => {
    setPayrollItems(prev => 
      prev.map(item => ({ ...item, status: 'calculated' as const, calculatedAt: new Date().toISOString() }))
    );
    toast.success('Folha calculada com sucesso');
  };

  const handleApproveAll = () => {
    setPayrollItems(prev => 
      prev.map(item => 
        item.status === 'calculated' 
          ? { ...item, status: 'approved' as const, approvedAt: new Date().toISOString() }
          : item
      )
    );
    toast.success('Folha aprovada com sucesso');
  };

  const handleExport = () => {
    const filtered = getFilteredItems();
    const csv = filtered.map(item => 
      `${item.employee.registrationNumber},${item.employee.name},${item.employee.department},${item.baseSalary},${item.grossSalary},${item.totalDeductions},${item.netSalary},${item.status}`
    ).join('\n');
    
    const header = 'Matrícula,Nome,Setor,Salário Base,Bruto,Descontos,Líquido,Status\n';
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `folha_pagamento_${MONTHS[selectedMonth - 1]}_${selectedYear}.csv`;
    a.click();
    toast.success('Exportado com sucesso');
  };

  const filteredItems = getFilteredItems();
  const summary = calculateSummary();
  const departments = [...new Set(employees.map(e => e.department))];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i + 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Folha de Pagamento</h1>
              <p className="text-text-secondary">Cálculo e gestão de salários</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <GlassButton onClick={loadData} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </GlassButton>
            <GlassButton variant="primary" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </GlassButton>
          </div>
        </motion.div>

        {/* Seletor de Período */}
        <GlassCard className="p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <GlassButton size="sm" variant="ghost" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-5 h-5" />
              </GlassButton>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  {MONTHS.map((month, idx) => (
                    <option key={idx} value={idx + 1}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <GlassButton size="sm" variant="ghost" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-5 h-5" />
              </GlassButton>
            </div>

            <div className="flex space-x-2">
              <GlassButton variant="secondary" onClick={handleCalculateAll}>
                <Calculator className="w-4 h-4 mr-2" />
                Calcular Folha
              </GlassButton>
              <GlassButton variant="success" onClick={handleApproveAll}>
                <FileText className="w-4 h-4 mr-2" />
                Aprovar Folha
              </GlassButton>
            </div>
          </div>
        </GlassCard>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-text-secondary text-xs">Total Bruto</p>
            </div>
            <p className="text-xl font-bold text-green-300">{formatCurrency(summary.totalGross)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <p className="text-text-secondary text-xs">Descontos</p>
            </div>
            <p className="text-xl font-bold text-red-300">{formatCurrency(summary.totalDeductions)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <p className="text-text-secondary text-xs">Total Líquido</p>
            </div>
            <p className="text-xl font-bold text-blue-300">{formatCurrency(summary.totalNet)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-purple-400" />
              <p className="text-text-secondary text-xs">Funcionários</p>
            </div>
            <p className="text-xl font-bold text-white">{summary.employeeCount}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-yellow-400" />
              <p className="text-text-secondary text-xs">CLT / PJ</p>
            </div>
            <p className="text-xl font-bold text-white">{summary.cltCount} / {summary.pjCount}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Minus className="w-4 h-4 text-cyan-400" />
              <p className="text-text-secondary text-xs">Média Líquido</p>
            </div>
            <p className="text-xl font-bold text-cyan-300">{formatCurrency(summary.averageSalary)}</p>
          </GlassCard>
        </div>

        {/* Filtros */}
        <GlassCard className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassInput
              placeholder="Buscar por nome ou matrícula..."
              value={searchTerm}
              onChange={setSearchTerm}
              icon={<Search className="w-5 h-5" />}
            />
            <GlassSelect
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={[
                { value: '', label: 'Todos os Setores' },
                ...departments.map(d => ({ value: d, label: d }))
              ]}
            />
            <GlassSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: 'Todos os Status' },
                { value: 'draft', label: 'Rascunho' },
                { value: 'calculated', label: 'Calculado' },
                { value: 'approved', label: 'Aprovado' },
                { value: 'paid', label: 'Pago' }
              ]}
            />
            <GlassButton variant="ghost">
              <Filter className="w-4 h-4 mr-2" />
              Mais Filtros
            </GlassButton>
          </div>
        </GlassCard>

        {/* Tabela */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Funcionário</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Setor</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Salário Base</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Proventos</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Descontos</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-text-secondary">Líquido</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-text-secondary">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{item.employee.name}</p>
                            <p className="text-text-secondary text-xs">
                              {item.employee.registrationNumber} • {item.employee.position}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white text-sm">
                        {item.employee.department}
                      </td>
                      <td className="px-4 py-3 text-right text-white text-sm">
                        {formatCurrency(item.baseSalary)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-300 text-sm font-medium">
                        {formatCurrency(item.grossSalary)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-300 text-sm">
                        -{formatCurrency(item.totalDeductions)}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-300 text-sm font-bold">
                        {formatCurrency(item.netSalary)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openDetails(item)}
                            className="text-medical-blue hover:text-blue-300 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-text-secondary hover:text-white transition-colors"
                            title="Imprimir holerite"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Modal Detalhes */}
        <GlassModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Detalhes do Holerite"
          size="lg"
        >
          {selectedItem && (
            <div className="space-y-6">
              {/* Cabeçalho */}
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{selectedItem.employee.name}</h3>
                    <p className="text-text-secondary text-sm">
                      {selectedItem.employee.registrationNumber} • {selectedItem.employee.position}
                    </p>
                    <p className="text-text-secondary text-sm">{selectedItem.employee.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{MONTHS[selectedItem.month - 1]} / {selectedItem.year}</p>
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Proventos */}
                <div>
                  <h4 className="text-green-400 font-semibold mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Proventos
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Salário Base</span>
                      <span className="text-white">{formatCurrency(selectedItem.baseSalary)}</span>
                    </div>
                    {selectedItem.overtime50 > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Hora Extra 50%</span>
                        <span className="text-white">{formatCurrency(selectedItem.overtime50)}</span>
                      </div>
                    )}
                    {selectedItem.overtime100 > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Hora Extra 100%</span>
                        <span className="text-white">{formatCurrency(selectedItem.overtime100)}</span>
                      </div>
                    )}
                    {selectedItem.nightShift > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Adicional Noturno</span>
                        <span className="text-white">{formatCurrency(selectedItem.nightShift)}</span>
                      </div>
                    )}
                    {selectedItem.hazardPay > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Insalubridade</span>
                        <span className="text-white">{formatCurrency(selectedItem.hazardPay)}</span>
                      </div>
                    )}
                    {selectedItem.dangerPay > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Periculosidade</span>
                        <span className="text-white">{formatCurrency(selectedItem.dangerPay)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-white/10 flex justify-between font-semibold">
                      <span className="text-green-400">Total Proventos</span>
                      <span className="text-green-300">{formatCurrency(selectedItem.grossSalary)}</span>
                    </div>
                  </div>
                </div>

                {/* Descontos */}
                <div>
                  <h4 className="text-red-400 font-semibold mb-3 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Descontos
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">INSS</span>
                      <span className="text-white">-{formatCurrency(selectedItem.inss)}</span>
                    </div>
                    {selectedItem.irrf > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">IRRF</span>
                        <span className="text-white">-{formatCurrency(selectedItem.irrf)}</span>
                      </div>
                    )}
                    {selectedItem.transportVoucher > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Vale Transporte</span>
                        <span className="text-white">-{formatCurrency(selectedItem.transportVoucher)}</span>
                      </div>
                    )}
                    {selectedItem.healthPlan > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Plano de Saúde</span>
                        <span className="text-white">-{formatCurrency(selectedItem.healthPlan)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-white/10 flex justify-between font-semibold">
                      <span className="text-red-400">Total Descontos</span>
                      <span className="text-red-300">-{formatCurrency(selectedItem.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Líquido */}
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 font-semibold text-lg">Salário Líquido</span>
                  <span className="text-blue-300 font-bold text-2xl">{formatCurrency(selectedItem.netSalary)}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-end space-x-2">
                <GlassButton variant="ghost" onClick={() => setShowDetailsModal(false)}>
                  Fechar
                </GlassButton>
                <GlassButton variant="secondary">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Holerite
                </GlassButton>
              </div>
            </div>
          )}
        </GlassModal>
      </div>
    </div>
  );
};

export default PayrollPage;






