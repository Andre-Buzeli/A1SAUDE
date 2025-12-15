import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { AttendanceForm } from '@/components/attendances/AttendanceForm';
import { attendanceService, AttendanceCreateData } from '@/services/attendanceService';

export const AttendanceNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (data: AttendanceCreateData) => {
    try {
      setLoading(true);
      
      const attendance = await attendanceService.createAttendance(data);
      
      // Iniciar o atendimento automaticamente
      await attendanceService.startAttendance(attendance.id);
      
      toast.success('Atendimento criado e iniciado com sucesso!');
      navigate(`/dev/attendances/${attendance.id}`);
    } catch (error: any) {
      console.error('Erro ao criar atendimento:', error);
      toast.error(error?.message || 'Erro ao criar atendimento');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dev/attendances');
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
          
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Stethoscope className="w-8 h-8 mr-3 text-medical-blue" />
            Novo Atendimento
          </h1>
          <p className="text-text-secondary">
            Crie um novo atendimento e inicie o prontuário do paciente
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <AttendanceForm
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

export default AttendanceNewPage;

