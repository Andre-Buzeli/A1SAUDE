import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import logoA1Saude from '@/assets/logo-a1-saude.png';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrCpf: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const dashboardPath = await login(formData);
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="loading-spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-medical-blue/20 via-bg-primary to-medical-purple/20" />
      
      {/* Login form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="p-8">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-4"
            >
              <img
                src={logoA1Saude}
                alt="A1 Saúde Logo"
                className="w-20 h-20 mx-auto object-contain"
              />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">A1 Saúde</h1>
            <p className="text-text-secondary">Sistema de Gestão de Saúde Pública</p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-medical-red/20 border border-medical-red/30 rounded-lg flex items-center"
            >
              <AlertCircle className="w-5 h-5 text-medical-red mr-3" />
              <span className="text-red-100 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <GlassInput
              label="Email ou CPF"
              type="text"
              placeholder="Digite seu email ou CPF"
              value={formData.emailOrCpf}
              onChange={handleInputChange('emailOrCpf')}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <GlassInput
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={handleInputChange('password')}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                className="w-4 h-4 text-medical-blue bg-white/10 border-white/20 rounded focus:ring-medical-blue/50"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-text-secondary">
                Lembrar de mim
              </label>
            </div>

            {/* Submit button */}
            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={!formData.emailOrCpf || !formData.password}
              className="w-full"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </GlassButton>
          </form>

          {/* Dev mode access without backend */}
          <div className="mt-4">
            <GlassButton
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => navigate('/dev')}
            >
              Explorar em Modo Dev (sem login)
            </GlassButton>
          </div>

          {/* Footer links */}
          <div className="mt-6 text-center">
            <button className="text-sm text-medical-blue hover:text-medical-blue/80 transition-colors">
              Esqueceu sua senha?
            </button>
          </div>
        </GlassCard>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-text-muted text-sm"
        >
          © 2024 A1 Saúde. Todos os direitos reservados.
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
