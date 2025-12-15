import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, FileText, User, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PrescriptionBuilder } from '@/components/prescriptions/PrescriptionBuilder';
import { 
  prescriptionService, 
  PrescriptionCreateData, 
  PrescriptionUpdateData,
  Medication 
} from '@/services/prescriptionService';
import { patientService, Patient } from '@/services/patientService';
import { useAuth } from '@/contexts/AuthContext';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';
import { mockPrescriptions, mockPatients } from '@/mocks';

export const PrescriptionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [formData, setFormData] = useState<PrescriptionCreateData>({
    patientId: '',
    professionalId: user?.id || '',
    medications: [],
    instructions: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      loadPrescription();
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (patientSearch.length >= 3) {
      searchPatients();
    } else {
      setPatients([]);
    }
  }, [patientSearch]);

  const loadPrescription = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const prescription = await prescriptionService.getPrescriptionById(id);

      setFormData({
        patientId: prescription.patientId,
        professionalId: prescription.professionalId,
        attendanceId: prescription.attendanceId,
        medications: prescription.medications,
        instructions: prescription.instructions || '',
        validUntil: prescription.validUntil.split('T')[0]
      });

      if (prescription.patient) {
        setSelectedPatient(prescription.patient as any);
        setPatientSearch(prescription.patient.name);
      }
    } catch (error: any) {
      console.error('Erro ao carregar prescrição:', error);
      toast.error(error?.message || 'Erro ao carregar prescrição');
      navigate('/dev/prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async () => {
    try {
      setLoadingPatient(true);
      const response = await patientService.searchPatients({
        query: patientSearch,
        limit: 10
      });
      setPatients(response.patients || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoadingPatient(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setPatientSearch(patient.name);
    setPatients([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.patientId) {
      newErrors.patientId = 'Paciente é obrigatório';
    }
    
    if (!formData.medications || formData.medications.length === 0) {
      newErrors.medications = 'Adicione pelo menos um medicamento';
    } else {
      formData.medications.forEach((med, index) => {
        if (!med.name?.trim()) {
          newErrors[`medications.${index}.name`] = 'Nome do medicamento é obrigatório';
        }
        if (!med.dosage?.trim()) {
          newErrors[`medications.${index}.dosage`] = 'Dosagem é obrigatória';
        }
        if (!med.frequency?.trim()) {
          newErrors[`medications.${index}.frequency`] = 'Frequência é obrigatória';
        }
        if (!med.duration?.trim()) {
          newErrors[`medications.${index}.duration`] = 'Duração é obrigatória';
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Corrija os erros antes de continuar');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing && id) {
        const updateData: PrescriptionUpdateData = {
          medications: formData.medications,
          instructions: formData.instructions,
          validUntil: formData.validUntil
        };
        await prescriptionService.updatePrescription(id, updateData);
        toast.success('Prescrição atualizada com sucesso!');
      } else {
        await prescriptionService.createPrescription(formData);
        toast.success('Prescrição criada com sucesso!');
      }
      
      navigate('/dev/prescriptions');
    } catch (error: any) {
      if (isDevMode) {
        toast.success(`Prescrição ${isEditing ? 'atualizada' : 'criada'} (modo dev - simulado)`);
        navigate('/dev/prescriptions');
      } else {
        toast.error(error?.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} prescrição`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dev/prescriptions');
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-4 mb-4">
            <GlassButton
              variant="ghost"
              onClick={handleCancel}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </GlassButton>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-medical-blue" />
            {isEditing ? 'Editar Prescrição' : 'Nova Prescrição'}
          </h1>
          <p className="text-text-secondary">
            {isEditing ? 'Atualize os dados da prescrição' : 'Crie uma nova prescrição médica'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit}>
            <GlassCard className="p-6 space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Paciente *
                </label>
                <div className="relative">
                  <GlassInput
                    placeholder="Buscar paciente por nome ou CPF..."
                    value={patientSearch}
                    onChange={setPatientSearch}
                    icon={<Search className="w-4 h-4" />}
                    error={errors.patientId}
                    required
                  />
                  
                  {patients.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {patients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => handlePatientSelect(patient)}
                          className="p-3 hover:bg-white/20 cursor-pointer border-b border-white/10 last:border-0"
                        >
                          <p className="text-white font-medium">{patient.name}</p>
                          <p className="text-text-secondary text-sm">CPF: {patient.cpf}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedPatient && (
                    <div className="mt-2 p-3 bg-medical-blue/20 rounded-lg border border-medical-blue/30">
                      <p className="text-white font-medium">{selectedPatient.name}</p>
                      <p className="text-text-secondary text-sm">CPF: {selectedPatient.cpf}</p>
                      {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                        <p className="text-medical-red text-sm mt-1">
                          ⚠️ Alergias: {selectedPatient.allergies.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Valid Until */}
              <div>
                <GlassInput
                  label="Válida até *"
                  type="date"
                  value={formData.validUntil}
                  onChange={(value) => setFormData(prev => ({ ...prev, validUntil: value }))}
                  required
                />
              </div>

              {/* Medications Builder */}
              <div>
                <PrescriptionBuilder
                  medications={formData.medications}
                  onChange={(medications) => setFormData(prev => ({ ...prev, medications }))}
                  patientAllergies={selectedPatient?.allergies || []}
                  errors={errors}
                />
                {errors.medications && (
                  <p className="text-medical-red text-sm mt-2">{errors.medications}</p>
                )}
              </div>

              {/* Instructions */}
              <div>
                <GlassInput
                  label="Instruções Gerais"
                  placeholder="Orientações gerais sobre a prescrição..."
                  value={formData.instructions || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, instructions: value }))}
                  multiline
                  rows={4}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <GlassButton
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </GlassButton>
                
                <GlassButton
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Atualizar' : 'Criar'} Prescrição</span>
                </GlassButton>
              </div>
            </GlassCard>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PrescriptionFormPage;

