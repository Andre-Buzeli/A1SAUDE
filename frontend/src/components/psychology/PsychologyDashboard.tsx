import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Users, Calendar, FileText, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { psychologyDashboardService } from '@/services/psychologyDashboardService';
import { KPICard } from '@/components/common/KPICard';
import { ChartContainer } from '@/components/common/ChartContainer';
import { RecentActivities } from '@/components/common/RecentActivities';

interface PsychologyDashboardData {
  totalPatients: number;
  activeConsultations: number;
  pendingEvaluations: number;
  completedSessions: number;
  monthlySessions: number;
  weeklySessions: number;
  mentalHealthAlerts: number;
  avgSessionDuration: number;
  patientSatisfaction: number;
  establishmentType: 'hospital' | 'upa' | 'ubs';
  specific: {
    // Hospital specific
    psychiatricEmergencies?: number;
    groupTherapySessions?: number;
    medicationAdherence?: number;
    // UPA specific
    suicideRiskCases?: number;
    crisisInterventions?: number;
    emergencyConsultations?: number;
    // UBS specific
    familyTherapySessions?: number;
    communityMentalHealth?: number;
    preventionPrograms?: number;
  };
}

export const PsychologyDashboard: React.FC<{ establishmentType: 'hospital' | 'upa' | 'ubs' }> = ({ establishmentType }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<PsychologyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [establishmentType]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await psychologyDashboardService.getDashboard(establishmentType);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading psychology dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Psicólogo
          </h1>
          <Badge variant="outline" className="capitalize">
            {establishmentType}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Erro ao carregar dados do dashboard
            </p>
            <Button onClick={loadDashboardData} className="mt-4">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderSpecificKPIs = () => {
    const { specific } = dashboardData;
    
    switch (establishmentType) {
      case 'hospital':
        return (
          <>
            <KPICard 
              title="Emergências Psiquiátricas" 
              value={specific.psychiatricEmergencies || 0} 
              icon={AlertTriangle}
              color="text-red-600"
            />
            <KPICard 
              title="Sessões de Grupo" 
              value={specific.groupTherapySessions || 0} 
              icon={Users}
              color="text-blue-600"
            />
            <KPICard 
              title="Adesão à Medicação" 
              value={`${specific.medicationAdherence || 0}%`} 
              icon={CheckCircle}
              color="text-green-600"
            />
          </>
        );
      case 'upa':
        return (
          <>
            <KPICard 
              title="Casos de Risco Suicida" 
              value={specific.suicideRiskCases || 0} 
              icon={AlertCircle}
              color="text-red-600"
            />
            <KPICard 
              title="Intervenções de Crise" 
              value={specific.crisisInterventions || 0} 
              icon={AlertTriangle}
              color="text-orange-600"
            />
            <KPICard 
              title="Consultas Emergenciais" 
              value={specific.emergencyConsultations || 0} 
              icon={Clock}
              color="text-blue-600"
            />
          </>
        );
      case 'ubs':
        return (
          <>
            <KPICard 
              title="Terapia Familiar" 
              value={specific.familyTherapySessions || 0} 
              icon={Users}
              color="text-purple-600"
            />
            <KPICard 
              title="Saúde Mental Comunitária" 
              value={specific.communityMentalHealth || 0} 
              icon={TrendingUp}
              color="text-green-600"
            />
            <KPICard 
              title="Programas de Prevenção" 
              value={specific.preventionPrograms || 0} 
              icon={CheckCircle}
              color="text-blue-600"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Psicólogo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Bem-vindo, Dr. {user?.name}
          </p>
        </div>
        <Badge variant="outline" className="capitalize">
          {establishmentType}
        </Badge>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total de Pacientes" 
          value={dashboardData.totalPatients} 
          icon={Users}
          color="text-blue-600"
        />
        <KPICard 
          title="Consultas Ativas" 
          value={dashboardData.activeConsultations} 
          icon={Calendar}
          color="text-green-600"
        />
        <KPICard 
          title="Avaliações Pendentes" 
          value={dashboardData.pendingEvaluations} 
          icon={FileText}
          color="text-orange-600"
        />
        <KPICard 
          title="Alertas de Saúde Mental" 
          value={dashboardData.mentalHealthAlerts} 
          icon={AlertCircle}
          color="text-red-600"
        />
      </div>

      {/* Specific KPIs by Establishment Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderSpecificKPIs()}
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Sessões por Mês">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{dashboardData.monthlySessions}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sessões este mês</div>
                </div>
              </div>
            </ChartContainer>

            <ChartContainer title="Satisfação dos Pacientes">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{dashboardData.patientSatisfaction}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de satisfação</div>
                  <Progress value={dashboardData.patientSatisfaction} className="mt-2" />
                </div>
              </div>
            </ChartContainer>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de Sessões</CardTitle>
              <CardDescription>Duração média e completude das sessões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.avgSessionDuration}min</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Duração Média</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{dashboardData.completedSessions}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sessões Completadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{dashboardData.weeklySessions}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sessões esta Semana</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessões Recentes</CardTitle>
              <CardDescription>Últimas sessões de psicoterapia realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">Paciente {i + 1}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Sessão de {i % 2 === 0 ? 'Terapia Cognitivo-Comportamental' : 'Avaliação Psicológica'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{45 + i * 5} min</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-sm">Paciente {i + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sessões:</span>
                      <span className="font-medium">{8 + i * 2}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Última sessão:</span>
                      <span className="font-medium">{i + 1} dias</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progresso:</span>
                      <span className="font-medium">{70 + i * 5}%</span>
                    </div>
                  </div>
                  <Progress value={70 + i * 5} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avaliações Pendentes</CardTitle>
              <CardDescription>Avaliações psicológicas que necessitam de atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(dashboardData.pendingEvaluations)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-medium">Avaliação Psicológica #{i + 1}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Solicitada há {i + 1} dias
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Realizar Avaliação
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activities */}
      <RecentActivities 
        title="Atividades Recentes"
        activities={[
          'Nova consulta agendada - Paciente Maria Silva',
          'Avaliação psicológica concluída - Paciente João Santos',
          'Sessão de terapia em grupo realizada',
          'Alerta de saúde mental atendido - Paciente Ana Costa',
          'Relatório mensal de atividades gerado'
        ]}
      />
    </div>
  );
};