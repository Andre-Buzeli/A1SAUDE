import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { BedMapVisualizer } from './index';

// Exemplo de dados para demonstração
const mockBedMapData = {
  units: {
    'Enfermaria Geral': [
      {
        id: '1',
        number: '101',
        type: 'standard',
        status: 'occupied',
        unit: 'Enfermaria Geral',
        patient: {
          id: 'p1',
          name: 'João Silva Santos',
          admissionDate: '2024-01-15'
        }
      },
      {
        id: '2',
        number: '102',
        type: 'standard',
        status: 'available',
        unit: 'Enfermaria Geral'
      },
      {
        id: '3',
        number: '103',
        type: 'standard',
        status: 'maintenance',
        unit: 'Enfermaria Geral'
      },
      {
        id: '4',
        number: '104',
        type: 'standard',
        status: 'cleaning',
        unit: 'Enfermaria Geral'
      }
    ],
    'UTI': [
      {
        id: '5',
        number: '201',
        type: 'icu',
        status: 'occupied',
        unit: 'UTI',
        patient: {
          id: 'p2',
          name: 'Maria Santos Silva',
          admissionDate: '2024-01-14'
        }
      },
      {
        id: '6',
        number: '202',
        type: 'icu',
        status: 'occupied',
        unit: 'UTI',
        patient: {
          id: 'p3',
          name: 'Pedro Oliveira Costa',
          admissionDate: '2024-01-13'
        }
      },
      {
        id: '7',
        number: '203',
        type: 'icu',
        status: 'available',
        unit: 'UTI'
      }
    ],
    'Centro Cirúrgico': [
      {
        id: '8',
        number: 'Sala 1',
        type: 'surgery',
        status: 'available',
        unit: 'Centro Cirúrgico'
      },
      {
        id: '9',
        number: 'Sala 2',
        type: 'surgery',
        status: 'maintenance',
        unit: 'Centro Cirúrgico'
      },
      {
        id: '10',
        number: 'Sala 3',
        type: 'surgery',
        status: 'occupied',
        unit: 'Centro Cirúrgico',
        patient: {
          id: 'p4',
          name: 'Ana Costa Pereira',
          admissionDate: '2024-01-16'
        }
      }
    ]
  },
  totalBeds: 10,
  availableBeds: 3,
  occupiedBeds: 4,
  maintenanceBeds: 2,
  cleaningBeds: 1
};

/**
 * Componente de exemplo que demonstra como usar o sistema de mapa de leitos
 * Este componente pode ser usado para testar e apresentar o sistema
 */
const BedMapExample: React.FC = () => {
  const [bedMap] = useState(mockBedMapData);
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveLayout = async (layout: any) => {
    setIsLoading(true);

    // Simular chamada para API
    console.log('Salvando layout:', layout);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsLoading(false);
    alert('Layout salvo com sucesso! (simulado)');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Demonstração - Sistema de Mapa de Leitos
            </h2>
            <p className="text-white/70">
              Sistema completo para visualização e edição visual do mapa hospitalar
            </p>
          </div>

          <GlassButton onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? 'Atualizando...' : 'Atualizar Dados'}
          </GlassButton>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-white mb-2">📊 Visualização</h4>
            <p className="text-sm text-white/70">
              Dashboard em tempo real com estatísticas de ocupação
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-white mb-2">🎨 Editor Visual</h4>
            <p className="text-sm text-white/70">
              Interface intuitiva para editar layout dos leitos
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-white mb-2">🔧 Ferramentas</h4>
            <p className="text-sm text-white/70">
              Mover, adicionar, remover leitos e desenhar paredes
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <h4 className="font-semibold text-white mb-2">💾 Persistência</h4>
            <p className="text-sm text-white/70">
              Salvamento automático e controle de versões
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Bed Map Component */}
      <BedMapVisualizer
        bedMap={bedMap}
        loading={isLoading}
        selectedUnit={selectedUnit}
        onUnitChange={setSelectedUnit}
        onSaveLayout={handleSaveLayout}
      />

      {/* Usage Instructions */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Como Usar o Sistema
        </h3>

        <div className="space-y-4 text-sm text-white/80">
          <div>
            <h4 className="font-semibold text-white mb-2">🎯 Modo Visualização</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Use os filtros para visualizar unidades específicas</li>
              <li>Clique nos cards de estatísticas para detalhes</li>
              <li>Monitore a ocupação em tempo real</li>
              <li>Cores indicam status: Verde (disponível), Vermelho (ocupado), etc.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">✏️ Modo Edição</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Clique em "Modo Edição" para ativar</li>
              <li>Use as ferramentas na barra superior</li>
              <li>Arraste leitos para reposicioná-los</li>
              <li>Desenhe paredes clicando e arrastando</li>
              <li>Adicione novos leitos clicando em áreas vazias</li>
              <li>Salve as alterações quando terminar</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">🔧 Ferramentas Disponíveis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-white mb-1">Selecionar</h5>
                <p>Clique em leitos para ver/editar detalhes</p>
              </div>
              <div>
                <h5 className="font-medium text-white mb-1">Mover</h5>
                <p>Arraste leitos para reposicioná-los</p>
              </div>
              <div>
                <h5 className="font-medium text-white mb-1">Desenhar Parede</h5>
                <p>Clique e arraste para criar paredes</p>
              </div>
              <div>
                <h5 className="font-medium text-white mb-1">Adicionar Leito</h5>
                <p>Clique em áreas vazias para novos leitos</p>
              </div>
              <div>
                <h5 className="font-medium text-white mb-1">Apagar</h5>
                <p>Clique em leitos/paredes para remover</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Technical Details */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Detalhes Técnicos
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Arquivos Criados</h4>
            <div className="bg-white/5 p-3 rounded text-xs font-mono space-y-1">
              <div>📁 hooks/useBedMapEditor.ts</div>
              <div>📁 components/bed-map/BedMapEditor.tsx</div>
              <div>📁 components/bed-map/BedMapVisualizer.tsx</div>
              <div>📁 components/bed-map/README.md</div>
              <div>📁 components/bed-map/index.ts</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Tecnologias Utilizadas</h4>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS', 'Lucide Icons'].map((tech) => (
                <span key={tech} className="px-3 py-1 bg-medical-blue/20 text-medical-blue rounded-full text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Funcionalidades Implementadas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>✅ Drag and Drop nativo</div>
              <div>✅ Ferramentas de edição</div>
              <div>✅ Persistência de dados</div>
              <div>✅ Interface responsiva</div>
              <div>✅ Navegação por teclado</div>
              <div>✅ Validação de limites</div>
              <div>✅ Feedback visual</div>
              <div>✅ Controle de estado</div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default BedMapExample;







