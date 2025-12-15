import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Save, X, Search } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { AttendanceCreateData } from '@/services/attendanceService';
import { patientService, Patient } from '@/services/patientService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface AttendanceFormProps {
  onSubmit: (data: AttendanceCreateData) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  className = ''
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<AttendanceCreateData>({
    patientId: '',
    professionalId: user?.id || '',
    establishmentId: user?.establishmentId || '',
    type: 'consultation',
    chiefComplaint: '',
    notes: ''
  });
  
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Buscar pacientes quando digitar
  useEffect(() => {
    if (patientSearch.length >= 3) {
      searchPatients();
    } else {
      setPatients([]);
    }
  }, [patientSearch]);

  const searchPatients = async () => {
    try {
      setSearchingPatient(true);
      const response = await patientService.searchPatients({
        query: patientSearch,
        limit: 10
      });
      setPatients(response.patients || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setSearchingPatient(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setPatientSearch(patient.name);
    setPatients([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.patientId) newErrors.patientId = 'Paciente é obrigatório';
    if (!formData.chiefComplaint.trim()) newErrors.chiefComplaint = 'Queixa principal é obrigatória';
    if (!formData.type) newErrors.type = 'Tipo de atendimento é obrigatório';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Paciente */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Paciente <span className="text-medical-red">*</span>
          </label>
          
          {selectedPatient ? (
            <GlassCard className="p-4 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{selectedPatient.name}</p>
                  <p className="text-sm text-text-secondary">CPF: {selectedPatient.cpf}</p>
                </div>
                <GlassButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(null);
                    setFormData(prev => ({ ...prev, patientId: '' }));
                    setPatientSearch('');
                  }}
                >
                  <X className="w-4 h-4" />
                </GlassButton>
              </div>
            </GlassCard>
          ) : (
            <div className="relative">
              <GlassInput
                placeholder="Buscar paciente por nome ou CPF..."
                value={patientSearch}
                onChange={setPatientSearch}
                icon={<Search className="w-5 h-5" />}
                error={errors.patientId}
              />
              
              {patients.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
                    >
                      <p className="font-medium text-white">{patient.name}</p>
                      <p className="text-sm text-text-secondary">CPF: {patient.cpf}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tipo de Atendimento */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Tipo de Atendimento <span className="text-medical-red">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
          >
            <option value="consultation">Consulta</option>
            <option value="emergency">Emergência</option>
            <option value="procedure">Procedimento</option>
            <option value="surgery">Cirurgia</option>
            <option value="exam">Exame</option>
            <option value="vaccination">Vacinação</option>
          </select>
          {errors.type && (
            <p className="text-sm text-medical-red mt-1">{errors.type}</p>
          )}
        </div>

        {/* Queixa Principal */}
        <GlassInput
          label="Queixa Principal"
          placeholder="Descreva a queixa principal do paciente..."
          value={formData.chiefComplaint}
          onChange={(value) => {
            setFormData(prev => ({ ...prev, chiefComplaint: value }));
            if (errors.chiefComplaint) {
              setErrors(prev => ({ ...prev, chiefComplaint: '' }));
            }
          }}
          multiline
          rows={4}
          required
          error={errors.chiefComplaint}
        />

        {/* Observações */}
        <GlassInput
          label="Observações (opcional)"
          placeholder="Observações adicionais..."
          value={formData.notes || ''}
          onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
          multiline
          rows={3}
        />

        {/* Botões */}
        <div className="flex justify-end space-x-3">
          <GlassButton
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </GlassButton>
          
          <GlassButton
            type="submit"
            variant="primary"
            loading={loading}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Iniciar Atendimento
          </GlassButton>
        </div>
      </form>
    </div>
  );
};


