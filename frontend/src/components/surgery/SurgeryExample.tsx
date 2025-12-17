import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { SurgeryCenterPage } from '@/pages/surgery/SurgeryCenterPage';

/**
 * Componente de exemplo que demonstra o sistema completo de centro cirúrgico
 * Este componente pode ser usado para apresentar e testar o sistema
 */
const SurgeryExample: React.FC = () => {
  const [showFullSystem, setShowFullSystem] = useState(false);

  if (showFullSystem) {
    return <SurgeryCenterPage />;
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
            <span className="text-2xl">🏥</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Centro Cirúrgico Digital
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Sistema completo para gestão cirúrgica, controle de salas,
            equipe multidisciplinar e protocolos de segurança
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-medical-blue text-2xl mb-2">📅</div>
            <h4 className="font-semibold text-white mb-2">Agendamento Inteligente</h4>
            <p className="text-white/70 text-sm">
              Sistema avançado de agendamento com validação automática e otimização de recursos
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-green-400 text-2xl mb-2">🏥</div>
            <h4 className="font-semibold text-white mb-2">Controle de Salas</h4>
            <p className="text-white/70 text-sm">
              Monitoramento em tempo real, manutenção preventiva e gestão de equipamentos
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-blue-400 text-2xl mb-2">👥</div>
            <h4 className="font-semibold text-white mb-2">Equipe Multidisciplinar</h4>
            <p className="text-white/70 text-sm">
              Coordenação completa de cirurgiões, anestesistas, enfermeiros e equipe de apoio
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-purple-400 text-2xl mb-2">📋</div>
            <h4 className="font-semibold text-white mb-2">Protocolos de Segurança</h4>
            <p className="text-white/70 text-sm">
              Checklists padronizados, controle de qualidade e auditoria automática
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-yellow-400 text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-white mb-2">Analytics Avançado</h4>
            <p className="text-white/70 text-sm">
              Relatórios de performance, custos, qualidade e indicadores de eficiência
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-red-400 text-2xl mb-2">🔒</div>
            <h4 className="font-semibold text-white mb-2">Compliance Total</h4>
            <p className="text-white/70 text-sm">
              Controle rigoroso de regulamentações, certificações e acreditação hospitalar
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
                  <p className="text-white font-medium">Dashboard Executivo</p>
                  <p className="text-white/60 text-sm">Visão geral e controle em tempo real</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                  <span className="text-green-400 text-sm font-bold">A</span>
                </div>
                <div>
                  <p className="text-white font-medium">Agendamento</p>
                  <p className="text-white/60 text-sm">Sistema inteligente de marcação</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-bold">S</span>
                </div>
                <div>
                  <p className="text-white font-medium">Salas Cirúrgicas</p>
                  <p className="text-white/60 text-sm">Controle completo de ambientes</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                  <span className="text-purple-400 text-sm font-bold">E</span>
                </div>
                <div>
                  <p className="text-white font-medium">Equipe</p>
                  <p className="text-white/60 text-sm">Gestão multidisciplinar</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-yellow-500/20 rounded flex items-center justify-center">
                  <span className="text-yellow-400 text-sm font-bold">R</span>
                </div>
                <div>
                  <p className="text-white font-medium">Relatórios</p>
                  <p className="text-white/60 text-sm">Analytics e indicadores</p>
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
                  <strong>Redução de erros:</strong> Validações automáticas e protocolos padronizados
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Eficiência operacional:</strong> Otimização de recursos e redução de tempos mortos
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Segurança do paciente:</strong> Checklists obrigatórios e controle de qualidade
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Gestão estratégica:</strong> Dados em tempo real para tomada de decisões
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Compliance regulatório:</strong> Aderência total às normas e certificações
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
              <h4 className="font-semibold text-white mb-2">Cirurgias Hoje</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Total agendadas:</span>
                  <span className="text-white">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Em andamento:</span>
                  <span className="text-yellow-400">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Concluídas:</span>
                  <span className="text-green-400">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Canceladas:</span>
                  <span className="text-red-400">1</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Salas Cirúrgicas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Total de salas:</span>
                  <span className="text-white">6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Disponíveis:</span>
                  <span className="text-green-400">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Ocupadas:</span>
                  <span className="text-red-400">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Em manutenção:</span>
                  <span className="text-yellow-400">1</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Equipe Disponível</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Cirurgiões:</span>
                  <span className="text-blue-400">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Anestesistas:</span>
                  <span className="text-purple-400">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Enfermeiros:</span>
                  <span className="text-green-400">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Utilização média:</span>
                  <span className="text-white">78.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Preview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Fluxo Cirúrgico</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">Pré-Operatório</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Avaliação anestésica</li>
                <li>• Exames laboratoriais</li>
                <li>• Consentimento informado</li>
                <li>• Preparo do paciente</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-2">Intra-Operatório</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Checklist de segurança</li>
                <li>• Monitoramento contínuo</li>
                <li>• Controle de materiais</li>
                <li>• Registro em tempo real</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Pós-Operatório</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Recuperação imediata</li>
                <li>• Controle da dor</li>
                <li>• Acompanhamento</li>
                <li>• Alta hospitalar</li>
              </ul>
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
            🚀 Experimentar Centro Cirúrgico
          </GlassButton>

          <GlassButton
            onClick={() => window.open('/docs/centro-cirurgico', '_blank')}
            variant="secondary"
            className="px-8 py-3"
          >
            📚 Ver Documentação Completa
          </GlassButton>
        </div>

        {/* Technical Info */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg">
          <h4 className="font-semibold text-white mb-2">💻 Implementação Técnica</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-white/60">Arquivos criados:</p>
              <p className="text-white font-mono">6 componentes</p>
            </div>
            <div>
              <p className="text-white/60">Linhas de código:</p>
              <p className="text-white font-mono">~1800+</p>
            </div>
            <div>
              <p className="text-white/60">Interfaces TypeScript:</p>
              <p className="text-white font-mono">20+ tipos</p>
            </div>
            <div>
              <p className="text-white/60">Funcionalidades:</p>
              <p className="text-white font-mono">15+ módulos</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default SurgeryExample;









