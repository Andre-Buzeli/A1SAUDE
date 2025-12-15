import { apiService } from './api.service';

export interface Budget {
  id: string;
  establishmentId: string;
  year: number;
  month: number;
  category: string;
  plannedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  status: 'on_track' | 'over_budget' | 'under_budget';
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  establishmentId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'check';
  supplier?: string;
  invoiceNumber?: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialDashboard {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  budgetUtilizationPercentage: number;
  monthlyTrend: {
    month: string;
    budget: number;
    spent: number;
    remaining: number;
  }[];
  expensesByCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  topExpenses: Expense[];
  alerts: {
    type: 'warning' | 'danger';
    message: string;
    category?: string;
  }[];
}

export interface BudgetFilters {
  establishmentId?: string;
  year?: number;
  month?: number;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseFilters {
  establishmentId?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
}

export interface BudgetListResponse {
  budgets: Budget[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BudgetCreateData {
  establishmentId: string;
  year: number;
  month: number;
  category: string;
  plannedAmount: number;
}

export interface ExpenseCreateData {
  establishmentId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: Expense['paymentMethod'];
  supplier?: string;
  invoiceNumber?: string;
}

class FinancialService {
  /**
   * Obter dashboard financeiro
   */
  async getFinancialDashboard(establishmentId?: string, year?: number, month?: number) {
    try {
      const params: any = {};
      if (establishmentId) params.establishmentId = establishmentId;
      if (year) params.year = year;
      if (month) params.month = month;

      const response = await apiService.get<FinancialDashboard>('/api/v1/financial/dashboard', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dashboard financeiro:', error);
      return this.getMockFinancialDashboard(establishmentId, year, month);
    }
  }

  /**
   * Criar orçamento
   */
  async createBudget(data: BudgetCreateData) {
    try {
      const response = await apiService.post<Budget>('/api/v1/financial/budgets', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      return this.getMockBudget(data);
    }
  }

  /**
   * Buscar orçamentos
   */
  async searchBudgets(filters: BudgetFilters = {}) {
    try {
      const response = await apiService.get<BudgetListResponse>('/api/v1/financial/budgets/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      return this.getMockBudgets(filters);
    }
  }

  /**
   * Criar despesa
   */
  async createExpense(data: ExpenseCreateData) {
    try {
      const response = await apiService.post<Expense>('/api/v1/financial/expenses', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      return this.getMockExpense(data);
    }
  }

  /**
   * Buscar despesas
   */
  async searchExpenses(filters: ExpenseFilters = {}) {
    try {
      const response = await apiService.get<ExpenseListResponse>('/api/v1/financial/expenses/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      return this.getMockExpenses(filters);
    }
  }

  /**
   * Aprovar despesa
   */
  async approveExpense(id: string) {
    try {
      const response = await apiService.patch<Expense>(`/api/v1/financial/expenses/${id}/approve`, {});
      return response.data;
    } catch (error) {
      console.error('Erro ao aprovar despesa:', error);
      return this.getMockExpenseById(id);
    }
  }

  /**
   * Obter categorias de despesa
   */
  async getExpenseCategories() {
    try {
      const response = await apiService.get('/api/v1/financial/expenses/categories');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter categorias de despesa:', error);
      return this.getMockExpenseCategories();
    }
  }

  /**
   * Mock data methods
   */
  private getMockFinancialDashboard(establishmentId?: string, year?: number, month?: number): FinancialDashboard {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    return {
      totalBudget: 250000,
      totalSpent: 187500,
      totalRemaining: 62500,
      budgetUtilizationPercentage: 75,
      monthlyTrend: [
        { month: 'Jan', budget: 200000, spent: 185000, remaining: 15000 },
        { month: 'Fev', budget: 200000, spent: 192000, remaining: 8000 },
        { month: 'Mar', budget: 220000, spent: 198000, remaining: 22000 },
        { month: 'Abr', budget: 220000, spent: 201000, remaining: 19000 },
        { month: 'Mai', budget: 240000, spent: 215000, remaining: 25000 },
        { month: 'Jun', budget: 240000, spent: 228000, remaining: 12000 },
        { month: 'Jul', budget: 250000, spent: 187500, remaining: 62500 }
      ],
      expensesByCategory: [
        { category: 'Pessoal', amount: 125000, percentage: 50 },
        { category: 'Medicamentos', amount: 37500, percentage: 15 },
        { category: 'Manutenção', amount: 25000, percentage: 10 },
        { category: 'Materiais', amount: 18750, percentage: 7.5 },
        { category: 'Serviços', amount: 31250, percentage: 12.5 },
        { category: 'Outros', amount: 15000, percentage: 5 }
      ],
      topExpenses: [
        {
          id: 'exp-1',
          establishmentId: establishmentId || 'est-1',
          category: 'Pessoal',
          description: 'Salários equipe médica',
          amount: 45000,
          date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
          paymentMethod: 'bank_transfer',
          status: 'paid',
          createdAt: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01T00:00:00Z`,
          updatedAt: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01T00:00:00Z`
        },
        {
          id: 'exp-2',
          establishmentId: establishmentId || 'est-1',
          category: 'Medicamentos',
          description: 'Compra de antibióticos',
          amount: 12500,
          date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
          paymentMethod: 'credit_card',
          status: 'approved',
          createdAt: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15T00:00:00Z`,
          updatedAt: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15T00:00:00Z`
        }
      ],
      alerts: [
        {
          type: 'warning',
          message: 'Orçamento de medicamentos próximo do limite',
          category: 'Medicamentos'
        },
        {
          type: 'danger',
          message: 'Orçamento de manutenção excedido em 15%',
          category: 'Manutenção'
        }
      ]
    };
  }

  private getMockBudget(data: BudgetCreateData): Budget {
    const id = `budget-mock-${Date.now()}`;
    return {
      id,
      establishmentId: data.establishmentId,
      year: data.year,
      month: data.month,
      category: data.category,
      plannedAmount: data.plannedAmount,
      spentAmount: 0,
      remainingAmount: data.plannedAmount,
      status: 'on_track',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private getMockBudgets(filters: BudgetFilters = {}): BudgetListResponse {
    const mockBudgets: Budget[] = [
      {
        id: 'budget-1',
        establishmentId: 'est-1',
        year: 2024,
        month: 12,
        category: 'Pessoal',
        plannedAmount: 125000,
        spentAmount: 118000,
        remainingAmount: 7000,
        status: 'on_track',
        createdAt: '2024-12-01T00:00:00Z',
        updatedAt: '2024-12-01T00:00:00Z'
      },
      {
        id: 'budget-2',
        establishmentId: 'est-1',
        year: 2024,
        month: 12,
        category: 'Medicamentos',
        plannedAmount: 25000,
        spentAmount: 18750,
        remainingAmount: 6250,
        status: 'on_track',
        createdAt: '2024-12-01T00:00:00Z',
        updatedAt: '2024-12-01T00:00:00Z'
      },
      {
        id: 'budget-3',
        establishmentId: 'est-1',
        year: 2024,
        month: 12,
        category: 'Manutenção',
        plannedAmount: 15000,
        spentAmount: 17250,
        remainingAmount: -2250,
        status: 'over_budget',
        createdAt: '2024-12-01T00:00:00Z',
        updatedAt: '2024-12-01T00:00:00Z'
      }
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let filteredBudgets = mockBudgets;

    // Aplicar filtros
    if (filters.year) {
      filteredBudgets = filteredBudgets.filter(b => b.year === filters.year);
    }

    if (filters.month) {
      filteredBudgets = filteredBudgets.filter(b => b.month === filters.month);
    }

    if (filters.category) {
      filteredBudgets = filteredBudgets.filter(b => b.category === filters.category);
    }

    if (filters.status) {
      filteredBudgets = filteredBudgets.filter(b => b.status === filters.status);
    }

    const total = filteredBudgets.length;
    const paginatedBudgets = filteredBudgets.slice(offset, offset + limit);

    return {
      budgets: paginatedBudgets,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  private getMockExpense(data: ExpenseCreateData): Expense {
    const id = `expense-mock-${Date.now()}`;
    return {
      id,
      establishmentId: data.establishmentId,
      category: data.category,
      description: data.description,
      amount: data.amount,
      date: data.date,
      paymentMethod: data.paymentMethod,
      supplier: data.supplier,
      invoiceNumber: data.invoiceNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private getMockExpenses(filters: ExpenseFilters = {}): ExpenseListResponse {
    const mockExpenses: Expense[] = [
      {
        id: 'exp-1',
        establishmentId: 'est-1',
        category: 'Medicamentos',
        description: 'Compra de analgésicos',
        amount: 2500,
        date: '2024-12-14',
        paymentMethod: 'credit_card',
        supplier: 'Farmácia Central',
        invoiceNumber: 'NF001234',
        status: 'approved',
        createdAt: '2024-12-14T10:00:00Z',
        updatedAt: '2024-12-14T10:00:00Z'
      },
      {
        id: 'exp-2',
        establishmentId: 'est-1',
        category: 'Manutenção',
        description: 'Reparo de ar condicionado',
        amount: 1800,
        date: '2024-12-13',
        paymentMethod: 'bank_transfer',
        supplier: 'Manutenção Técnica Ltda',
        invoiceNumber: 'OS00456',
        status: 'paid',
        approvedBy: 'admin-1',
        approvedAt: '2024-12-13T14:00:00Z',
        createdAt: '2024-12-13T09:00:00Z',
        updatedAt: '2024-12-13T14:00:00Z'
      },
      {
        id: 'exp-3',
        establishmentId: 'est-1',
        category: 'Pessoal',
        description: 'Horas extras equipe de enfermagem',
        amount: 3200,
        date: '2024-12-12',
        paymentMethod: 'bank_transfer',
        status: 'pending',
        createdAt: '2024-12-12T16:00:00Z',
        updatedAt: '2024-12-12T16:00:00Z'
      },
      {
        id: 'exp-4',
        establishmentId: 'est-1',
        category: 'Materiais',
        description: 'Compra de luvas e máscaras',
        amount: 950,
        date: '2024-12-11',
        paymentMethod: 'debit_card',
        supplier: 'Materiais Médicos S.A.',
        invoiceNumber: 'NF005678',
        status: 'approved',
        approvedBy: 'admin-1',
        approvedAt: '2024-12-11T11:00:00Z',
        createdAt: '2024-12-11T10:00:00Z',
        updatedAt: '2024-12-11T11:00:00Z'
      }
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let filteredExpenses = mockExpenses;

    // Aplicar filtros
    if (filters.category) {
      filteredExpenses = filteredExpenses.filter(e => e.category === filters.category);
    }

    if (filters.status) {
      filteredExpenses = filteredExpenses.filter(e => e.status === filters.status);
    }

    if (filters.paymentMethod) {
      filteredExpenses = filteredExpenses.filter(e => e.paymentMethod === filters.paymentMethod);
    }

    if (filters.startDate) {
      filteredExpenses = filteredExpenses.filter(e => e.date >= filters.startDate!);
    }

    if (filters.endDate) {
      filteredExpenses = filteredExpenses.filter(e => e.date <= filters.endDate!);
    }

    const total = filteredExpenses.length;
    const paginatedExpenses = filteredExpenses.slice(offset, offset + limit);

    return {
      expenses: paginatedExpenses,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  private getMockExpenseById(id: string): Expense {
    const expenses = this.getMockExpenses().expenses;
    const expense = expenses.find(e => e.id === id);

    if (expense) {
      return expense;
    }

    return expenses[0];
  }

  private getMockExpenseCategories() {
    return [
      { value: 'pessoal', label: 'Pessoal' },
      { value: 'medicamentos', label: 'Medicamentos' },
      { value: 'manutencao', label: 'Manutenção' },
      { value: 'materiais', label: 'Materiais' },
      { value: 'servicos', label: 'Serviços' },
      { value: 'equipamentos', label: 'Equipamentos' },
      { value: 'consultorias', label: 'Consultorias' },
      { value: 'outros', label: 'Outros' }
    ];
  }
}

export const financialService = new FinancialService();
export default financialService;

