import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Pill, AlertCircle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { Medication } from '@/services/prescriptionService';

interface PrescriptionBuilderProps {
  medications: Medication[];
  onChange: (medications: Medication[]) => void;
  patientAllergies?: string[];
  errors?: Record<string, string>;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({
  medications,
  onChange,
  patientAllergies = [],
  errors = {}
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const addMedication = () => {
    const newMedication: Medication = {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: undefined
    };
    onChange([...medications, newMedication]);
    setExpandedIndex(medications.length);
  };

  const removeMedication = (index: number) => {
    const updated = medications.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | number | undefined) => {
    const updated = medications.map((med, i) => {
      if (i === index) {
        return { ...med, [field]: value };
      }
      return med;
    });
    onChange(updated);
  };

  const checkAllergies = (medicationName: string): string[] => {
    if (!medicationName || patientAllergies.length === 0) return [];
    
    const nameLower = medicationName.toLowerCase();
    return patientAllergies.filter(allergy => 
      nameLower.includes(allergy.toLowerCase()) || 
      allergy.toLowerCase().includes(nameLower)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Pill className="w-5 h-5 mr-2 text-medical-blue" />
          Medicamentos ({medications.length})
        </h3>
        <GlassButton
          variant="primary"
          size="sm"
          onClick={addMedication}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Medicamento</span>
        </GlassButton>
      </div>

      {medications.length === 0 && (
        <GlassCard className="p-8 text-center">
          <Pill className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary mb-4">
            Nenhum medicamento adicionado
          </p>
          <GlassButton variant="primary" onClick={addMedication}>
            Adicionar Primeiro Medicamento
          </GlassButton>
        </GlassCard>
      )}

      <AnimatePresence>
        {medications.map((medication, index) => {
          const allergies = checkAllergies(medication.name);
          const isExpanded = expandedIndex === index;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard 
                variant="interactive"
                className={`p-4 cursor-pointer ${isExpanded ? 'ring-2 ring-medical-blue/50' : ''}`}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-medical-blue/20 rounded-full flex items-center justify-center">
                        <Pill className="w-5 h-5 text-medical-blue" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">
                          {medication.name || `Medicamento ${index + 1}`}
                        </h4>
                        {medication.dosage && medication.frequency && (
                          <p className="text-sm text-text-secondary">
                            {medication.dosage} - {medication.frequency}
                          </p>
                        )}
                      </div>
                      {allergies.length > 0 && (
                        <div className="flex items-center space-x-1 text-medical-red text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>Alergia!</span>
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-4 pt-4 border-t border-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {allergies.length > 0 && (
                          <div className="bg-medical-red/20 border border-medical-red/50 rounded-lg p-3">
                            <p className="text-medical-red text-sm font-medium mb-1">
                              ⚠️ Alerta de Alergia
                            </p>
                            <p className="text-white text-sm">
                              Paciente tem alergia a: {allergies.join(', ')}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <GlassInput
                            label="Nome do Medicamento *"
                            placeholder="Ex: Dipirona"
                            value={medication.name}
                            onChange={(value) => updateMedication(index, 'name', value)}
                            error={errors[`medications.${index}.name`]}
                            required
                          />

                          <GlassInput
                            label="Dosagem *"
                            placeholder="Ex: 500mg"
                            value={medication.dosage}
                            onChange={(value) => updateMedication(index, 'dosage', value)}
                            error={errors[`medications.${index}.dosage`]}
                            required
                          />

                          <GlassInput
                            label="Frequência *"
                            placeholder="Ex: A cada 6 horas"
                            value={medication.frequency}
                            onChange={(value) => updateMedication(index, 'frequency', value)}
                            error={errors[`medications.${index}.frequency`]}
                            required
                          />

                          <GlassInput
                            label="Duração *"
                            placeholder="Ex: 5 dias"
                            value={medication.duration}
                            onChange={(value) => updateMedication(index, 'duration', value)}
                            error={errors[`medications.${index}.duration`]}
                            required
                          />

                          <GlassInput
                            label="Quantidade"
                            type="number"
                            placeholder="Ex: 20"
                            value={medication.quantity?.toString() || ''}
                            onChange={(value) => updateMedication(index, 'quantity', value ? parseInt(value) : undefined)}
                            error={errors[`medications.${index}.quantity`]}
                          />

                          <GlassInput
                            label="Instruções"
                            placeholder="Ex: Tomar com água"
                            value={medication.instructions || ''}
                            onChange={(value) => updateMedication(index, 'instructions', value)}
                            multiline
                            rows={2}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <GlassButton
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMedication(index);
                    }}
                    className="ml-4"
                  >
                    <X className="w-4 h-4" />
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};


