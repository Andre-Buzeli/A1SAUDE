import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Calculator, AlertTriangle, Heart, Thermometer, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassTextarea from '@/components/ui/GlassTextarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { triageService, TriageCreateData, ManchesterTriageResult } from '@/services/triageService';
import { patientService, Patient } from '@/services/patientService';

interface ManchesterTriageFormProps {
  attendanceId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ManchesterTriageForm: React.FC<ManchesterTriageFormProps> = ({
  attendanceId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Patient selection
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Triage data
  const [triageData, setTriageData] = useState<TriageCreateData>({
    patientId: '',
    attendanceId,
    chiefComplaint: '',
    presentation: 'walking',
    consciousness: 'alert'
  });

  // Calculated priority
  const [calculatedResult, setCalculatedResult] = useState<ManchesterTriageResult | null>(null);

  // Discriminators for current complaint
  const [currentDiscriminators, setCurrentDiscriminators] = useState<string[]>(['']);

  // Search patients when typing
  useEffect(() => {
    if (patientSearch.length >= 3) {
      searchPatients();
    } else {
      setPatients([]);
    }
  }, [patientSearch]);

  const searchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await patientService.searchPatients({
        query: patientSearch,
        limit: 10
      });
      setPatients(response.patients || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setTriageData(prev => ({ ...prev, patientId: patient.id }));
    setPatientSearch(patient.name);
    setPatients([]);
  };

  const handleCalculatePriority = async () => {
    if (!triageData.chiefComplaint.trim()) {
      toast.error('Queixa principal é obrigatória para calcular prioridade');
      return;
    }

    try {
      setCalculating(true);
      const result = await triageService.calculatePriority({
        chiefComplaint: triageData.chiefComplaint,
        vitalSigns: {
          respiratoryRate: triageData.respiratoryRate,
          heartRate: triageData.heartRate,
          bloodPressureSystolic: triageData.bloodPressureSystolic,
          bloodPressureDiastolic: triageData.bloodPressureDiastolic,
          temperature: triageData.temperature,
          oxygenSaturation: triageData.oxygenSaturation,
          painScale: triageData.painScale
        },
        discriminators: currentDiscriminators.filter(d => d.trim()),
        presentation: triageData.presentation,
        consciousness: triageData.consciousness
      });

      setCalculatedResult(result);

      // Auto-set discriminators
      setTriageData(prev => ({
        ...prev,
        discriminator1: result.discriminators[0] || '',
        discriminator2: result.discriminators[1] || '',
        discriminator3: result.discriminators[2] || '',
        discriminator4: result.discriminators[3] || '',
        discriminator5: result.discriminators[4] || '',
        calculatedPriority: result.priority,
        finalPriority: result.priority // Use calculated as final by default
      }));

      toast.success('Prioridade calculada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao calcular prioridade:', error);
      toast.error(error?.message || 'Erro ao calcular prioridade');
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!triageData.patientId) {
      toast.error('Selecione um paciente');
      return;
    }

    if (!triageData.chiefComplaint.trim()) {
      toast.error('Queixa principal é obrigatória');
      return;
    }

    if (!triageData.finalPriority) {
      toast.error('Calcule a prioridade antes de salvar');
      return;
    }

    try {
      setLoading(true);
      await triageService.createTriage(triageData);

      toast.success('Triagem criada com sucesso!');

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dev/triage');
      }
    } catch (error: any) {
      console.error('Erro ao criar triagem:', error);
      toast.error(error?.message || 'Erro ao criar triagem');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/dev/triage');
    }
  };

  const addDiscriminator = () => {
    setCurrentDiscriminators([...currentDiscriminators, '']);
  };

  const updateDiscriminator = (index: number, value: string) => {
    const newDiscriminators = [...currentDiscriminators];
    newDiscriminators[index] = value;
    setCurrentDiscriminators(newDiscriminators);
  };

  const removeDiscriminator = (index: number) => {
    if (currentDiscriminators.length > 1) {
      setCurrentDiscriminators(currentDiscriminators.filter((_, i) => i !== index));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <form onSubmit={handleSubmit}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Activity className="w-6 h-6 mr-3 text-medical-green" />
              Triagem Manchester
            </h2>
            <GlassButton
              variant="ghost"
              onClick={handleCancel}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patient Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Paciente *
                </label>
                <div className="relative">
                  <GlassInput
                    placeholder="Digite o nome ou CPF do paciente..."
                    value={patientSearch}
                    onChange={setPatientSearch}
                    icon={<Heart className="w-4 h-4" />}
                  />

                  {/* Patient dropdown */}
                  {patients.length > 0 && (
                    <GlassCard className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto">
                      {patients.map((patient) => (
                        <div
                          key={patient.id}
                          className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="flex items-center space-x-3">
                            <Heart className="w-4 h-4 text-medical-red" />
                            <div>
                              <p className="text-white font-medium">{patient.name}</p>
                              <p className="text-text-secondary text-sm">
                                CPF: {patient.cpf} | {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </GlassCard>
                  )}

                  {/* Selected patient info */}
                  {selectedPatient && (
                    <GlassCard className="mt-2 p-4 bg-medical-red/10 border-medical-red/30">
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-medical-red" />
                        <div>
                          <p className="text-white font-medium">{selectedPatient.name}</p>
                          <p className="text-text-secondary text-sm">
                            CPF: {selectedPatient.cpf} | Nascimento: {selectedPatient.birthDate ? new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  )}

                  {loadingPatients && (
                    <div className="flex items-center justify-center py-4">
                      <LoadingSpinner size="sm" />
                      <span className="text-text-secondary ml-2">Buscando pacientes...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Queixa Principal *
                </label>
                <GlassTextarea
                  placeholder="Descreva a queixa principal do paciente..."
                  value={triageData.chiefComplaint}
                  onChange={(value) => setTriageData(prev => ({ ...prev, chiefComplaint: value }))}
                  rows={3}
                />
              </div>

              {/* Clinical Presentation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Apresentação Clínica
                  </label>
                  <GlassSelect
                    value={triageData.presentation || 'walking'}
                    onChange={(value) => setTriageData(prev => ({ ...prev, presentation: value as any }))}
                    options={[
                      { value: 'walking', label: 'Andando' },
                      { value: 'walking_with_help', label: 'Andando com ajuda' },
                      { value: 'wheelchair', label: 'Cadeira de rodas' },
                      { value: 'stretcher', label: 'Maca' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Estado de Consciência
                  </label>
                  <GlassSelect
                    value={triageData.consciousness || 'alert'}
                    onChange={(value) => setTriageData(prev => ({ ...prev, consciousness: value as any }))}
                    options={[
                      { value: 'alert', label: 'Alerta' },
                      { value: 'confused', label: 'Confuso' },
                      { value: 'lethargic', label: 'Letárgico' },
                      { value: 'unconscious', label: 'Inconsciente' }
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Vital Signs and Priority Calculation */}
            <div className="space-y-6">
              {/* Vital Signs */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Thermometer className="w-5 h-5 mr-2" />
                  Sinais Vitais
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <GlassInput
                    label="Frequência Respiratória (rpm)"
                    type="number"
                    placeholder="FR"
                    value={triageData.respiratoryRate?.toString() || ''}
                    onChange={(value) => setTriageData(prev => ({ ...prev, respiratoryRate: value ? parseInt(value) : undefined }))}
                  />
                  <GlassInput
                    label="Frequência Cardíaca (bpm)"
                    type="number"
                    placeholder="FC"
                    value={triageData.heartRate?.toString() || ''}
                    onChange={(value) => setTriageData(prev => ({ ...prev, heartRate: value ? parseInt(value) : undefined }))}
                  />
                  <GlassInput
                    label="PAS (mmHg)"
                    type="number"
                    placeholder="Pressão Sistólica"
                    value={triageData.bloodPressureSystolic?.toString() || ''}
                    onChange={(value) => setTriageData(prev => ({ ...prev, bloodPressureSystolic: value ? parseInt(value) : undefined }))}
                  />
                  <GlassInput
                    label="PAD (mmHg)"
                    type="number"
                    placeholder="Pressão Diastólica"
                    value={triageData.bloodPressureDiastolic?.toString() || ''}
                    onChange={(value) => setTriageData(prev => ({ ...prev, bloodPressureDiastolic: value ? parseInt(value) : undefined }))}
                  />
                  <GlassInput
                    label="Temperatura (°C)"
                    type="number"
                    step="0.1"
                    placeholder="Temp"
                    value={triageData.temperature?.toString() || ''}
                    onChange={(value) => setTriageData(prev => ({ ...prev, temperature: value ? parseFloat(value) : undefined }))}
                  />
                  <GlassInput
                    label="SpO2 (%)"
                    type="number"
                    placeholder="Saturação"
                    value={triageData.oxygenSaturation?.toString() || ''}
                    onChange={(value) => setTriageData(prev => ({ ...prev, oxygenSaturation: value ? parseInt(value) : undefined }))}
                  />
                  <div className="col-span-2">
                    <GlassInput
                      label="Escala de Dor (0-10)"
                      type="number"
                      min="0"
                      max="10"
                      placeholder="Dor"
                      value={triageData.painScale?.toString() || ''}
                      onChange={(value) => setTriageData(prev => ({ ...prev, painScale: value ? parseInt(value) : undefined }))}
                    />
                  </div>
                </div>
              </div>

              {/* Priority Calculation */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Cálculo de Prioridade
                  </h3>
                  <GlassButton
                    variant="secondary"
                    onClick={handleCalculatePriority}
                    disabled={calculating || !triageData.chiefComplaint.trim()}
                    className="flex items-center space-x-2"
                  >
                    {calculating ? <LoadingSpinner size="sm" /> : <Calculator className="w-4 h-4" />}
                    <span>Calcular</span>
                  </GlassButton>
                </div>

                {calculatedResult && (
                  <GlassCard className="p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">Prioridade Calculada:</span>
                      <div className={`inline-block px-3 py-1 rounded text-sm font-medium border ${triageService.getPriorityColor(calculatedResult.priority)}`}>
                        {triageService.getPriorityLabel(calculatedResult.priority)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-text-secondary">
                        <strong>Tempo Recomendado:</strong> {calculatedResult.recommendedTime}
                      </p>
                      <p className="text-sm text-text-secondary">
                        <strong>Raciocínio:</strong> {calculatedResult.reasoning}
                      </p>
                      {calculatedResult.discriminators.length > 0 && (
                        <div>
                          <p className="text-sm text-text-secondary mb-1">
                            <strong>Discriminadores:</strong>
                          </p>
                          <ul className="text-sm text-white list-disc list-inside">
                            {calculatedResult.discriminators.map((disc, index) => (
                              <li key={index}>{disc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                )}

                {/* Override Option */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Prioridade Final (se diferente da calculada)
                  </label>
                  <GlassSelect
                    value={triageData.finalPriority || ''}
                    onChange={(value) => setTriageData(prev => ({ ...prev, finalPriority: value as any }))}
                    options={[
                      { value: '', label: 'Usar prioridade calculada' },
                      { value: 'immediate', label: 'Imediato' },
                      { value: 'very_urgent', label: 'Muito Urgente' },
                      { value: 'urgent', label: 'Urgente' },
                      { value: 'standard', label: 'Padrão' },
                      { value: 'non_urgent', label: 'Não Urgente' }
                    ]}
                  />

                  {triageData.finalPriority && triageData.finalPriority !== calculatedResult?.priority && (
                    <GlassTextarea
                      label="Justificativa da alteração de prioridade"
                      placeholder="Explique o motivo da alteração..."
                      value={triageData.overrideReason || ''}
                      onChange={(value) => setTriageData(prev => ({ ...prev, overrideReason: value }))}
                      className="mt-2"
                      rows={2}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Discriminators */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Discriminadores</h3>

            <div className="space-y-3">
              {currentDiscriminators.map((discriminator, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <GlassInput
                      placeholder={`Discriminador ${index + 1} (ex: dor intensa, sangramento, etc.)`}
                      value={discriminator}
                      onChange={(value) => updateDiscriminator(index, value)}
                    />
                  </div>
                  {currentDiscriminators.length > 1 && (
                    <GlassButton
                      variant="danger"
                      size="sm"
                      onClick={() => removeDiscriminator(index)}
                    >
                      Remover
                    </GlassButton>
                  )}
                </div>
              ))}

              <GlassButton
                variant="ghost"
                onClick={addDiscriminator}
                className="w-full"
              >
                + Adicionar Discriminador
              </GlassButton>
            </div>
          </div>

          {/* Observations */}
          <div className="mt-8">
            <GlassTextarea
              label="Observações Adicionais"
              placeholder="Informações adicionais relevantes para a triagem..."
              value={triageData.observations || ''}
              onChange={(value) => setTriageData(prev => ({ ...prev, observations: value }))}
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-white/10">
            <GlassButton
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </GlassButton>
            <GlassButton
              variant="primary"
              type="submit"
              disabled={loading || !triageData.patientId || !triageData.chiefComplaint.trim() || !triageData.finalPriority}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Salvar Triagem</span>
            </GlassButton>
          </div>
        </GlassCard>
      </form>
    </motion.div>
  );
};

export default ManchesterTriageForm;


