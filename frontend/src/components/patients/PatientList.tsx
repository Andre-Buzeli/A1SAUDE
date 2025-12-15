import React, { useState } from 'react';
import { User, Calendar, Phone, FileText } from 'lucide-react';
import { GlassCard, GlassButton, GlassTable, GlassModal } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { Patient } from '@/services/patientService';

interface PatientListProps {
  patients: Patient[];
  onPatientSelect?: (patient: Patient) => void;
  onPatientCreate?: () => void;
  loading?: boolean;
  className?: string;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  onPatientSelect,
  onPatientCreate,
  loading = false,
  className = ''
}) => {
  const { hasPermission } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro'
    };
    return labels[gender] || gender;
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
    onPatientSelect?.(patient);
  };

  const columns = [
    {
      key: 'name' as keyof Patient,
      label: 'Nome',
      render: (value: any, patient: Patient) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medical-blue/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-medical-blue" />
          </div>
          <div>
            <p className="font-medium text-white">{patient.name}</p>
            <p className="text-sm text-text-secondary">{formatCpf(patient.cpf)}</p>
          </div>
        </div>
      )
    },
    {
      key: 'birthDate' as keyof Patient,
      label: 'Idade',
      render: (value: any, patient: Patient) => (
        <div>
          <p className="text-white">{calculateAge(patient.birthDate)} anos</p>
          <p className="text-sm text-text-secondary">{getGenderLabel(patient.gender)}</p>
        </div>
      )
    },
    {
      key: 'phone' as keyof Patient,
      label: 'Contato',
      render: (value: any, patient: Patient) => (
        <div>
          {patient.phone && (
            <div className="flex items-center space-x-2 text-white">
              <Phone className="w-4 h-4" />
              <span>{patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <p className="text-sm text-text-secondary">{patient.email}</p>
          )}
        </div>
      )
    },
    {
      key: 'lastAttendance' as keyof Patient,
      label: 'Último Atendimento',
      render: (value: any, patient: Patient) => (
        <div>
          {patient.lastAttendance ? (
            <>
              <p className="text-white">{formatDate(patient.lastAttendance)}</p>
              <p className="text-sm text-text-secondary">
                {patient._count?.attendances || 0} atendimentos
              </p>
            </>
          ) : (
            <p className="text-text-secondary">Nenhum atendimento</p>
          )}
        </div>
      )
    },
    {
      key: '_count' as keyof Patient,
      label: 'Histórico',
      render: (value: any, patient: Patient) => (
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <p className="text-medical-blue font-medium">{patient._count?.prescriptions || 0}</p>
            <p className="text-text-secondary">Prescrições</p>
          </div>
          <div className="text-center">
            <p className="text-medical-green font-medium">{patient._count?.examRequests || 0}</p>
            <p className="text-text-secondary">Exames</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className={className}>
      {/* Patient Table */}
      <GlassTable
        data={patients}
        columns={columns}
        onRowClick={handlePatientClick}
        loading={loading}
        emptyMessage="Nenhum paciente encontrado"
      />

      {/* Patient Details Modal */}
      <GlassModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        title="Detalhes do Paciente"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-medical-blue/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-medical-blue" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{selectedPatient.name}</h3>
                <p className="text-text-secondary">{formatCpf(selectedPatient.cpf)}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="text-white">
                    {calculateAge(selectedPatient.birthDate)} anos
                  </span>
                  <span className="text-text-secondary">
                    {getGenderLabel(selectedPatient.gender)}
                  </span>
                  <span className="text-text-secondary">
                    {formatDate(selectedPatient.birthDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <GlassCard className="p-4">
              <h4 className="font-medium text-white mb-3">Contato</h4>
              <div className="space-y-2">
                {selectedPatient.phone && (
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <Phone className="w-4 h-4" />
                    <span>{selectedPatient.phone}</span>
                  </div>
                )}
                {selectedPatient.email && (
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <span>📧</span>
                    <span>{selectedPatient.email}</span>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Medical History Summary */}
            <GlassCard className="p-4">
              <h4 className="font-medium text-white mb-3">Resumo do Histórico</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-medical-blue">
                    {selectedPatient._count?.attendances || 0}
                  </p>
                  <p className="text-sm text-text-secondary">Atendimentos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-medical-green">
                    {selectedPatient._count?.prescriptions || 0}
                  </p>
                  <p className="text-sm text-text-secondary">Prescrições</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-medical-orange">
                    {selectedPatient._count?.examRequests || 0}
                  </p>
                  <p className="text-sm text-text-secondary">Exames</p>
                </div>
              </div>
            </GlassCard>

            {/* Actions */}
            <div className="flex space-x-3">
              <GlassButton
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Novo Atendimento</span>
              </GlassButton>
              <GlassButton
                variant="ghost"
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Histórico</span>
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};

export { PatientList };