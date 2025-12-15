import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { PharmacyPage } from '@/pages/pharmacy/PharmacyPage';

/**
 * Componente de exemplo que demonstra o sistema completo de farmácia
 * Este componente pode ser usado para apresentar e testar o sistema
 */
const PharmacyExample: React.FC = () => {
  const [showFullSystem, setShowFullSystem] = useState(false);

  if (showFullSystem) {
    return <PharmacyPage />;
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-medical-blue/20 rounded-full mb-4">
            <span className="text-2xl">💊</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Sistema de Gestão da Farmácia
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Sistema completo para controle de estoque, dispensação de medicamentos,
            alertas automáticos e relatórios gerenciais
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-medical-blue text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-white mb-2">Dashboard Inteligente</h4>
            <p className="text-white/70 text-sm">
              Visão geral completa com KPIs, alertas críticos e métricas em tempo real
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-green-400 text-2xl mb-2">📦</div>
            <h4 className="font-semibold text-white mb-2">Controle de Estoque</h4>
            <p className="text-white/70 text-sm">
              Gestão automática de entrada/saída, alertas de reposição e controle de validade
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-blue-400 text-2xl mb-2">👥</div>
            <h4 className="font-semibold text-white mb-2">Dispensação Segura</h4>
            <p className="text-white/70 text-sm">
              Sistema completo de dispensação com validação de prescrição e controle de estoque
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-purple-400 text-2xl mb-2">🚨</div>
            <h4 className="font-semibold text-white mb-2">Alertas Automáticos</h4>
            <p className="text-white/70 text-sm">
              Notificações inteligentes de estoque baixo, vencimento próximo e anomalias
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-yellow-400 text-2xl mb-2">📈</div>
            <h4 className="font-semibold text-white mb-2">Relatórios Avançados</h4>
            <p className="text-white/70 text-sm">
              Análises de consumo, financeiro, tendências e relatórios regulatórios
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-red-400 text-2xl mb-2">🔒</div>
            <h4 className="font-semibold text-white mb-2">Compliance Total</h4>
            <p className="text-white/70 text-sm">
              Controle rigoroso de medicamentos controlados e prescrição obrigatória
            </p>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Módulos do Sistema</h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-medical-blue/20 rounded flex items-center justify-center">
                  <span className="text-medical-blue text-sm font-bold">D</span>
                </div>
                <div>
                  <p className="text-white font-medium">Dashboard</p>
                  <p className="text-white/60 text-sm">Visão geral e alertas</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                  <span className="text-green-400 text-sm font-bold">E</span>
                </div>
                <div>
                  <p className="text-white font-medium">Estoque</p>
                  <p className="text-white/60 text-sm">Controle de medicamentos</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-bold">P</span>
                </div>
                <div>
                  <p className="text-white font-medium">Dispensação</p>
                  <p className="text-white/60 text-sm">Saída para pacientes</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                  <span className="text-purple-400 text-sm font-bold">R</span>
                </div>
                <div>
                  <p className="text-white font-medium">Relatórios</p>
                  <p className="text-white/60 text-sm">Análises e estatísticas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Benefícios</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Redução de erros:</strong> Validações automáticas e alertas preventivos
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Eficiência operacional:</strong> Automação de processos repetitivos
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Compliance regulatório:</strong> Controle rigoroso de medicamentos especiais
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Tomada de decisão:</strong> Relatórios e análises para gestão estratégica
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Segurança:</strong> Controle de acesso e auditoria completa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Data Preview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Dados de Exemplo</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Medicamentos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Total cadastrados:</span>
                  <span className="text-white">245</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Ativos:</span>
                  <span className="text-green-400">223</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Controlados:</span>
                  <span className="text-red-400">15</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Estoque</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Valor total:</span>
                  <span className="text-white">R$ 45.230,50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Estoque baixo:</span>
                  <span className="text-yellow-400">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Vencendo:</span>
                  <span className="text-orange-400">12</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Atividade</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Movimentações hoje:</span>
                  <span className="text-white">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Dispensações hoje:</span>
                  <span className="text-blue-400">28</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Alertas ativos:</span>
                  <span className="text-red-400">26</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <GlassButton
            onClick={() => setShowFullSystem(true)}
            variant="primary"
            className="px-8 py-3"
          >
            🚀 Experimentar Sistema Completo
          </GlassButton>

          <GlassButton
            onClick={() => window.open('/docs/farmacia', '_blank')}
            variant="secondary"
            className="px-8 py-3"
          >
            📚 Ver Documentação
          </GlassButton>
        </div>

        {/* Technical Info */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg">
          <h4 className="font-semibold text-white mb-2">💻 Implementação Técnica</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-white/60">Arquivos criados:</p>
              <p className="text-white font-mono">8 componentes</p>
            </div>
            <div>
              <p className="text-white/60">Linhas de código:</p>
              <p className="text-white font-mono">~2000+</p>
            </div>
            <div>
              <p className="text-white/60">Hooks customizados:</p>
              <p className="text-white font-mono">1</p>
            </div>
            <div>
              <p className="text-white/60">Tipos TypeScript:</p>
              <p className="text-white font-mono">15+ interfaces</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default PharmacyExample;







