import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GlassButton from '@/components/ui/GlassButton';
import VitalSignsForm from '@/components/vital-signs/VitalSignsForm';
import { VitalSigns } from '@/services/vitalSignsService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const VitalSignsFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDevMode } = useDevMode();

  // Get patient and attendance IDs from URL params
  const patientId = searchParams.get('patientId');
  const attendanceId = searchParams.get('attendanceId');

  const handleSave = (vitalSigns: VitalSigns) => {
    // Navigate back to vital signs page or to patient detail
    if (patientId) {
      navigate(`/dev/patients/${patientId}`);
    } else {
      navigate('/dev/vital-signs');
    }
  };

  const handleCancel = () => {
    if (patientId) {
      navigate(`/dev/patients/${patientId}`);
    } else {
      navigate('/dev/vital-signs');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isDevMode && <DevModeBanner />}

      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="mb-6">
          <GlassButton
            variant="ghost"
            onClick={handleCancel}
            className="flex items-center space-x-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </GlassButton>

          <h1 className="text-3xl font-bold text-white mb-2">
            Registrar Sinais Vitais
          </h1>
          <p className="text-text-secondary">
            Registre os sinais vitais do paciente com análise automática de alertas
          </p>
        </div>

        {/* Form */}
        <VitalSignsForm
          patientId={patientId || undefined}
          attendanceId={attendanceId || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default VitalSignsFormPage;


