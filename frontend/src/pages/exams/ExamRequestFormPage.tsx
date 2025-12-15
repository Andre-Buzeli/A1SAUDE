import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TestTube } from 'lucide-react';
import { ExamRequestForm } from '@/components/exams/ExamRequestForm';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const ExamRequestFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { attendanceId } = useParams<{ attendanceId: string }>();
  const { isDevMode } = useDevMode();

  const handleSuccess = () => {
    navigate('/dev/exams');
  };

  const handleCancel = () => {
    navigate('/dev/exams');
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
            <TestTube className="w-8 h-8 mr-3 text-medical-blue" />
            Novo Exame
          </h1>
          <p className="text-text-secondary">
            Solicite exames laboratoriais, de imagem ou outros tipos de exames
          </p>
        </motion.div>

        <ExamRequestForm
          attendanceId={attendanceId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default ExamRequestFormPage;


