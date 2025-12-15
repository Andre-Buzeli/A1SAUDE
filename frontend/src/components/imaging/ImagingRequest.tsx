import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Stethoscope,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Save,
  X,
  Search,
  Plus,
  MapPin
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { useImaging } from '@/hooks/useImaging';
import { ImagingExam, ImagingExamType } from '@/types/imaging';

interface ImagingRequestProps {
  patientId?: string;
  patientName?: string;
  onRequested?: (exam: ImagingExam) => void;
  onCancel?: () => void;
}

const ImagingRequest: React.FC<ImagingRequestProps> = ({
  patientId,
  patientName,
  onRequested,
  onCancel
}) => {
  const { requestExam, loading } = useImaging();

  const [form, setForm] = useState({
    // Patient Info
    patientId: patientId || '',
    patientName: patientName || '',
    patientAge: '',
    patientGender: 'M' as 'M' | 'F',

    // Request Info
    requestedBy: '',
    requestedByName: '',
    requestingDepartment: '',
    clinicalIndication: '',
    urgency: 'routine' as 'routine' | 'urgent' | 'emergency',

    // Exam Details
    examTypeId: '',
    examName: '',
    bodyRegion: [] as string[],
    laterality: '' as '' | 'bilateral' | 'left' | 'right',
    contrast: false,
    contrastType: '',

    // Additional
    notes: '',
    specialRequirements: ''
  });

  const [availableExamTypes, setAvailableExamTypes] = useState<ImagingExamType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState<ImagingExamType | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Mock exam types
  useEffect(() => {
    const mockExamTypes: ImagingExamType[] = [
      {
        id: 'rx-chest',
        code: 'CH',
        name: 'Raio-X de Tórax',
        category: 'radiography',
        description: 'Radiografia do tórax PA e perfil',
        preparation: 'Remover objetos metálicos do tórax',
        contraindications: [],
        radiationDose: 0.1,
        typicalDuration: 15,
        requiresContrast: false,
        active: true
      },
      {
        id: 'us-abdomen',
        code: 'US-ABD',
        name: 'Ultrassonografia de Abdome Total',
        category: 'ultrasound',
        description: 'Ultrassonografia completa do abdome',
        preparation: 'Jejum de 8 horas, bexiga cheia',
        contraindications: [],
        typicalDuration: 30,
        requiresContrast: false,
        active: true
      },
      {
        id: 'ct-brain',
        code: 'CT-BRAIN',
        name: 'Tomografia de Crânio sem Contraste',
        category: 'ct',
        description: 'Tomografia computadorizada do crânio',
        preparation: 'Nenhuma preparação específica',
        contraindications: ['Gestante', 'Alergia ao contraste (se solicitado)'],
        radiationDose: 2.0,
        typicalDuration: 20,
        requiresContrast: false,
        active: true
      },
      {
        id: 'mri-spine',
        code: 'MRI-SPINE',
        name: 'Ressonância de Coluna Lombar',
        category: 'mri',
        description: 'Ressonância magnética da coluna lombar',
        preparation: 'Remover objetos metálicos',
        contraindications: ['Marca-passo', 'Claustrofobia', 'Corpo estranho metálico'],
        typicalDuration: 45,
        requiresContrast: false,
        active: true
      },
      {
        id: 'mammo-bilateral',
        code: 'MAMMO',
        name: 'Mamografia Bilateral',
        category: 'mammography',
        description: 'Mamografia de ambas as mamas',
        preparation: 'Agendar fora do período menstrual',
        contraindications: ['Gestante'],
        radiationDose: 0.4,
        typicalDuration: 20,
        requiresContrast: false,
        active: true
      }
    ];
    setAvailableExamTypes(mockExamTypes);
  }, []);

  const filteredExamTypes = availableExamTypes.filter(examType =>
    examType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    examType.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.patientName.trim()) errors.patientName = 'Nome do paciente é obrigatório';
    if (!form.clinicalIndication.trim()) errors.clinicalIndication = 'Indicação clínica é obrigatória';
    if (!form.examTypeId) errors.examTypeId = 'Tipo de exame é obrigatório';
    if (!form.requestedByName.trim()) errors.requestedByName = 'Médico solicitante é obrigatório';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleExamTypeSelect = (examType: ImagingExamType) => {
    setSelectedExamType(examType);
    setForm(prev => ({
      ...prev,
      examTypeId: examType.id,
      examName: examType.name,
      bodyRegion: [], // Reset body regions
      laterality: '',
      contrast: false
    }));
    setSearchTerm('');
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedExamType) {
      return;
    }

    try {
      const examData = {
        patientId: form.patientId || `temp-${Date.now()}`,
        patientName: form.patientName,
        patientAge: parseInt(form.patientAge) || 0,
        patientGender: form.patientGender,
        patientBirthDate: new Date(Date.now() - (parseInt(form.patientAge) || 30) * 365 * 24 * 60 * 60 * 1000),

        requestedBy: form.requestedBy || 'current-user',
        requestedByName: form.requestedByName,
        requestingDepartment: form.requestingDepartment,
        clinicalIndication: form.clinicalIndication,
        urgency: form.urgency,

        examType: selectedExamType,
        examCode: selectedExamType.code,
        examName: selectedExamType.name,
        bodyRegion: form.bodyRegion,
        laterality: form.laterality as 'bilateral' | 'left' | 'right' | null,
        contrast: form.contrast,
        contrastType: form.contrast ? form.contrastType : undefined,

        technicianId: 'auto-assign',
        technicianName: 'Técnico Automático',
        equipmentId: 'auto-assign',
        equipmentName: 'Equipamento Automático',
        roomNumber: 'Auto'
      };

      const result = await requestExam(examData);

      if (result.success && onRequested) {
        onRequested(result.exam!);
      }
    } catch (error) {
      console.error('Erro ao solicitar exame:', error);
    }
  };

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const commonBodyRegions = [
    'Crânio', 'Face', 'Coluna Cervical', 'Coluna Torácica', 'Coluna Lombar',
    'Tórax', 'Abdome', 'Pelve', 'Membro Superior Direito', 'Membro Superior Esquerdo',
    'Membro Inferior Direito', 'Membro Inferior Esquerdo', 'Articulação'
  ];

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Solicitar Exame de Imagem</h3>
            <p className="text-white/70 text-sm">
              Preencha os dados para solicitar um exame de imagem
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onCancel && (
              <GlassButton onClick={onCancel} variant="secondary">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </GlassButton>
            )}
            <GlassButton
              onClick={handleSubmit}
              disabled={loading}
              variant="primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Solicitando...' : 'Solicitar Exame'}
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Patient Information */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Informações do Paciente
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassInput
            label="Nome do Paciente *"
            placeholder="Digite o nome completo"
            value={form.patientName}
            onChange={(value) => updateForm('patientName', value)}
            error={validationErrors.patientName}
            required
          />

          <GlassInput
            label="Idade"
            type="number"
            placeholder="Ex: 45"
            value={form.patientAge}
            onChange={(value) => updateForm('patientAge', value)}
          />

          <div>
            <label className="block text-white/80 text-sm mb-2">Gênero</label>
            <select
              value={form.patientGender}
              onChange={(e) => updateForm('patientGender', e.target.value as 'M' | 'F')}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          <GlassInput
            label="ID do Paciente"
            placeholder="ID interno do paciente"
            value={form.patientId}
            onChange={(value) => updateForm('patientId', value)}
          />
        </div>
      </GlassCard>

      {/* Request Information */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Informações da Solicitação
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Médico Solicitante *"
            placeholder="Nome do médico"
            value={form.requestedByName}
            onChange={(value) => updateForm('requestedByName', value)}
            error={validationErrors.requestedByName}
            required
          />

          <GlassInput
            label="Departamento"
            placeholder="Ex: Clínica Médica"
            value={form.requestingDepartment}
            onChange={(value) => updateForm('requestingDepartment', value)}
          />

          <div className="md:col-span-2">
            <label className="block text-white/80 text-sm mb-2">
              Indicação Clínica *
            </label>
            <textarea
              value={form.clinicalIndication}
              onChange={(e) => updateForm('clinicalIndication', e.target.value)}
              placeholder="Descreva a indicação clínica para o exame..."
              className={`w-full bg-white/10 border rounded px-3 py-2 text-white resize-none ${
                validationErrors.clinicalIndication ? 'border-red-500' : 'border-white/20'
              }`}
              rows={3}
              required
            />
            {validationErrors.clinicalIndication && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.clinicalIndication}</p>
            )}
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Urgência</label>
            <select
              value={form.urgency}
              onChange={(e) => updateForm('urgency', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            >
              <option value="routine">Rotina</option>
              <option value="urgent">Urgente</option>
              <option value="emergency">Emergência</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Exam Selection */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Seleção do Exame
        </h4>

        {!selectedExamType ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar tipo de exame..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {filteredExamTypes.map((examType) => (
                <div
                  key={examType.id}
                  onClick={() => handleExamTypeSelect(examType)}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-medium">{examType.name}</h5>
                    <span className="text-white/60 text-sm">{examType.code}</span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{examType.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-white/60">
                    <span>⏱️ {examType.typicalDuration}min</span>
                    <span>📊 {examType.category}</span>
                    {examType.radiationDose && (
                      <span>☢️ {examType.radiationDose}mSv</span>
                    )}
                  </div>
                  {examType.preparation && (
                    <p className="text-yellow-400 text-xs mt-2">
                      ⚠️ {examType.preparation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {validationErrors.examTypeId && (
              <p className="text-red-400 text-sm">{validationErrors.examTypeId}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-medical-blue/10 border border-medical-blue/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-white font-medium">{selectedExamType.name}</h5>
                <GlassButton
                  onClick={() => setSelectedExamType(null)}
                  variant="ghost"
                  size="sm"
                >
                  Trocar
                </GlassButton>
              </div>
              <p className="text-white/70 text-sm">{selectedExamType.description}</p>
              <div className="flex items-center space-x-4 text-xs text-white/60 mt-2">
                <span>⏱️ {selectedExamType.typicalDuration}min</span>
                <span>📊 {selectedExamType.category}</span>
                {selectedExamType.radiationDose && (
                  <span>☢️ {selectedExamType.radiationDose}mSv</span>
                )}
              </div>
            </div>

            {/* Exam Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Região Anatômica</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {commonBodyRegions.map((region) => (
                    <label key={region} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.bodyRegion.includes(region)}
                        onChange={(e) => {
                          const newRegions = e.target.checked
                            ? [...form.bodyRegion, region]
                            : form.bodyRegion.filter(r => r !== region);
                          updateForm('bodyRegion', newRegions);
                        }}
                        className="rounded border-white/20"
                      />
                      <span className="text-white/70">{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Lateralidade</label>
                <select
                  value={form.laterality}
                  onChange={(e) => updateForm('laterality', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                >
                  <option value="">Não especificado</option>
                  <option value="bilateral">Bilateral</option>
                  <option value="left">Esquerdo</option>
                  <option value="right">Direito</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Contraste</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.contrast}
                      onChange={(e) => updateForm('contrast', e.target.checked)}
                      className="rounded border-white/20"
                    />
                    <span className="text-white/70 text-sm">Utilizar contraste</span>
                  </label>
                  {form.contrast && (
                    <select
                      value={form.contrastType}
                      onChange={(e) => updateForm('contrastType', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="iodine">Iodo (TC)</option>
                      <option value="gadolinium">Gadolínio (RM)</option>
                      <option value="barium">Bário (RX)</option>
                      <option value="microbubbles">Microbolhas (US)</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Additional Information */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Informações Adicionais
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <GlassInput
              label="Requisitos Especiais"
              placeholder="Equipamentos especiais, posições específicas..."
              value={form.specialRequirements}
              onChange={(value) => updateForm('specialRequirements', value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-white/80 text-sm mb-2">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              placeholder="Observações adicionais sobre o exame..."
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white resize-none"
              rows={3}
            />
          </div>
        </div>

        {selectedExamType && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h5 className="text-blue-400 font-medium mb-2">Informações do Exame Selecionado</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/80">Duração Estimada:</p>
                <p className="text-white">{selectedExamType.typicalDuration} minutos</p>
              </div>
              {selectedExamType.radiationDose && (
                <div>
                  <p className="text-white/80">Dose de Radiação:</p>
                  <p className="text-white">{selectedExamType.radiationDose} mSv</p>
                </div>
              )}
              {selectedExamType.preparation && (
                <div className="md:col-span-2">
                  <p className="text-white/80">Preparação Necessária:</p>
                  <p className="text-yellow-400">{selectedExamType.preparation}</p>
                </div>
              )}
              {selectedExamType.contraindications && selectedExamType.contraindications.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-white/80">Contraindicações:</p>
                  <ul className="text-red-400 list-disc list-inside">
                    {selectedExamType.contraindications.map((contra, index) => (
                      <li key={index}>{contra}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default ImagingRequest;







