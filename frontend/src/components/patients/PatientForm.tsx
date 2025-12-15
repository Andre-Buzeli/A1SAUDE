import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save, X } from 'lucide-react';
import { GlassForm, GlassInput, GlassButton } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

interface PatientFormData {
  name: string;
  cpf: string;
  rg?: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
  motherName?: string;
  fatherName?: string;
  
  // Address
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Contact
  phone?: string;
  email?: string;
  
  // Medical info
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  height?: number;
  weight?: number;
}

interface PatientFormProps {
  patient?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  loading = false,
  className = ''
}) => {
  const { hasPermission } = useAuth();
  const [formData, setFormData] = useState<PatientFormData>({
    name: patient?.name || '',
    cpf: patient?.cpf || '',
    rg: patient?.rg || '',
    birthDate: patient?.birthDate || '',
    gender: patient?.gender || 'male',
    maritalStatus: patient?.maritalStatus || 'single',
    motherName: patient?.motherName || '',
    fatherName: patient?.fatherName || '',
    
    street: patient?.street || '',
    number: patient?.number || '',
    complement: patient?.complement || '',
    neighborhood: patient?.neighborhood || '',
    city: patient?.city || '',
    state: patient?.state || '',
    zipCode: patient?.zipCode || '',
    
    phone: patient?.phone || '',
    email: patient?.email || '',
    
    bloodType: patient?.bloodType || '',
    allergies: patient?.allergies || [],
    chronicConditions: patient?.chronicConditions || [],
    height: patient?.height || undefined,
    weight: patient?.weight || undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: keyof PatientFormData) => (value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
      if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
      if (!formData.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
    }

    if (step === 2) {
      if (!formData.street.trim()) newErrors.street = 'Logradouro é obrigatório';
      if (!formData.number.trim()) newErrors.number = 'Número é obrigatório';
      if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
      if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
      if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Dados Pessoais</h3>
      
      <GlassInput
        label="Nome Completo"
        value={formData.name}
        onChange={(value) => handleInputChange('name')(value)}
        error={errors.name}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassInput
          label="CPF"
          value={formatCpf(formData.cpf)}
          onChange={(value) => handleInputChange('cpf')(value.replace(/\D/g, ''))}
          error={errors.cpf}
          required
        />

        <GlassInput
          label="RG"
          value={formData.rg}
          onChange={(value) => handleInputChange('rg')(value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassInput
          label="Data de Nascimento"
          type="date"
          value={formData.birthDate}
          onChange={(value) => handleInputChange('birthDate')(value)}
          error={errors.birthDate}
          required
        />

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Sexo <span className="text-medical-red">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender')(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
          >
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Estado Civil</label>
          <select
            value={formData.maritalStatus}
            onChange={(e) => handleInputChange('maritalStatus')(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
          >
            <option value="single">Solteiro(a)</option>
            <option value="married">Casado(a)</option>
            <option value="divorced">Divorciado(a)</option>
            <option value="widowed">Viúvo(a)</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassInput
          label="Nome da Mãe"
          value={formData.motherName}
          onChange={(value) => handleInputChange('motherName')(value)}
        />

        <GlassInput
          label="Nome do Pai"
          value={formData.fatherName}
          onChange={(value) => handleInputChange('fatherName')(value)}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Endereço</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <GlassInput
            label="Logradouro"
            value={formData.street}
            onChange={(value) => handleInputChange('street')(value)}
            error={errors.street}
            required
          />
        </div>

        <GlassInput
          label="Número"
          value={formData.number}
          onChange={(value) => handleInputChange('number')(value)}
          error={errors.number}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassInput
          label="Complemento"
          value={formData.complement}
          onChange={(value) => handleInputChange('complement')(value)}
        />

        <GlassInput
          label="Bairro"
          value={formData.neighborhood}
          onChange={(value) => handleInputChange('neighborhood')(value)}
          error={errors.neighborhood}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassInput
          label="Cidade"
          value={formData.city}
          onChange={(value) => handleInputChange('city')(value)}
          error={errors.city}
          required
        />

        <GlassInput
          label="Estado"
          value={formData.state}
          onChange={(value) => handleInputChange('state')(value)}
          error={errors.state}
          required
        />

        <GlassInput
          label="CEP"
          value={formatZipCode(formData.zipCode)}
          onChange={(value) => handleInputChange('zipCode')(value.replace(/\D/g, ''))}
          error={errors.zipCode}
          required
        />
      </div>

      <h3 className="text-lg font-semibold text-white mb-4 mt-6">Contato</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassInput
          label="Telefone"
          value={formData.phone}
          onChange={(value) => handleInputChange('phone')(value)}
        />

        <GlassInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => handleInputChange('email')(value)}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Informações Médicas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">Tipo Sanguíneo</label>
          <select
            value={formData.bloodType}
            onChange={(e) => handleInputChange('bloodType')(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
          >
            <option value="">Selecione</option>
            <option value="A_POSITIVE">A+</option>
            <option value="A_NEGATIVE">A-</option>
            <option value="B_POSITIVE">B+</option>
            <option value="B_NEGATIVE">B-</option>
            <option value="AB_POSITIVE">AB+</option>
            <option value="AB_NEGATIVE">AB-</option>
            <option value="O_POSITIVE">O+</option>
            <option value="O_NEGATIVE">O-</option>
          </select>
        </div>

        <GlassInput
          label="Altura (cm)"
          type="number"
          value={formData.height?.toString() || ''}
          onChange={(value) => handleInputChange('height')(value ? parseFloat(value) : undefined)}
        />

        <GlassInput
          label="Peso (kg)"
          type="number"
          value={formData.weight?.toString() || ''}
          onChange={(value) => handleInputChange('weight')(value ? parseFloat(value) : undefined)}
        />
      </div>

      <GlassInput
        label="Alergias"
        placeholder="Digite as alergias separadas por vírgula"
        value={formData.allergies?.join(', ') || ''}
        onChange={(value) => handleInputChange('allergies')(value.split(',').map(s => s.trim()).filter(Boolean))}
      />

      <GlassInput
        label="Condições Crônicas"
        placeholder="Digite as condições crônicas separadas por vírgula"
        value={formData.chronicConditions?.join(', ') || ''}
        onChange={(value) => handleInputChange('chronicConditions')(value.split(',').map(s => s.trim()).filter(Boolean))}
      />
    </div>
  );

  const canWrite = hasPermission('medico:write') || hasPermission('enfermeiro:write');

  if (!canWrite) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">Você não tem permissão para cadastrar pacientes.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit}>
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-medical-blue text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-medical-blue' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <div>
            {currentStep > 1 && (
              <GlassButton
                type="button"
                variant="ghost"
                onClick={handlePrevious}
              >
                Anterior
              </GlassButton>
            )}
          </div>

          <div className="flex space-x-3">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </GlassButton>

            {currentStep < 3 ? (
              <GlassButton
                type="button"
                variant="primary"
                onClick={handleNext}
              >
                Próximo
              </GlassButton>
            ) : (
              <GlassButton
                type="submit"
                variant="primary"
                loading={loading}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{patient ? 'Atualizar' : 'Cadastrar'}</span>
              </GlassButton>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;