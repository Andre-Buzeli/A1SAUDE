import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  Minus,
  Save,
  FileText,
  Calendar,
  User,
  Pill,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { usePharmacy } from '@/hooks/usePharmacy';
import { PharmacyDispensationItem } from '@/types/pharmacy';

interface DispensationForm {
  pacienteId: string;
  pacienteNome: string;
  prescricaoId?: string;
  atendimentoId?: string;
  medicoId?: string;
  medicoNome?: string;
  itens: DispensationItem[];
  observacoes?: string;
}

interface DispensationItem {
  medicationId: string;
  medicationNome: string;
  quantidadePrescrita: number;
  quantidadeDispensada: number;
  dosagem: string;
  frequencia: string;
  duracao: string;
  instrucoesUso?: string;
}

const PharmacyDispensation: React.FC = () => {
  const { medications, stock, registerDispensation, loading } = usePharmacy();
  const [form, setForm] = useState<DispensationForm>({
    pacienteId: '',
    pacienteNome: '',
    itens: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMedication, setShowAddMedication] = useState(false);

  // Filtrar medicamentos disponíveis em estoque
  const availableMedications = useMemo(() => {
    return medications.filter(med =>
      stock.some(s => s.medicationId === med.id && s.quantidadeTotal > 0)
    );
  }, [medications, stock]);

  const filteredMedications = useMemo(() => {
    if (!searchTerm) return availableMedications;
    return availableMedications.filter(med =>
      med.nomeComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.principioAtivo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableMedications, searchTerm]);

  const addMedicationToDispensation = (medicationId: string) => {
    const medication = medications.find(m => m.id === medicationId);
    if (!medication) return;

    const newItem: DispensationItem = {
      medicationId,
      medicationNome: medication.nomeComercial,
      quantidadePrescrita: 0,
      quantidadeDispensada: 0,
      dosagem: '',
      frequencia: '',
      duracao: '',
      instrucoesUso: ''
    };

    setForm(prev => ({
      ...prev,
      itens: [...prev.itens, newItem]
    }));

    setShowAddMedication(false);
    setSearchTerm('');
  };

  const updateItem = (index: number, field: keyof DispensationItem, value: any) => {
    setForm(prev => ({
      ...prev,
      itens: prev.itens.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.pacienteNome.trim() || form.itens.length === 0) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // Validar se há estoque suficiente para todos os itens
    for (const item of form.itens) {
      const medicationStock = stock.find(s => s.medicationId === item.medicationId);
      if (!medicationStock || medicationStock.quantidadeTotal < item.quantidadeDispensada) {
        alert(`Estoque insuficiente para ${item.medicationNome}`);
        return;
      }
    }

    try {
      // Registrar dispensação para cada item
      for (const item of form.itens) {
        await registerDispensation({
          pacienteId: form.pacienteId || 'paciente-temp',
          pacienteNome: form.pacienteNome,
          medicationId: item.medicationId,
          quantidade: item.quantidadeDispensada,
          prescricaoId: form.prescricaoId,
          atendimentoId: form.atendimentoId
        });
      }

      // Reset form
      setForm({
        pacienteId: '',
        pacienteNome: '',
        itens: []
      });

      alert('Dispensação registrada com sucesso!');
    } catch (error) {
      alert('Erro ao registrar dispensação');
    }
  };

  const totalItens = form.itens.reduce((sum, item) => sum + item.quantidadeDispensada, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Dispensação de Medicamentos</h3>
            <p className="text-white/70 text-sm">
              Registre a dispensação de medicamentos para pacientes
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white/60 text-sm">Itens na dispensação</p>
              <p className="text-white font-bold text-lg">{totalItens}</p>
            </div>
            <GlassButton
              onClick={handleSubmit}
              disabled={loading || !form.pacienteNome.trim() || form.itens.length === 0}
              variant="primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Registrar Dispensação
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Patient Information */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Informações do Paciente
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Nome do Paciente *"
            placeholder="Digite o nome do paciente"
            value={form.pacienteNome}
            onChange={(value) => setForm(prev => ({ ...prev, pacienteNome: value }))}
            required
          />

          <GlassInput
            label="ID do Paciente"
            placeholder="ID interno do paciente"
            value={form.pacienteId}
            onChange={(value) => setForm(prev => ({ ...prev, pacienteId: value }))}
          />

          <GlassInput
            label="ID da Prescrição"
            placeholder="Número da prescrição"
            value={form.prescricaoId || ''}
            onChange={(value) => setForm(prev => ({ ...prev, prescricaoId: value }))}
          />

          <GlassInput
            label="ID do Atendimento"
            placeholder="Número do atendimento"
            value={form.atendimentoId || ''}
            onChange={(value) => setForm(prev => ({ ...prev, atendimentoId: value }))}
          />
        </div>
      </GlassCard>

      {/* Medications List */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white flex items-center">
            <Pill className="w-5 h-5 mr-2" />
            Medicamentos
          </h4>

          <GlassButton
            onClick={() => setShowAddMedication(true)}
            variant="secondary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Medicamento
          </GlassButton>
        </div>

        {form.itens.length === 0 ? (
          <div className="text-center py-8">
            <Pill className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">Nenhum medicamento adicionado</p>
            <p className="text-white/40 text-sm">Clique em "Adicionar Medicamento" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.itens.map((item, index) => {
              const medicationStock = stock.find(s => s.medicationId === item.medicationId);
              const medication = medications.find(m => m.id === item.medicationId);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="text-white font-medium">{item.medicationNome}</h5>
                      <p className="text-white/60 text-sm">
                        {medication?.principioAtivo} • {medication?.dosagem}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {medicationStock && medicationStock.quantidadeTotal < item.quantidadeDispensada && (
                        <div className="flex items-center text-red-400 text-sm">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Estoque insuficiente
                        </div>
                      )}
                      <GlassButton
                        onClick={() => removeItem(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <Minus className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        Quantidade Prescrita
                      </label>
                      <input
                        type="number"
                        value={item.quantidadePrescrita}
                        onChange={(e) => updateItem(index, 'quantidadePrescrita', parseInt(e.target.value) || 0)}
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        Quantidade Dispensada *
                      </label>
                      <input
                        type="number"
                        value={item.quantidadeDispensada}
                        onChange={(e) => updateItem(index, 'quantidadeDispensada', parseInt(e.target.value) || 0)}
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        min="0"
                        max={medicationStock?.quantidadeTotal || 0}
                        required
                      />
                      <p className="text-white/60 text-xs mt-1">
                        Disponível: {medicationStock?.quantidadeTotal || 0}
                      </p>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        Dosagem
                      </label>
                      <input
                        type="text"
                        value={item.dosagem}
                        onChange={(e) => updateItem(index, 'dosagem', e.target.value)}
                        placeholder="ex: 1 comprimido"
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm mb-1">
                        Frequência
                      </label>
                      <input
                        type="text"
                        value={item.frequencia}
                        onChange={(e) => updateItem(index, 'frequencia', e.target.value)}
                        placeholder="ex: 8/8h"
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-white/80 text-sm mb-1">
                        Duração
                      </label>
                      <input
                        type="text"
                        value={item.duracao}
                        onChange={(e) => updateItem(index, 'duracao', e.target.value)}
                        placeholder="ex: 7 dias"
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-white/80 text-sm mb-1">
                        Instruções de Uso
                      </label>
                      <textarea
                        value={item.instrucoesUso || ''}
                        onChange={(e) => updateItem(index, 'instrucoesUso', e.target.value)}
                        placeholder="Instruções especiais para o paciente"
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Observações */}
        <div className="mt-6">
          <label className="block text-white/80 text-sm mb-2">
            Observações
          </label>
          <textarea
            value={form.observacoes || ''}
            onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Observações adicionais sobre a dispensação"
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white resize-none"
            rows={3}
          />
        </div>
      </GlassCard>

      {/* Add Medication Modal */}
      {showAddMedication && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h4 className="text-lg font-semibold text-white">Adicionar Medicamento</h4>
              <GlassButton
                onClick={() => {
                  setShowAddMedication(false);
                  setSearchTerm('');
                }}
                variant="ghost"
                size="sm"
              >
                ✕
              </GlassButton>
            </div>

            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <GlassInput
                  placeholder="Buscar medicamento..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="pl-10"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredMedications.map((medication) => {
                  const medicationStock = stock.find(s => s.medicationId === medication.id);
                  const alreadyAdded = form.itens.some(item => item.medicationId === medication.id);

                  return (
                    <div
                      key={medication.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        alreadyAdded
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => !alreadyAdded && addMedicationToDispensation(medication.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-medium">{medication.nomeComercial}</p>
                            {alreadyAdded && <CheckCircle className="w-4 h-4 text-green-400" />}
                          </div>
                          <p className="text-white/60 text-sm">
                            {medication.principioAtivo} • {medication.dosagem}
                          </p>
                          <p className="text-white/40 text-xs">
                            Estoque: {medicationStock?.quantidadeTotal || 0} {medication.unidadeMedida}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            medication.tarja === 'Preta' ? 'bg-black/50 text-white' :
                            medication.tarja === 'Vermelha' ? 'bg-red-500/50 text-red-300' :
                            'bg-gray-500/50 text-gray-300'
                          }`}>
                            {medication.tarja}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default PharmacyDispensation;







