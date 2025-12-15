import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Pill, User, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassTextarea from '@/components/ui/GlassTextarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { medicationService, MedicationCreateData } from '@/services/medicationService';
import { patientService, Patient } from '@/services/patientService';

interface MedicationAdministrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const MedicationAdministrationForm: React.FC<MedicationAdministrationFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Patient selection
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Medication data
  const [medicationData, setMedicationData] = useState<MedicationCreateData>({
    patientId: '',
    medicationName: '',
    dosage: '',
    route: 'oral',
    frequency: '',
    scheduledFor: ''
  });

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
    setMedicationData(prev => ({ ...prev, patientId: patient.id }));
    setPatientSearch(patient.name);
    setPatients([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicationData.patientId) {
      toast.error('Selecione um paciente');
      return;
    }

    if (!medicationData.medicationName.trim()) {
      toast.error('Nome do medicamento é obrigatório');
      return;
    }

    if (!medicationData.dosage.trim()) {
      toast.error('Dosagem é obrigatória');
      return;
    }

    if (!medicationData.frequency.trim()) {
      toast.error('Frequência é obrigatória');
      return;
    }

    if (!medicationData.scheduledFor) {
      toast.error('Horário de administração é obrigatório');
      return;
    }

    try {
      setLoading(true);
      await medicationService.createMedicationAdministration(medicationData);

      toast.success('Administração de medicamento registrada com sucesso!');

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dev/medications');
      }
    } catch (error: any) {
      console.error('Erro ao registrar administração:', error);
      toast.error(error?.message || 'Erro ao registrar administração');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/dev/medications');
    }
  };

  const routeOptions = [
    { value: 'oral', label: 'Oral' },
    { value: 'intravenosa', label: 'Intravenosa' },
    { value: 'intramuscular', label: 'Intramuscular' },
    { value: 'subcutanea', label: 'Subcutânea' },
    { value: 'topica', label: 'Tópica' },
    { value: 'retal', label: 'Retal' },
    { value: 'inalatoria', label: 'Inalatória' },
    { value: 'ocular', label: 'Ocular' },
    { value: 'otologica', label: 'Otológica' },
    { value: 'nasal', label: 'Nasal' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit}>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Pill className="w-6 h-6 mr-3 text-medical-green" />
              Administração de Medicamento
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
                    icon={<User className="w-4 h-4" />}
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
                            <User className="w-4 h-4 text-medical-red" />
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
                        <User className="w-5 h-5 text-medical-red" />
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

              {/* Medication Details */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Medicamento *
                </label>
                <GlassInput
                  placeholder="Nome do medicamento"
                  value={medicationData.medicationName}
                  onChange={(value) => setMedicationData(prev => ({ ...prev, medicationName: value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Dosagem *
                  </label>
                  <GlassInput
                    placeholder="Ex: 500mg, 10ml, 1 comprimido"
                    value={medicationData.dosage}
                    onChange={(value) => setMedicationData(prev => ({ ...prev, dosage: value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Via de Administração *
                  </label>
                  <GlassSelect
                    value={medicationData.route}
                    onChange={(value) => setMedicationData(prev => ({ ...prev, route: value as any }))}
                    options={routeOptions}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Frequência *
                </label>
                <GlassInput
                  placeholder="Ex: A cada 8 horas, 3x ao dia, Uma vez ao dia"
                  value={medicationData.frequency}
                  onChange={(value) => setMedicationData(prev => ({ ...prev, frequency: value }))}
                />
              </div>
            </div>

            {/* Administration Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Horário de Administração *
                </label>
                <GlassInput
                  type="datetime-local"
                  value={medicationData.scheduledFor}
                  onChange={(value) => setMedicationData(prev => ({ ...prev, scheduledFor: value }))}
                  icon={<Clock className="w-4 h-4" />}
                />
                <p className="text-xs text-text-secondary mt-1">
                  Defina quando o medicamento deve ser administrado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Observações
                </label>
                <GlassTextarea
                  placeholder="Observações sobre a administração (opcional)"
                  value={medicationData.notes || ''}
                  onChange={(value) => setMedicationData(prev => ({ ...prev, notes: value }))}
                  rows={4}
                />
              </div>

              {/* Preview Card */}
              <GlassCard className="p-4 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Resumo da Administração
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Paciente:</span>
                    <span className="text-white">{selectedPatient?.name || 'Não selecionado'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-secondary">Medicamento:</span>
                    <span className="text-white">{medicationData.medicationName || 'Não informado'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-secondary">Dosagem:</span>
                    <span className="text-white">{medicationData.dosage || 'Não informado'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-secondary">Via:</span>
                    <span className="text-white">{medicationService.getRouteLabel(medicationData.route)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-secondary">Horário:</span>
                    <span className="text-white">
                      {medicationData.scheduledFor ?
                        new Date(medicationData.scheduledFor).toLocaleString('pt-BR') :
                        'Não definido'
                      }
                    </span>
                  </div>
                </div>
              </GlassCard>
            </div>
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
              disabled={loading || !medicationData.patientId || !medicationData.medicationName.trim()}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Registrar Administração</span>
            </GlassButton>
          </div>
        </GlassCard>
      </form>
    </motion.div>
  );
};

export default MedicationAdministrationForm;


