import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Flask,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Save,
  X,
  Search,
  Plus,
  Minus,
  Droplet,
  Target,
  Beaker
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { useLaboratory } from '@/hooks/useLaboratory';
import { LabOrder, LabTest, SampleType, ContainerType } from '@/types/laboratory';

interface LaboratoryOrderProps {
  patientId?: string;
  patientName?: string;
  onOrdered?: (order: LabOrder) => void;
  onCancel?: () => void;
}

const LaboratoryOrder: React.FC<LaboratoryOrderProps> = ({
  patientId,
  patientName,
  onOrdered,
  onCancel
}) => {
  const { orderTests, tests, loading } = useLaboratory();

  const [form, setForm] = useState({
    // Patient Info
    patientId: patientId || '',
    patientName: patientName || '',
    patientAge: '',
    patientGender: 'M' as 'M' | 'F',

    // Request Info
    requestedBy: '',
    requestedByName: '',
    requestingDepartment: '',
    clinicalIndication: '',
    urgency: 'routine' as 'routine' | 'urgent' | 'emergency',

    // Tests
    selectedTests: [] as LabTest[],

    // Sample Info
    sampleType: 'blood' as SampleType,

    // Additional
    notes: '',
    specialInstructions: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Filtrar exames disponíveis
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Agrupar exames por categoria
  const categories = [...new Set(tests.map(test => test.category))];

  // Verificar se exame já foi selecionado
  const isTestSelected = (test: LabTest) => {
    return form.selectedTests.some(selected => selected.id === test.id);
  };

  // Adicionar/remover exame da seleção
  const toggleTest = (test: LabTest) => {
    setForm(prev => ({
      ...prev,
      selectedTests: isTestSelected(test)
        ? prev.selectedTests.filter(selected => selected.id !== test.id)
        : [...prev.selectedTests, test]
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.patientName.trim()) errors.patientName = 'Nome do paciente é obrigatório';
    if (!form.clinicalIndication.trim()) errors.clinicalIndication = 'Indicação clínica é obrigatória';
    if (form.selectedTests.length === 0) errors.selectedTests = 'Pelo menos um exame deve ser selecionado';
    if (!form.requestedByName.trim()) errors.requestedByName = 'Médico solicitante é obrigatório';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const orderData = {
        patientId: form.patientId || `temp-${Date.now()}`,
        patientName: form.patientName,
        patientAge: parseInt(form.patientAge) || 0,
        patientGender: form.patientGender,
        patientBirthDate: new Date(Date.now() - (parseInt(form.patientAge) || 30) * 365 * 24 * 60 * 60 * 1000),

        requestedBy: form.requestedBy || 'current-user',
        requestedByName: form.requestedByName,
        requestingDepartment: form.requestingDepartment,
        clinicalIndication: form.clinicalIndication,
        urgency: form.urgency,

        tests: form.selectedTests.map(test => ({
          id: `${test.id}-${Date.now()}`,
          orderId: '',
          testId: test.id,
          testCode: test.code,
          testName: test.name,
          status: 'pending' as const,
          priority: form.urgency === 'emergency' ? 'critical' :
                   form.urgency === 'urgent' ? 'high' : 'normal',
          notes: form.specialInstructions
        })),

        sampleType: form.sampleType,

        notes: form.notes
      };

      const result = await orderTests(orderData);

      if (result.success && onOrdered) {
        onOrdered(result.order!);
      }
    } catch (error) {
      console.error('Erro ao solicitar exames:', error);
    }
  };

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Determinar tipo de amostra baseado nos exames selecionados
  useEffect(() => {
    if (form.selectedTests.length > 0) {
      // Agrupar tipos de amostra dos exames selecionados
      const sampleTypes = [...new Set(form.selectedTests.map(test => test.sampleType))];

      // Se todos os exames usam o mesmo tipo de amostra, definir automaticamente
      if (sampleTypes.length === 1) {
        updateForm('sampleType', sampleTypes[0]);
      }
      // Caso contrário, manter blood como padrão
    }
  }, [form.selectedTests]);

  const sampleTypeOptions: { value: SampleType; label: string; icon: string }[] = [
    { value: 'blood', label: 'Sangue', icon: '🩸' },
    { value: 'urine', label: 'Urina', icon: '🧪' },
    { value: 'stool', label: 'Fezes', icon: '💩' },
    { value: 'sputum', label: 'Escarro', icon: '🫁' },
    { value: 'swab', label: 'Swab', icon: '🧴' },
    { value: 'csf', label: 'Líquor', icon: '🧠' },
    { value: 'pleural_fluid', label: 'Derrame Pleural', icon: '🫁' },
    { value: 'ascites', label: 'Ascite', icon: '🫃' },
    { value: 'synovial_fluid', label: 'Líquido Sinovial', icon: '🦵' },
    { value: 'amniotic_fluid', label: 'Líquido Amniótico', icon: '👶' }
  ];

  const containerTypeLabels: Record<ContainerType, string> = {
    serum_separator_tube: 'Tubo Separador de Soro',
    plain_tube: 'Tubo Seco',
    edta_tube: 'Tubo EDTA',
    citrate_tube: 'Tubo Citrato',
    heparin_tube: 'Tubo Heparina',
    fluoride_tube: 'Tubo Fluorado',
    urine_container: 'Frasco para Urina',
    stool_container: 'Frasco para Fezes',
    swab_transport: 'Transporte para Swab',
    other: 'Outro'
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Solicitar Exames Laboratoriais</h3>
            <p className="text-white/70 text-sm">
              Selecione os exames necessários para o paciente
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onCancel && (
              <GlassButton onClick={onCancel} variant="secondary">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </GlassButton>
            )}
            <GlassButton
              onClick={handleSubmit}
              disabled={loading}
              variant="primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Solicitando...' : 'Solicitar Exames'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassInput
            label="Nome do Paciente *"
            placeholder="Digite o nome completo"
            value={form.patientName}
            onChange={(value) => updateForm('patientName', value)}
            error={validationErrors.patientName}
            required
          />

          <GlassInput
            label="Idade"
            type="number"
            placeholder="Ex: 45"
            value={form.patientAge}
            onChange={(value) => updateForm('patientAge', value)}
          />

          <div>
            <label className="block text-white/80 text-sm mb-2">Gênero</label>
            <select
              value={form.patientGender}
              onChange={(e) => updateForm('patientGender', e.target.value as 'M' | 'F')}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          <GlassInput
            label="ID do Paciente"
            placeholder="ID interno do paciente"
            value={form.patientId}
            onChange={(value) => updateForm('patientId', value)}
          />
        </div>
      </GlassCard>

      {/* Request Information */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Informações da Solicitação
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Médico Solicitante *"
            placeholder="Nome do médico"
            value={form.requestedByName}
            onChange={(value) => updateForm('requestedByName', value)}
            error={validationErrors.requestedByName}
            required
          />

          <GlassInput
            label="Departamento"
            placeholder="Ex: Clínica Médica"
            value={form.requestingDepartment}
            onChange={(value) => updateForm('requestingDepartment', value)}
          />

          <div className="md:col-span-2">
            <label className="block text-white/80 text-sm mb-2">
              Indicação Clínica *
            </label>
            <textarea
              value={form.clinicalIndication}
              onChange={(e) => updateForm('clinicalIndication', e.target.value)}
              placeholder="Descreva a indicação clínica para os exames..."
              className={`w-full bg-white/10 border rounded px-3 py-2 text-white resize-none ${
                validationErrors.clinicalIndication ? 'border-red-500' : 'border-white/20'
              }`}
              rows={3}
              required
            />
            {validationErrors.clinicalIndication && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.clinicalIndication}</p>
            )}
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Urgência</label>
            <select
              value={form.urgency}
              onChange={(e) => updateForm('urgency', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            >
              <option value="routine">Rotina</option>
              <option value="urgent">Urgente</option>
              <option value="emergency">Emergência</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Test Selection */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <Flask className="w-5 h-5 mr-2" />
          Seleção de Exames
        </h4>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Buscar exames..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Tests Summary */}
        {form.selectedTests.length > 0 && (
          <div className="mb-4 p-4 bg-medical-blue/10 border border-medical-blue/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-medical-blue font-medium">
                {form.selectedTests.length} exame(s) selecionado(s)
              </h5>
              <GlassButton
                onClick={() => updateForm('selectedTests', [])}
                variant="ghost"
                size="sm"
              >
                Limpar Seleção
              </GlassButton>
            </div>

            <div className="flex flex-wrap gap-2">
              {form.selectedTests.map(test => (
                <div
                  key={test.id}
                  className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full"
                >
                  <span className="text-white text-sm">{test.code} - {test.name}</span>
                  <button
                    onClick={() => toggleTest(test)}
                    className="text-white/60 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Tests */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredTests.map((test) => {
            const isSelected = isTestSelected(test);
            return (
              <div
                key={test.id}
                onClick={() => toggleTest(test)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-medical-blue bg-medical-blue/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        test.category.color === '#e74c3c' ? 'bg-red-400' :
                        test.category.color === '#3498db' ? 'bg-blue-400' :
                        test.category.color === '#9b59b6' ? 'bg-purple-400' :
                        test.category.color === '#f39c12' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <h5 className="text-white font-medium">{test.name}</h5>
                        <p className="text-white/60 text-sm">{test.code} • {test.category.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 mt-2 text-xs text-white/60">
                      <span>⏱️ {test.turnaroundTime}h</span>
                      <span>💰 €{test.cost}</span>
                      <span>🩸 {containerTypeLabels[test.containerType]}</span>
                      {test.fastingRequired && <span>🍽️ Jejum</span>}
                      {test.emergencyAvailable && <span>🚨 Emergência</span>}
                    </div>

                    {test.description && (
                      <p className="text-white/70 text-sm mt-2">{test.description}</p>
                    )}

                    {test.preparation && (
                      <p className="text-yellow-400 text-sm mt-1">
                        ⚠️ {test.preparation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-medical-blue" />
                    ) : (
                      <Plus className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {validationErrors.selectedTests && (
          <p className="text-red-400 text-sm mt-4">{validationErrors.selectedTests}</p>
        )}
      </GlassCard>

      {/* Sample Information */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <Droplet className="w-5 h-5 mr-2" />
          Informações da Amostra
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/80 text-sm mb-3">Tipo de Amostra</label>
            <div className="grid grid-cols-2 gap-2">
              {sampleTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateForm('sampleType', option.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    form.sampleType === option.value
                      ? 'border-medical-blue bg-medical-blue/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-white text-sm">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <GlassInput
              label="Observações sobre a Amostra"
              placeholder="Instruções especiais para coleta..."
              value={form.specialInstructions}
              onChange={(value) => updateForm('specialInstructions', value)}
            />

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h5 className="text-blue-400 font-medium mb-2">Informações da Coleta</h5>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Tipo de Amostra:</span>
                  <span className="text-white">
                    {sampleTypeOptions.find(opt => opt.value === form.sampleType)?.label}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/70">Volume Estimado:</span>
                  <span className="text-white">
                    {form.selectedTests.reduce((total, test) => total + test.volumeRequired, 0)} mL
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/70">Jejum Necessário:</span>
                  <span className="text-white">
                    {form.selectedTests.some(test => test.fastingRequired) ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Additional Information */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Informações Adicionais
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-white/80 text-sm mb-2">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              placeholder="Observações adicionais sobre a solicitação..."
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white resize-none"
              rows={3}
            />
          </div>
        </div>

        {form.selectedTests.length > 0 && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h5 className="text-green-400 font-medium mb-2">Resumo da Solicitação</h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-white/70">Total de Exames:</p>
                <p className="text-white font-medium">{form.selectedTests.length}</p>
              </div>

              <div>
                <p className="text-white/70">Custo Estimado:</p>
                <p className="text-white font-medium">
                  €{form.selectedTests.reduce((total, test) => total + (test.cost || 0), 0)}
                </p>
              </div>

              <div>
                <p className="text-white/70">Tempo Estimado:</p>
                <p className="text-white font-medium">
                  {Math.max(...form.selectedTests.map(test => test.turnaroundTime))}h
                </p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default LaboratoryOrder;







