import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPICard } from '@/components/common/KPICard';
import { ChartContainer } from '@/components/common/ChartContainer';
import { RecentActivities } from '@/components/common/RecentActivities';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface DirectorLocalDashboardProps {
  establishmentType: 'upa' | 'ubs' | 'hospital';
}

interface DashboardData {
  kpis: {
    totalPatients: number;
    monthlyAttendances: number;
    activeProfessionals: number;
    monthlyRevenue: number;
    occupancyRate: number;
    satisfactionScore: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'patient' | 'appointment' | 'prescription' | 'exam' | 'alert' | 'system';
    title: string;
    description: string;
    timestamp: string;
    user?: string;
    priority?: 'low' | 'medium' | 'high';
  }>;
  charts: {
    monthlyTrends: Array<{ month: string; attendances: number; revenue: number; patients: number; }>;
    departmentDistribution: Array<{ department: string; attendances: number; percentage: number; }>;
    professionalWorkload: Array<{ professional: string; attendances: number; satisfaction: number; }>;
  };
}

export const DirectorLocalDashboard: React.FC<DirectorLocalDashboardProps> = ({ establishmentType }) => {
  const [data, setData] = useState<DashboardData>({
    kpis: {
      totalPatients: 12543,
      monthlyAttendances: 2847,
      activeProfessionals: 89,
      monthlyRevenue: 456780,
      occupancyRate: 78,
      satisfactionScore: 4.2
    },
    recentActivities: [
      {
        id: '1',
        type: 'patient',
        title: 'Novo paciente registrado',
        description: 'João Silva - 45 anos, hipertensão',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        user: 'Dr. Carlos',
        priority: 'low'
      },
      {
        id: '2',
        type: 'alert',
        title: 'Taxa de ocupação alta',
        description: 'UTI com 95% de ocupação',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        priority: 'high'
      },
      {
        id: '3',
        type: 'appointment',
        title: 'Consulta cancelada',
        description: 'Dr. Maria - Paciente Ana Costa',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        user: 'Recepção',
        priority: 'medium'
      }
    ],
    charts: {
      monthlyTrends: [
        { month: 'Jan', attendances: 2450, revenue: 380000, patients: 1850 },
        { month: 'Fev', attendances: 2680, revenue: 420000, patients: 2100 },
        { month: 'Mar', attendances: 2847, revenue: 456780, patients: 2350 }
      ],
      departmentDistribution: [
        { department: 'Clínica Médica', attendances: 850, percentage: 30 },
        { department: 'Pediatria', attendances: 680, percentage: 24 },
        { department: 'Cirurgia', attendances: 570, percentage: 20 },
        { department: 'Ginecologia', attendances: 420, percentage: 15 },
        { department: 'Outros', attendances: 327, percentage: 11 }
      ],
      professionalWorkload: [
        { professional: 'Dr. Carlos', attendances: 156, satisfaction: 4.5 },
        { professional: 'Dra. Maria', attendances: 142, satisfaction: 4.3 },
        { professional: 'Dr. João', attendances: 138, satisfaction: 4.1 },
        { professional: 'Dra. Ana', attendances: 125, satisfaction: 4.4 }
      ]
    }
  });

  const [activeTab, setActiveTab] = useState('overview');

  const getEstablishmentSpecificData = () => {
    switch (establishmentType) {
      case 'upa':
        return {
          title: 'Dashboard Diretor Local - UPA',
          kpis: [
            { title: 'Atendimentos 24h', value: data.kpis.monthlyAttendances, icon: Activity, color: 'blue' },
            { title: 'Taxa Ocupação', value: `${data.kpis.occupancyRate}%`, icon: Users, color: 'orange' },
            { title: 'Tempo Médio', value: '45 min', icon: Clock, color: 'green' },
            { title: 'Classificação', value: data.kpis.satisfactionScore.toFixed(1), icon: CheckCircle, color: 'purple' }
          ]
        };
      case 'ubs':
        return {
          title: 'Dashboard Diretor Local - UBS',
          kpis: [
            { title: 'Pacientes Cadastrados', value: data.kpis.totalPatients, icon: Users, color: 'blue' },
            { title: 'Consultas Mês', value: data.kpis.monthlyAttendances, icon: Calendar, color: 'green' },
            { title: 'Equipe Ativa', value: data.kpis.activeProfessionals, icon: Users, color: 'purple' },
            { title: 'Satisfação', value: data.kpis.satisfactionScore.toFixed(1), icon: CheckCircle, color: 'orange' }
          ]
        };
      case 'hospital':
        return {
          title: 'Dashboard Diretor Local - Hospital',
          kpis: [
            { title: 'Pacientes Ativos', value: data.kpis.totalPatients, icon: Users, color: 'blue' },
            { title: 'Internações', value: 234, icon: FileText, color: 'green' },
            { title: 'Taxa Ocupação', value: `${data.kpis.occupancyRate}%`, icon: Users, color: 'orange' },
            { title: 'Receita Mês', value: `R$ ${(data.kpis.monthlyRevenue / 1000).toFixed(0)}k`, icon: DollarSign, color: 'purple' }
          ]
        };
      default:
        return {
          title: 'Dashboard Diretor Local',
          kpis: []
        };
    }
  };

  const establishmentData = getEstablishmentSpecificData();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{establishmentData.title}</h1>
          <p className="text-gray-600 mt-1">Visão estratégica e relatórios executivos</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sistema Operacional
          </Badge>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {establishmentData.kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color as any}
          />
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends Chart */}
            <ChartContainer title="Tendências Mensais" headerActions={<Button variant="ghost" size="sm">Ver Detalhes</Button>}>
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <LineChart className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">Gráfico de tendências será implementado</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Atendimentos: {data.kpis.monthlyAttendances} | Receita: R$ {data.kpis.monthlyRevenue.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </ChartContainer>

            {/* Department Distribution */}
            <ChartContainer title="Distribuição por Departamento" headerActions={<Button variant="ghost" size="sm">Ver Mais</Button>}>
              <div className="space-y-3">
                {data.charts.departmentDistribution.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium">{dept.department}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{dept.attendances}</span>
                      <Badge variant="outline" className="text-xs">{dept.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>

          {/* Recent Activities */}
          <RecentActivities 
            title="Atividades Recentes"
            activities={data.recentActivities}
            maxHeight="300px"
          />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Professional Workload */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Carga de Trabalho por Profissional</h3>
              <div className="space-y-4">
                {data.charts.professionalWorkload.map((prof, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{prof.professional}</p>
                      <p className="text-sm text-gray-600">{prof.attendances} atendimentos</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {prof.satisfaction.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Desempenho</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tempo Médio de Atendimento</span>
                  <Badge variant="outline">45 min</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taxa de No-show</span>
                  <Badge variant="outline">12%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Satisfação do Paciente</span>
                  <Badge className="bg-green-100 text-green-800">4.2/5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taxa de Ocupação</span>
                  <Badge className="bg-orange-100 text-orange-800">{data.kpis.occupancyRate}%</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Resource Allocation */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Alocação de Recursos</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Profissionais Ativos</span>
                  <Badge>{data.kpis.activeProfessionals}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Leitos Disponíveis</span>
                  <Badge variant="outline">45/60</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Equipamentos</span>
                  <Badge variant="outline">98%</Badge>
                </div>
              </div>
            </Card>

            {/* Alerts */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-800">Estoque Baixo</p>
                    <p className="text-sm text-red-600">Medicamentos essenciais</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-yellow-800">Manutenção Pendente</p>
                    <p className="text-sm text-yellow-600">Equipamento de raios-X</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Gerenciar Equipe
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Reunião
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Solicitar Relatório
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Relatórios Executivos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatório Mensal de Atendimentos
              </Button>
              <Button variant="outline" className="justify-start">
                <PieChart className="w-4 h-4 mr-2" />
                Análise de Desempenho por Departamento
              </Button>
              <Button variant="outline" className="justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Indicadores de Qualidade
              </Button>
              <Button variant="outline" className="justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Relatório Financeiro
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DirectorLocalDashboard;