import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { CID10Select, MedicationSelect } from './index';
import type { CID10Option, MedicationOption } from './index';

/**
 * Componente de exemplo para demonstrar o uso dos componentes de autocomplete
 * Este componente pode ser usado para testar a funcionalidade dos selects
 */
const AutocompleteExample: React.FC = () => {
  const [selectedCID10, setSelectedCID10] = useState<string>('');
  const [selectedCID10Option, setSelectedCID10Option] = useState<CID10Option | undefined>();

  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const [selectedMedicationOption, setSelectedMedicationOption] = useState<MedicationOption | undefined>();

  const handleCID10Change = (value: string, option?: CID10Option) => {
    setSelectedCID10(value);
    setSelectedCID10Option(option);
  };

  const handleMedicationChange = (value: string, option?: MedicationOption) => {
    setSelectedMedication(value);
    setSelectedMedicationOption(option);
  };

  const clearAll = () => {
    setSelectedCID10('');
    setSelectedCID10Option(undefined);
    setSelectedMedication('');
    setSelectedMedicationOption(undefined);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          Demonstração - Componentes de Autocomplete
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CID-10 Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90">
              CID-10 - Classificação Internacional de Doenças
            </h3>

            <CID10Select
              label="Diagnóstico (CID-10)"
              placeholder="Buscar por código ou descrição..."
              value={selectedCID10}
              onChange={handleCID10Change}
              required
              showCategory
            />

            {selectedCID10Option && (
              <motion.div
                className="p-4 bg-white/10 rounded-lg border border-white/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-semibold text-white mb-2">CID-10 Selecionado:</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-white/70">Código:</span> <span className="text-medical-blue font-mono">{selectedCID10Option.code}</span></p>
                  <p><span className="text-white/70">Descrição:</span> <span className="text-white">{selectedCID10Option.description}</span></p>
                  {selectedCID10Option.category && (
                    <p><span className="text-white/70">Categoria:</span> <span className="text-white/60">{selectedCID10Option.category}</span></p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Medication Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/90">
              Medicamentos
            </h3>

            <MedicationSelect
              label="Medicamento"
              placeholder="Buscar por nome comercial, princípio ativo..."
              value={selectedMedication}
              onChange={handleMedicationChange}
              required
              showDetails
            />

            {selectedMedicationOption && (
              <motion.div
                className="p-4 bg-white/10 rounded-lg border border-white/20"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-semibold text-white mb-2">Medicamento Selecionado:</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-white/70">Nome comercial:</span> <span className="text-medical-blue">{selectedMedicationOption.nomeComercial}</span></p>
                  <p><span className="text-white/70">Princípio ativo:</span> <span className="text-white">{selectedMedicationOption.principioAtivo}</span></p>
                  <p><span className="text-white/70">Dosagem:</span> <span className="text-white">{selectedMedicationOption.dosagem}</span></p>
                  <p><span className="text-white/70">Apresentação:</span> <span className="text-white">{selectedMedicationOption.apresentacao}</span></p>
                  <p><span className="text-white/70">Via administração:</span> <span className="text-white">{selectedMedicationOption.viaAdministracao}</span></p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-white/70">Laboratório:</span>
                    <span className="text-white/60">{selectedMedicationOption.laboratorio}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${
                      selectedMedicationOption.tarja === 'Preta' ? 'bg-black/20 border-black/30 text-black' :
                      selectedMedicationOption.tarja === 'Vermelha' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                      'bg-gray-500/20 border-gray-500/30 text-gray-400'
                    }`}>
                      {selectedMedicationOption.tarja}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-white/10">
          <GlassButton
            onClick={clearAll}
            variant="secondary"
            className="px-6 py-2"
          >
            Limpar Tudo
          </GlassButton>
        </div>
      </GlassCard>

      {/* Usage Instructions */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Como usar os componentes:
        </h3>

        <div className="space-y-4 text-sm text-white/80">
          <div>
            <h4 className="font-semibold text-white mb-2">CID10Select:</h4>
            <pre className="bg-white/10 p-3 rounded text-xs overflow-x-auto">
{`<CID10Select
  label="Diagnóstico (CID-10)"
  value={selectedCID10}
  onChange={(value, option) => {
    setSelectedCID10(value);
    setSelectedCID10Option(option);
  }}
  required
  showCategory
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">MedicationSelect:</h4>
            <pre className="bg-white/10 p-3 rounded text-xs overflow-x-auto">
{`<MedicationSelect
  label="Medicamento"
  value={selectedMedication}
  onChange={(value, option) => {
    setSelectedMedication(value);
    setSelectedMedicationOption(option);
  }}
  required
  showDetails
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Características:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Busca em tempo real por código, descrição ou categoria</li>
              <li>Navegação por teclado (↑↓ Enter Esc)</li>
              <li>Interface visual com glassmorphism</li>
              <li>Limitação automática de resultados (100 max)</li>
              <li>Indicadores visuais de seleção e tarja</li>
              <li>Responsivo e acessível</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default AutocompleteExample;







