import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import PatientForm from '@/components/patients/PatientForm';
import { patientService, PatientCreateData } from '@/services/patientService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const PatientFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isDevMode } = useDevMode();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<Partial<PatientCreateData> | undefined>(undefined);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode && id) {
      loadPatient();
    }
  }, [id, isEditMode]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const patientData = await patientService.getPatientById(id!);
      
      // Converter para formato do formulário
      setPatient({
        name: patientData.name,
        cpf: patientData.cpf,
        rg: patientData.rg,
        birthDate: patientData.birthDate.split('T')[0], // Converter para formato date
        gender: patientData.gender,
        maritalStatus: patientData.maritalStatus,
        motherName: patientData.motherName,
        fatherName: patientData.fatherName,
        street: patientData.street,
        number: patientData.number,
        complement: patientData.complement,
        neighborhood: patientData.neighborhood,
        city: patientData.city,
        state: patientData.state,
        zipCode: patientData.zipCode,
        phone: patientData.phone,
        email: patientData.email,
        bloodType: patientData.bloodType,
        allergies: patientData.allergies,
        chronicConditions: patientData.chronicConditions,
        height: patientData.height,
        weight: patientData.weight,
      });
    } catch (error: any) {
      console.error('Erro ao carregar paciente:', error);
      toast.error(error?.message || 'Erro ao carregar paciente');
      navigate('/dev/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PatientCreateData) => {
    try {
      setLoading(true);
      
      if (isEditMode && id) {
        await patientService.updatePatient(id, data);
        toast.success('Paciente atualizado com sucesso!');
      } else {
        await patientService.createPatient(data);
        toast.success('Paciente cadastrado com sucesso!');
      }
      
      navigate('/dev/patients');
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);
      
      // Em modo dev, simular sucesso
      if (isDevMode) {
        toast.success('Paciente salvo (modo dev - simulado)');
        setTimeout(() => navigate('/dev/patients'), 1000);
      } else {
        toast.error(error?.message || 'Erro ao salvar paciente');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dev/patients');
  };

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
          
          <h1 className="text-3xl font-bold text-white">
            {isEditMode ? 'Editar Paciente' : 'Novo Paciente'}
          </h1>
          <p className="text-text-secondary">
            {isEditMode ? 'Atualize as informações do paciente' : 'Preencha os dados para cadastrar um novo paciente'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <PatientForm
              patient={patient}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientFormPage;


