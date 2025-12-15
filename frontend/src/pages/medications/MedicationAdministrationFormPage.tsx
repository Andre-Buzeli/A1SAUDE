import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import { MedicationAdministrationForm } from '@/components/medications/MedicationAdministrationForm';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const MedicationAdministrationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDevMode } = useDevMode();

  const handleSuccess = () => {
    navigate('/dev/medications');
  };

  const handleCancel = () => {
    navigate('/dev/medications');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isDevMode && <DevModeBanner />}

      <div className="container mx-auto px-4 py-8 pt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Pill className="w-8 h-8 mr-3 text-medical-green" />
            Nova Administração
          </h1>
          <p className="text-text-secondary">
            Registre a administração de medicamentos para pacientes
          </p>
        </motion.div>

        <MedicationAdministrationForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default MedicationAdministrationFormPage;


