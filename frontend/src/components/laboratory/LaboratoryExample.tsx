import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { LaboratoryCenterPage } from '@/pages/laboratory/LaboratoryCenterPage';

/**
 * Componente de exemplo que demonstra o sistema completo de laboratório clínico
 * Este componente pode ser usado para apresentar e testar o sistema
 */
const LaboratoryExample: React.FC = () => {
  const [showFullSystem, setShowFullSystem] = useState(false);

  if (showFullSystem) {
    return <LaboratoryCenterPage />;
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
            <span className="text-2xl">🧪</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Laboratório Clínico Digital
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Sistema completo para gestão laboratorial, controle de qualidade,
            equipamentos automatizados e integração LIS/PACS
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-medical-blue text-2xl mb-2">📋</div>
            <h4 className="font-semibold text-white mb-2">Solicitações Inteligentes</h4>
            <p className="text-white/70 text-sm">
              Validação automática e roteamento inteligente de pedidos médicos
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-green-400 text-2xl mb-2">🔬</div>
            <h4 className="font-semibold text-white mb-2">Processamento Automatizado</h4>
            <p className="text-white/70 text-sm">
              Controle completo do ciclo analítico com equipamentos conectados
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-blue-400 text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-white mb-2">Resultados Estruturados</h4>
            <p className="text-white/70 text-sm">
              Validação automática, interpretação e liberação de laudos
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-purple-400 text-2xl mb-2">🎯</div>
            <h4 className="font-semibold text-white mb-2">Controle de Qualidade</h4>
            <p className="text-white/70 text-sm">
              Monitoramento rigoroso e acreditação laboratorial completa
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-yellow-400 text-2xl mb-2">⚙️</div>
            <h4 className="font-semibold text-white mb-2">Gestão de Equipamentos</h4>
            <p className="text-white/70 text-sm">
              Monitoramento, manutenção e calibração automatizada
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-red-400 text-2xl mb-2">🔗</div>
            <h4 className="font-semibold text-white mb-2">Integração LIS/PACS</h4>
            <p className="text-white/70 text-sm">
              Conectividade completa com sistemas hospitalares externos
            </p>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Especialidades Laboratoriais</h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-bold">B</span>
                </div>
                <div>
                  <p className="text-white font-medium">Bioquímica</p>
                  <p className="text-white/60 text-sm">Glicídios, lipídios, enzimas, marcadores cardíacos</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center">
                  <span className="text-red-400 text-sm font-bold">H</span>
                </div>
                <div>
                  <p className="text-white font-medium">Hematologia</p>
                  <p className="text-white/60 text-sm">Hemograma, coagulograma, anemias, inflamação</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                  <span className="text-purple-400 text-sm font-bold">I</span>
                </div>
                <div>
                  <p className="text-white font-medium">Imunologia</p>
                  <p className="text-white/60 text-sm">Hormônios, marcadores tumorais, auto-anticorpos</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                  <span className="text-green-400 text-sm font-bold">M</span>
                </div>
                <div>
                  <p className="text-white font-medium">Microbiologia</p>
                  <p className="text-white/60 text-sm">Hemoculturas, uroculturas, antibiograma</p>
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
                  <strong>Resultados Confiáveis:</strong> Controle rigoroso de qualidade e validação automática
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Eficiência Operacional:</strong> Automação completa e processamento paralelo
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Segurança do Paciente:</strong> Identificação positiva e controle de contaminação
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Gestão Estratégica:</strong> Analytics em tempo real para tomada de decisões
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Compliance Total:</strong> Aderência às normas ANVISA e internacionais
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
              <h4 className="font-semibold text-white mb-2">Pedidos Hoje</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Total solicitados:</span>
                  <span className="text-white">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Em processamento:</span>
                  <span className="text-yellow-400">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Concluídos:</span>
                  <span className="text-green-400">145</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Urgentes:</span>
                  <span className="text-red-400">23</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Equipamentos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Operacionais:</span>
                  <span className="text-green-400">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Em manutenção:</span>
                  <span className="text-yellow-400">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Quebrados:</span>
                  <span className="text-red-400">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Utilização média:</span>
                  <span className="text-white">78.3%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Qualidade</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Controles aprovados:</span>
                  <span className="text-green-400">99.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Amostras rejeitadas:</span>
                  <span className="text-red-400">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Valores críticos:</span>
                  <span className="text-orange-400">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Tempo médio:</span>
                  <span className="text-blue-400">2.1h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Preview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Workflow Laboratorial</h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">1. Solicitação</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Recebimento</li>
                <li>• Validação</li>
                <li>• Triagem</li>
                <li>• Priorização</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-lg">
              <h4 className="font-semibold text-cyan-400 mb-2">2. Coleta</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Identificação</li>
                <li>• Preparação</li>
                <li>• Centrifugação</li>
                <li>• Alíquotas</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-2">3. Análise</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Automação</li>
                <li>• Controle QC</li>
                <li>• Validação</li>
                <li>• Repetição</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">4. Laudo</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Interpretação</li>
                <li>• Validação</li>
                <li>• Liberação</li>
                <li>• Distribuição</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">5. Arquivo</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Armazenamento</li>
                <li>• Backup</li>
                <li>• Auditoria</li>
                <li>• Retenção</li>
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
            🚀 Experimentar Laboratório Clínico
          </GlassButton>

          <GlassButton
            onClick={() => window.open('/docs/laboratorio-clinico', '_blank')}
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
              <p className="text-white font-mono">4 componentes</p>
            </div>
            <div>
              <p className="text-white/60">Linhas de código:</p>
              <p className="text-white font-mono">~1400+</p>
            </div>
            <div>
              <p className="text-white/60">Interfaces TypeScript:</p>
              <p className="text-white font-mono">30+ tipos</p>
            </div>
            <div>
              <p className="text-white/60">Especialidades:</p>
              <p className="text-white font-mono">5 suportadas</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default LaboratoryExample;









