// Tipos para Dashboard Diretor Local
export interface DirectorLocalMetrics {
  totalEstablishments: number;
  totalPatients: number;
  monthlyAttendances: number;
  monthlyRevenue: number;
  occupancyRate: number;
  satisfactionRate: number;
  pendingReports: number;
  completedReports: number;
  criticalAlerts: number;
  resolvedAlerts: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface Activity {
  id: string;
  type: 'patient' | 'attendance' | 'prescription' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  priority?: 'low' | 'Medium' | 'High' | 'low' | 'medium' | 'high';
}

export interface EstablishmentSummary {
  id: string;
  name: string;
  type: 'UBS' | 'UPA' | 'Hospital' | 'Clínica';
  totalPatients: number;
  monthlyAttendances: number;
  occupancyRate: number;
  satisfactionRate: number;
  pendingAlerts: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface PerformanceIndicator {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface BudgetInfo {
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  percentageUsed: number;
  monthlyAverage: number;
  projectedAnnual: number;
}