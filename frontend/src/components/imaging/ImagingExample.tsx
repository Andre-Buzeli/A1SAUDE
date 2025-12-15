import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import ImagingCenterPage from '@/pages/imaging/ImagingCenterPage';

/**
 * Componente de exemplo que demonstra o sistema completo de exames de imagem
 * Este componente pode ser usado para apresentar e testar o sistema
 */
const ImagingExample: React.FC = () => {
  const [showFullSystem, setShowFullSystem] = useState(false);

  if (showFullSystem) {
    return <ImagingCenterPage />;
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
            <span className="text-2xl">🩻</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Centro de Imagem Digital
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Sistema completo para gestão de exames de imagem, PACS integrado,
            laudos estruturados e controle de qualidade radiológica
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-medical-blue text-2xl mb-2">📋</div>
            <h4 className="font-semibold text-white mb-2">Solicitações Inteligentes</h4>
            <p className="text-white/70 text-sm">
              Validação automática de indicações clínicas e contraindicações
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-green-400 text-2xl mb-2">📅</div>
            <h4 className="font-semibold text-white mb-2">Agendamento Otimizado</h4>
            <p className="text-white/70 text-sm">
              Alocação automática de recursos e priorização inteligente
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-blue-400 text-2xl mb-2">🖼️</div>
            <h4 className="font-semibold text-white mb-2">PACS Integrado</h4>
            <p className="text-white/70 text-sm">
              Armazenamento e visualização DICOM com ferramentas avançadas
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-purple-400 text-2xl mb-2">📝</div>
            <h4 className="font-semibold text-white mb-2">Laudos Estruturados</h4>
            <p className="text-white/70 text-sm">
              Templates inteligentes com dados padronizados para pesquisa
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-yellow-400 text-2xl mb-2">✅</div>
            <h4 className="font-semibold text-white mb-2">Controle de Qualidade</h4>
            <p className="text-white/70 text-sm">
              Monitoramento automático de parâmetros técnicos e doses
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-red-400 text-2xl mb-2">🔬</div>
            <h4 className="font-semibold text-white mb-2">Analytics Avançado</h4>
            <p className="text-white/70 text-sm">
              Indicadores de performance, qualidade e produtividade
            </p>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Modalidades Suportadas</h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-bold">RX</span>
                </div>
                <div>
                  <p className="text-white font-medium">Radiografia Convencional</p>
                  <p className="text-white/60 text-sm">Raio-X, Mamografia, Densitometria</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                  <span className="text-green-400 text-sm font-bold">US</span>
                </div>
                <div>
                  <p className="text-white font-medium">Ultrassonografia</p>
                  <p className="text-white/60 text-sm">Doppler, Ecocardiograma, Musculoesquelético</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                  <span className="text-purple-400 text-sm font-bold">TC</span>
                </div>
                <div>
                  <p className="text-white font-medium">Tomografia Computadorizada</p>
                  <p className="text-white/60 text-sm">Angio-TC, Cardíaca, Neuro</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 bg-yellow-500/20 rounded flex items-center justify-center">
                  <span className="text-yellow-400 text-sm font-bold">RM</span>
                </div>
                <div>
                  <p className="text-white font-medium">Ressonância Magnética</p>
                  <p className="text-white/60 text-sm">Neuro, Musculoesquelético, Cardíaco</p>
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
                  <strong>Diagnóstico Preciso:</strong> Controle rigoroso de qualidade e protocolos padronizados
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Eficiência Operacional:</strong> Otimização automática de agendamento e recursos
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-white/80">
                  <strong>Segurança do Paciente:</strong> Controle de radiação e validação de contraindicações
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
              <h4 className="font-semibold text-white mb-2">Exames Hoje</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Total agendados:</span>
                  <span className="text-white">87</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Em andamento:</span>
                  <span className="text-yellow-400">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Concluídos:</span>
                  <span className="text-green-400">65</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Urgentes:</span>
                  <span className="text-red-400">8</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Equipamentos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Operacionais:</span>
                  <span className="text-green-400">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Manutenção:</span>
                  <span className="text-yellow-400">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Quebrados:</span>
                  <span className="text-red-400">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Utilização média:</span>
                  <span className="text-white">78.5%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Tempo médio de laudo:</span>
                  <span className="text-blue-400">2.5h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Taxa de repetição:</span>
                  <span className="text-green-400">3.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Laudos pendentes:</span>
                  <span className="text-red-400">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Achados críticos:</span>
                  <span className="text-red-400">5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Preview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Workflow de Exame</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">1. Solicitação</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Indicação clínica</li>
                <li>• Validação automática</li>
                <li>• Agendamento otimizado</li>
                <li>• Preparo do paciente</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-2">2. Execução</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Check-in do paciente</li>
                <li>• Controle de qualidade</li>
                <li>• Aquisição de imagens</li>
                <li>• Processamento automático</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">3. Laudo</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Interpretação estruturada</li>
                <li>• Templates inteligentes</li>
                <li>• Dados pesquisáveis</li>
                <li>• Revisão colaborativa</li>
              </ul>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">4. Distribuição</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Envio automático</li>
                <li>• Integração PACS</li>
                <li>• Alertas críticos</li>
                <li>• Auditoria completa</li>
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
            🚀 Experimentar Centro de Imagem
          </GlassButton>

          <GlassButton
            onClick={() => window.open('/docs/centro-imagem', '_blank')}
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
              <p className="text-white font-mono">~1500+</p>
            </div>
            <div>
              <p className="text-white/60">Interfaces TypeScript:</p>
              <p className="text-white font-mono">25+ tipos</p>
            </div>
            <div>
              <p className="text-white/60">Modalidades:</p>
              <p className="text-white font-mono">6 suportadas</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ImagingExample;
