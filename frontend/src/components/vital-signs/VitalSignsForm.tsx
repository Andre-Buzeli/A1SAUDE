import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Thermometer,
  Heart,
  Activity,
  Wind,
  Eye,
  Scale,
  Ruler,
  Calculator,
  AlertTriangle,
  Save,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassTextarea from '@/components/ui/GlassTextarea';
import { vitalSignsService, VitalSignsCreateData, VitalSigns } from '@/services/vitalSignsService';

interface VitalSignsFormProps {
  patientId?: string;
  attendanceId?: string;
  initialData?: Partial<VitalSigns>;
  onSave?: (data: VitalSigns) => void;
  onCancel?: () => void;
}

interface FormData extends VitalSignsCreateData {
  // Additional calculated fields
  calculatedBMI?: number;
  calculatedGlasgowTotal?: number;
}

export const VitalSignsForm: React.FC<VitalSignsFormProps> = ({
  patientId,
  attendanceId,
  initialData,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    patientId: patientId || '',
    attendanceId,
    measuredAt: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM format
    measuredBy: '',

    // Vital signs
    temperature: undefined,
    temperatureUnit: 'celsius',
    respiratoryRate: undefined,
    respiratoryRateUnit: 'breaths_per_minute',
    heartRate: undefined,
    heartRateUnit: 'beats_per_minute',
    bloodPressureSystolic: undefined,
    bloodPressureDiastolic: undefined,
    bloodPressureUnit: 'mmHg',
    oxygenSaturation: undefined,
    oxygenSaturationUnit: 'percentage',
    painScale: undefined,

    // Additional measurements
    weight: undefined,
    weightUnit: 'kg',
    height: undefined,
    heightUnit: 'cm',

    // Glasgow Coma Scale
    glasgowEye: undefined,
    glasgowVerbal: undefined,
    glasgowMotor: undefined,

    // Notes
    observations: '',

    ...initialData
  });

  const [saving, setSaving] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Calculate BMI when weight or height changes
  useEffect(() => {
    if (formData.weight && formData.height) {
      const bmi = vitalSignsService.calculateBMI(formData.weight, formData.height, formData.heightUnit);
      setFormData(prev => ({ ...prev, calculatedBMI: bmi }));
    }
  }, [formData.weight, formData.height, formData.heightUnit]);

  // Calculate Glasgow total when components change
  useEffect(() => {
    if (formData.glasgowEye && formData.glasgowVerbal && formData.glasgowMotor) {
      const total = vitalSignsService.calculateGlasgowTotal(
        formData.glasgowEye,
        formData.glasgowVerbal,
        formData.glasgowMotor
      );
      setFormData(prev => ({ ...prev, calculatedGlasgowTotal: total }));
    }
  }, [formData.glasgowEye, formData.glasgowVerbal, formData.glasgowMotor]);

  // Analyze vital signs and generate alerts/recommendations
  useEffect(() => {
    analyzeVitalSigns();
  }, [formData]);

  const analyzeVitalSigns = () => {
    const analysis = {
      alerts: [] as string[],
      recommendations: [] as string[],
      severity: 'normal' as 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
    };

    // Temperature analysis
    if (formData.temperature) {
      const tempClass = vitalSignsService.classifyTemperature(formData.temperature);
      if (tempClass.category !== 'Normal') {
        analysis.alerts.push(tempClass.category);
        if (tempClass.category.includes('alta')) {
          analysis.recommendations.push('Avaliar foco infeccioso, hidratação adequada');
          analysis.severity = 'moderate';
        }
      }
    }

    // Blood pressure analysis
    if (formData.bloodPressureSystolic && formData.bloodPressureDiastolic) {
      const bpClass = vitalSignsService.classifyBloodPressure(
        formData.bloodPressureSystolic,
        formData.bloodPressureDiastolic
      );
      if (bpClass.category !== 'Normal') {
        analysis.alerts.push(bpClass.category);
        if (bpClass.category === 'Crise hipertensiva') {
          analysis.recommendations.push('Tratamento anti-hipertensivo imediato, monitorização contínua');
          analysis.severity = 'critical';
        }
      }
    }

    // Oxygen saturation analysis
    if (formData.oxygenSaturation) {
      const o2Class = vitalSignsService.classifyOxygenSaturation(formData.oxygenSaturation);
      if (o2Class.category !== 'Normal') {
        analysis.alerts.push(o2Class.category);
        if (o2Class.category.includes('grave')) {
          analysis.recommendations.push('Oxigenoterapia imediata, avaliação intensiva');
          analysis.severity = 'critical';
        }
      }
    }

    // BMI analysis
    if (formData.calculatedBMI) {
      const bmiClass = vitalSignsService.classifyBMI(formData.calculatedBMI);
      if (bmiClass.category !== 'Normal') {
        analysis.alerts.push(bmiClass.category);
      }
    }

    // Glasgow Coma Scale analysis
    if (formData.calculatedGlasgowTotal) {
      if (formData.calculatedGlasgowTotal <= 8) {
        analysis.alerts.push('Coma (Glasgow ≤ 8)');
        analysis.recommendations.push('Avaliação neurológica urgente, estabilização de vias aéreas');
        analysis.severity = 'critical';
      } else if (formData.calculatedGlasgowTotal <= 12) {
        analysis.alerts.push('Alteração de consciência (Glasgow 9-12)');
        analysis.recommendations.push('Monitorar nível de consciência, avaliação neurológica');
        analysis.severity = 'severe';
      }
    }

    setAlerts(analysis.alerts);
    setRecommendations(analysis.recommendations);
  };

  const handleInputChange = (field: keyof FormData) => (value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId) {
      toast.error('Selecione um paciente');
      return;
    }

    try {
      setSaving(true);

      const submitData: VitalSignsCreateData = {
        ...formData,
        measuredAt: new Date(formData.measuredAt).toISOString(),
        // Remove calculated fields
        calculatedBMI: undefined,
        calculatedGlasgowTotal: undefined
      };

      const result = await vitalSignsService.createVitalSigns(submitData);

      toast.success('Sinais vitais registrados com sucesso!');
      onSave?.(result);

    } catch (error: any) {
      console.error('Erro ao salvar sinais vitais:', error);
      toast.error(error.response?.data?.error?.message || 'Erro ao salvar sinais vitais');
    } finally {
      setSaving(false);
    }
  };

  const getSeverityColor = (severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical') => {
    return vitalSignsService.getSeverityColor(severity);
  };

  const severity = vitalSignsService.getAlertSeverity(alerts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <GlassCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Registro de Sinais Vitais</h2>
            {severity !== 'normal' && (
              <div className={`flex items-center space-x-2 ${getSeverityColor(severity)}`}>
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium capitalize">{severity}</span>
              </div>
            )}
          </div>

          {/* Patient and Attendance Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassInput
              label="ID do Paciente"
              value={formData.patientId}
              onChange={handleInputChange('patientId')}
              required
              placeholder="Digite o ID do paciente"
            />

            <GlassInput
              label="Data e Hora da Medição"
              type="datetime-local"
              value={formData.measuredAt}
              onChange={handleInputChange('measuredAt')}
              required
            />
          </div>

          {/* Vital Signs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Temperature */}
            <GlassCard className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Thermometer className="w-5 h-5 text-medical-red" />
                <span className="text-white font-medium">Temperatura</span>
              </div>
              <div className="space-y-2">
                <GlassInput
                  type="number"
                  step="0.1"
                  min="25"
                  max="45"
                  value={formData.temperature || ''}
                  onChange={(value) => handleInputChange('temperature')(parseFloat(value) || undefined)}
                  placeholder="36.5"
                />
                <GlassSelect
                  value={formData.temperatureUnit}
                  onChange={handleInputChange('temperatureUnit')}
                  options={[
                    { value: 'celsius', label: '°C' },
                    { value: 'fahrenheit', label: '°F' }
                  ]}
                />
              </div>
            </GlassCard>

            {/* Heart Rate */}
            <GlassCard className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Heart className="w-5 h-5 text-medical-red" />
                <span className="text-white font-medium">Frequência Cardíaca</span>
              </div>
              <div className="space-y-2">
                <GlassInput
                  type="number"
                  min="0"
                  max="300"
                  value={formData.heartRate || ''}
                  onChange={(value) => handleInputChange('heartRate')(parseInt(value) || undefined)}
                  placeholder="75"
                />
                <GlassSelect
                  value={formData.heartRateUnit}
                  onChange={handleInputChange('heartRateUnit')}
                  options={[
                    { value: 'beats_per_minute', label: 'bpm' }
                  ]}
                />
              </div>
            </GlassCard>

            {/* Blood Pressure */}
            <GlassCard className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="w-5 h-5 text-medical-blue" />
                <span className="text-white font-medium">Pressão Arterial</span>
              </div>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <GlassInput
                    type="number"
                    min="0"
                    max="300"
                    value={formData.bloodPressureSystolic || ''}
                    onChange={(value) => handleInputChange('bloodPressureSystolic')(parseInt(value) || undefined)}
                    placeholder="120"
                    className="flex-1"
                  />
                  <span className="text-white self-center">/</span>
                  <GlassInput
                    type="number"
                    min="0"
                    max="200"
                    value={formData.bloodPressureDiastolic || ''}
                    onChange={(value) => handleInputChange('bloodPressureDiastolic')(parseInt(value) || undefined)}
                    placeholder="80"
                    className="flex-1"
                  />
                </div>
                <GlassSelect
                  value={formData.bloodPressureUnit}
                  onChange={handleInputChange('bloodPressureUnit')}
                  options={[
                    { value: 'mmHg', label: 'mmHg' }
                  ]}
                />
              </div>
            </GlassCard>

            {/* Respiratory Rate */}
            <GlassCard className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Wind className="w-5 h-5 text-medical-green" />
                <span className="text-white font-medium">Frequência Respiratória</span>
              </div>
              <div className="space-y-2">
                <GlassInput
                  type="number"
                  min="0"
                  max="100"
                  value={formData.respiratoryRate || ''}
                  onChange={(value) => handleInputChange('respiratoryRate')(parseInt(value) || undefined)}
                  placeholder="16"
                />
                <GlassSelect
                  value={formData.respiratoryRateUnit}
                  onChange={handleInputChange('respiratoryRateUnit')}
                  options={[
                    { value: 'breaths_per_minute', label: 'rpm' }
                  ]}
                />
              </div>
            </GlassCard>

            {/* Oxygen Saturation */}
            <GlassCard className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="w-5 h-5 text-medical-green" />
                <span className="text-white font-medium">Saturação de Oxigênio</span>
              </div>
              <div className="space-y-2">
                <GlassInput
                  type="number"
                  min="0"
                  max="100"
                  value={formData.oxygenSaturation || ''}
                  onChange={(value) => handleInputChange('oxygenSaturation')(parseInt(value) || undefined)}
                  placeholder="98"
                />
                <GlassSelect
                  value={formData.oxygenSaturationUnit}
                  onChange={handleInputChange('oxygenSaturationUnit')}
                  options={[
                    { value: 'percentage', label: '%' }
                  ]}
                />
              </div>
            </GlassCard>

            {/* Pain Scale */}
            <GlassCard className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-medical-orange" />
                <span className="text-white font-medium">Escala de Dor</span>
              </div>
              <div className="space-y-2">
                <GlassInput
                  type="number"
                  min="0"
                  max="10"
                  value={formData.painScale || ''}
                  onChange={(value) => handleInputChange('painScale')(parseInt(value) || undefined)}
                  placeholder="0-10"
                />
                <div className="text-xs text-text-secondary">
                  0 = Sem dor, 10 = Dor máxima
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Additional Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weight */}
            <GlassCard className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Scale className="w-5 h-5 text-medical-purple" />
                <span className="text-white font-medium">Peso</span>
              </div>
              <div className="space-y-2">
                <GlassInput
                  type="number"
                  step="0.1"
                  min="0"
                  max="500"
                  value={formData.weight || ''}
                  onChange={(value) => handleInputChange('weight')(parseFloat(value) || undefined)}
                  placeholder="70.5"
                />
                <GlassSelect
                  value={formData.weightUnit}
                  onChange={handleInputChange('weightUnit')}
                  options={[
                    { value: 'kg', label: 'kg' },
                    { value: 'lbs', label: 'lbs' }
                  ]}
                />
              </div>
            </GlassCard>

            {/* Height */}
            <GlassCard className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Ruler className="w-5 h-5 text-medical-purple" />
                <span className="text-white font-medium">Altura</span>
              </div>
              <div className="space-y-2">
                <GlassInput
                  type="number"
                  step="0.1"
                  min="0"
                  max="300"
                  value={formData.height || ''}
                  onChange={(value) => handleInputChange('height')(parseFloat(value) || undefined)}
                  placeholder="170"
                />
                <GlassSelect
                  value={formData.heightUnit}
                  onChange={handleInputChange('heightUnit')}
                  options={[
                    { value: 'cm', label: 'cm' },
                    { value: 'm', label: 'm' },
                    { value: 'in', label: 'in' },
                    { value: 'ft', label: 'ft' }
                  ]}
                />
              </div>
            </GlassCard>

            {/* BMI */}
            <GlassCard className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="w-5 h-5 text-medical-purple" />
                <span className="text-white font-medium">IMC</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">
                  {formData.calculatedBMI ? formData.calculatedBMI.toFixed(1) : '--'}
                </div>
                {formData.calculatedBMI && (
                  <div className={`text-sm ${vitalSignsService.classifyBMI(formData.calculatedBMI).color}`}>
                    {vitalSignsService.classifyBMI(formData.calculatedBMI).category}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Glasgow Coma Scale */}
          <GlassCard className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-medical-blue" />
              <span className="text-white font-medium">Escala de Coma de Glasgow</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Abertura Ocular</label>
                <GlassSelect
                  value={formData.glasgowEye || ''}
                  onChange={(value) => handleInputChange('glasgowEye')(parseInt(value) || undefined)}
                  options={[
                    { value: '', label: 'Selecione...' },
                    { value: '4', label: '4 - Espontânea' },
                    { value: '3', label: '3 - À voz' },
                    { value: '2', label: '2 - À dor' },
                    { value: '1', label: '1 - Ausente' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Resposta Verbal</label>
                <GlassSelect
                  value={formData.glasgowVerbal || ''}
                  onChange={(value) => handleInputChange('glasgowVerbal')(parseInt(value) || undefined)}
                  options={[
                    { value: '', label: 'Selecione...' },
                    { value: '5', label: '5 - Orientada' },
                    { value: '4', label: '4 - Confusa' },
                    { value: '3', label: '3 - Palavras inadequadas' },
                    { value: '2', label: '2 - Sons incompreensíveis' },
                    { value: '1', label: '1 - Ausente' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Resposta Motora</label>
                <GlassSelect
                  value={formData.glasgowMotor || ''}
                  onChange={(value) => handleInputChange('glasgowMotor')(parseInt(value) || undefined)}
                  options={[
                    { value: '', label: 'Selecione...' },
                    { value: '6', label: '6 - Obedece comandos' },
                    { value: '5', label: '5 - Localiza dor' },
                    { value: '4', label: '4 - Retirada à dor' },
                    { value: '3', label: '3 - Flexão anormal' },
                    { value: '2', label: '2 - Extensão anormal' },
                    { value: '1', label: '1 - Ausente' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Total</label>
                <div className="text-2xl font-bold text-white mt-2">
                  {formData.calculatedGlasgowTotal || '--'}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Observations */}
          <GlassTextarea
            label="Observações"
            value={formData.observations || ''}
            onChange={handleInputChange('observations')}
            placeholder="Observações adicionais sobre os sinais vitais..."
            rows={3}
          />

          {/* Alerts and Recommendations */}
          {(alerts.length > 0 || recommendations.length > 0) && (
            <GlassCard className="p-4">
              <h3 className="text-lg font-medium text-white mb-4">Análise Automática</h3>

              {alerts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-red-400 mb-2">Alertas:</h4>
                  <ul className="space-y-1">
                    {alerts.map((alert, index) => (
                      <li key={index} className="flex items-center space-x-2 text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{alert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-medical-blue mb-2">Recomendações:</h4>
                  <ul className="space-y-1">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="text-medical-blue text-sm">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </GlassCard>
          )}

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <GlassButton
              type="submit"
              variant="primary"
              disabled={saving}
              className="flex items-center space-x-2 flex-1"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salvar Sinais Vitais</span>
                </>
              )}
            </GlassButton>

            {onCancel && (
              <GlassButton
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="flex items-center space-x-2"
              >
                <X className="w-5 h-5" />
                <span>Cancelar</span>
              </GlassButton>
            )}
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
};

export default VitalSignsForm;


