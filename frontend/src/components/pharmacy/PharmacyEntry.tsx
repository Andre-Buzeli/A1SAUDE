import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Save,
  Calendar,
  DollarSign,
  Hash,
  Truck,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { usePharmacy } from '@/hooks/usePharmacy';
import { PharmacyMedication } from '@/types/pharmacy';

interface EntryForm {
  medicationId: string;
  lote: string;
  fornecedorId: string;
  fornecedorNome: string;
  quantidade: number;
  valorUnitarioCompra: number;
  valorUnitarioVenda: number;
  dataFabricacao: string;
  dataValidade: string;
  localArmazenamento: string;
  temperaturaArmazenamento?: number;
  umidadeArmazenamento?: number;
  observacoes?: string;
}

const PharmacyEntry: React.FC = () => {
  const { medications, suppliers, registerEntry, loading } = usePharmacy();
  const [entries, setEntries] = useState<EntryForm[]>([{
    medicationId: '',
    lote: '',
    fornecedorId: '',
    fornecedorNome: '',
    quantidade: 0,
    valorUnitarioCompra: 0,
    valorUnitarioVenda: 0,
    dataFabricacao: '',
    dataValidade: '',
    localArmazenamento: '',
    observacoes: ''
  }]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddEntry, setShowAddEntry] = useState(false);

  const filteredMedications = medications.filter(med =>
    med.nomeComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.principioAtivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addNewEntry = () => {
    setEntries(prev => [...prev, {
      medicationId: '',
      lote: '',
      fornecedorId: '',
      fornecedorNome: '',
      quantidade: 0,
      valorUnitarioCompra: 0,
      valorUnitarioVenda: 0,
      dataFabricacao: '',
      dataValidade: '',
      localArmazenamento: '',
      observacoes: ''
    }]);
  };

  const removeEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof EntryForm, value: any) => {
    setEntries(prev => prev.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const selectMedication = (index: number, medication: PharmacyMedication) => {
    updateEntry(index, 'medicationId', medication.id);
    // Auto-preencher valores de venda se disponível
    if (medication.valorUnitario) {
      updateEntry(index, 'valorUnitarioVenda', medication.valorUnitario);
    }
  };

  const validateEntry = (entry: EntryForm): string[] => {
    const errors: string[] = [];

    if (!entry.medicationId) errors.push('Medicamento é obrigatório');
    if (!entry.lote.trim()) errors.push('Lote é obrigatório');
    if (!entry.fornecedorNome.trim()) errors.push('Fornecedor é obrigatório');
    if (entry.quantidade <= 0) errors.push('Quantidade deve ser maior que zero');
    if (entry.valorUnitarioCompra <= 0) errors.push('Valor de compra deve ser maior que zero');
    if (!entry.dataValidade) errors.push('Data de validade é obrigatória');
    if (!entry.localArmazenamento.trim()) errors.push('Local de armazenamento é obrigatório');

    // Validar data de validade
    if (entry.dataValidade) {
      const expiryDate = new Date(entry.dataValidade);
      const today = new Date();
      if (expiryDate <= today) {
        errors.push('Data de validade deve ser futura');
      }
    }

    return errors;
  };

  const handleSubmit = async () => {
    const allErrors: string[] = [];

    entries.forEach((entry, index) => {
      const errors = validateEntry(entry);
      if (errors.length > 0) {
        allErrors.push(`Entrada ${index + 1}: ${errors.join(', ')}`);
      }
    });

    if (allErrors.length > 0) {
      alert('Erros de validação:\n' + allErrors.join('\n'));
      return;
    }

    try {
      // Registrar todas as entradas
      for (const entry of entries) {
        await registerEntry({
          medicationId: entry.medicationId,
          batchId: `batch-${Date.now()}`, // Mock
          quantidade: entry.quantidade,
          fornecedorId: entry.fornecedorId,
          valorUnitario: entry.valorUnitarioCompra,
          dataValidade: new Date(entry.dataValidade),
          lote: entry.lote
        });
      }

      // Reset form
      setEntries([{
        medicationId: '',
        lote: '',
        fornecedorId: '',
        fornecedorNome: '',
        quantidade: 0,
        valorUnitarioCompra: 0,
        valorUnitarioVenda: 0,
        dataFabricacao: '',
        dataValidade: '',
        localArmazenamento: '',
        observacoes: ''
      }]);

      alert('Entradas registradas com sucesso!');
    } catch (error) {
      alert('Erro ao registrar entradas');
    }
  };

  const totalValue = entries.reduce((sum, entry) =>
    sum + (entry.quantidade * entry.valorUnitarioCompra), 0
  );

  const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantidade, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Registro de Entrada</h3>
            <p className="text-white/70 text-sm">
              Registre a entrada de medicamentos no estoque
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white/60 text-sm">Valor Total</p>
              <p className="text-white font-bold text-lg">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">Total Itens</p>
              <p className="text-white font-bold text-lg">{totalQuantity}</p>
            </div>
            <GlassButton
              onClick={handleSubmit}
              disabled={loading || entries.length === 0}
              variant="primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Registrar Entradas
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Entries */}
      <div className="space-y-4">
        {entries.map((entry, index) => {
          const selectedMedication = medications.find(m => m.id === entry.medicationId);
          const errors = validateEntry(entry);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-white">
                    Entrada #{index + 1}
                  </h4>

                  {entries.length > 1 && (
                    <GlassButton
                      onClick={() => removeEntry(index)}
                      variant="ghost"
                      size="sm"
                    >
                      Remover
                    </GlassButton>
                  )}
                </div>

                {errors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">Erros de validação</span>
                    </div>
                    <ul className="text-red-300 text-sm space-y-1">
                      {errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Medication Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-white/80 text-sm mb-2">
                      Medicamento *
                    </label>
                    {selectedMedication ? (
                      <div className="flex items-center justify-between p-3 bg-white/10 border border-white/20 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{selectedMedication.nomeComercial}</p>
                          <p className="text-white/60 text-sm">
                            {selectedMedication.principioAtivo} • {selectedMedication.dosagem}
                          </p>
                        </div>
                        <GlassButton
                          onClick={() => updateEntry(index, 'medicationId', '')}
                          variant="ghost"
                          size="sm"
                        >
                          Trocar
                        </GlassButton>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                          <input
                            type="text"
                            placeholder="Buscar medicamento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
                          />
                        </div>

                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {filteredMedications.slice(0, 5).map((medication) => (
                            <div
                              key={medication.id}
                              className="p-2 hover:bg-white/10 cursor-pointer rounded text-sm"
                              onClick={() => selectMedication(index, medication)}
                            >
                              <p className="text-white font-medium">{medication.nomeComercial}</p>
                              <p className="text-white/60">{medication.principioAtivo}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Batch Info */}
                  <div>
                    <GlassInput
                      label="Lote *"
                      placeholder="Número do lote"
                      value={entry.lote}
                      onChange={(value) => updateEntry(index, 'lote', value)}
                      required
                    />
                  </div>

                  <div>
                    <GlassInput
                      label="Fornecedor *"
                      placeholder="Nome do fornecedor"
                      value={entry.fornecedorNome}
                      onChange={(value) => updateEntry(index, 'fornecedorNome', value)}
                      required
                    />
                  </div>

                  <div>
                    <GlassInput
                      label="Local de Armazenamento *"
                      placeholder="Ex: Prateleira A1"
                      value={entry.localArmazenamento}
                      onChange={(value) => updateEntry(index, 'localArmazenamento', value)}
                      required
                    />
                  </div>

                  {/* Quantities and Values */}
                  <div>
                    <GlassInput
                      label="Quantidade *"
                      type="number"
                      placeholder="0"
                      value={entry.quantidade.toString()}
                      onChange={(value) => updateEntry(index, 'quantidade', parseInt(value) || 0)}
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <GlassInput
                      label="Valor Compra (R$) *"
                      type="number"
                      placeholder="0.00"
                      value={entry.valorUnitarioCompra.toString()}
                      onChange={(value) => updateEntry(index, 'valorUnitarioCompra', parseFloat(value) || 0)}
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>

                  <div>
                    <GlassInput
                      label="Valor Venda (R$)"
                      type="number"
                      placeholder="0.00"
                      value={entry.valorUnitarioVenda.toString()}
                      onChange={(value) => updateEntry(index, 'valorUnitarioVenda', parseFloat(value) || 0)}
                      step="0.01"
                      min="0"
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Data de Fabricação
                    </label>
                    <input
                      type="date"
                      value={entry.dataFabricacao}
                      onChange={(e) => updateEntry(index, 'dataFabricacao', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Data de Validade *
                    </label>
                    <input
                      type="date"
                      value={entry.dataValidade}
                      onChange={(e) => updateEntry(index, 'dataValidade', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      required
                    />
                  </div>

                  {/* Storage Conditions */}
                  <div>
                    <GlassInput
                      label="Temperatura (°C)"
                      type="number"
                      placeholder="Ex: 25"
                      value={entry.temperaturaArmazenamento?.toString() || ''}
                      onChange={(value) => updateEntry(index, 'temperaturaArmazenamento', parseFloat(value) || undefined)}
                      step="0.1"
                    />
                  </div>

                  {/* Observations */}
                  <div className="md:col-span-3">
                    <label className="block text-white/80 text-sm mb-2">
                      Observações
                    </label>
                    <textarea
                      value={entry.observacoes || ''}
                      onChange={(e) => updateEntry(index, 'observacoes', e.target.value)}
                      placeholder="Observações adicionais sobre a entrada"
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Add New Entry */}
      <GlassCard className="p-6">
        <div className="text-center">
          <GlassButton onClick={addNewEntry} variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Nova Entrada
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};

export default PharmacyEntry;









