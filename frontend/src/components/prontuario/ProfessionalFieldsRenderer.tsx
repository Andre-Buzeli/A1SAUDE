import React from 'react';
import { UserProfile } from '@/types/auth';
import { useProfessionalFields, ProfessionalFieldGroup } from '@/hooks/useProfessionalFields';
import GlassCard from '@/components/ui/GlassCard';
import GlassInput from '@/components/ui/GlassInput';
import GlassTextarea from '@/components/ui/GlassTextarea';
import GlassSelect from '@/components/ui/GlassSelect';

interface ProfessionalFieldsRendererProps {
  profile: UserProfile;
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
  onValidationError?: (fieldId: string, error: string | null) => void;
}

const ProfessionalFieldsRenderer: React.FC<ProfessionalFieldsRendererProps> = ({
  profile,
  formData,
  onFieldChange,
  onValidationError
}) => {
  const fieldGroups = useProfessionalFields(profile);

  const validateField = (field: any, value: any): string | null => {
    if (field.validation) {
      const { min, max, pattern, custom } = field.validation;

      if (min !== undefined && typeof value === 'number' && value < min) {
        return `Valor deve ser pelo menos ${min}`;
      }

      if (max !== undefined && typeof value === 'number' && value > max) {
        return `Valor deve ser no máximo ${max}`;
      }

      if (pattern && typeof value === 'string' && !new RegExp(pattern).test(value)) {
        return 'Formato inválido';
      }

      if (custom && typeof custom === 'function') {
        return custom(value);
      }
    }

    if (field.required && (!value || value.toString().trim() === '')) {
      return 'Campo obrigatório';
    }

    return null;
  };

  const handleFieldChange = (fieldId: string, value: any, field: any) => {
    onFieldChange(fieldId, value);

    // Validação em tempo real
    if (onValidationError) {
      const error = validateField(field, value);
      onValidationError(fieldId, error);
    }
  };

  const renderField = (field: any, groupId: string) => {
    const fieldId = `${groupId}_${field.id}`;
    const value = formData[fieldId] || '';
    const hasError = formData[`${fieldId}_error`];

    const commonProps = {
      label: field.label + (field.required ? ' *' : ''),
      value,
      onChange: (newValue: any) => handleFieldChange(fieldId, newValue, field),
      placeholder: field.placeholder,
      className: hasError ? 'border-red-400' : ''
    };

    switch (field.type) {
      case 'textarea':
        return (
          <GlassTextarea
            key={fieldId}
            {...commonProps}
            rows={field.rows || 3}
          />
        );

      case 'select':
        return (
          <GlassSelect
            key={fieldId}
            {...commonProps}
            options={field.options?.map((option: string) => ({ value: option, label: option })) || []}
          />
        );

      case 'input':
        return (
          <GlassInput
            key={fieldId}
            {...commonProps}
            type={field.validation?.min !== undefined || field.validation?.max !== undefined ? 'number' : 'text'}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'checkbox':
        return (
          <div key={fieldId} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={fieldId}
              checked={value || false}
              onChange={(e) => handleFieldChange(fieldId, e.target.checked, field)}
              className="rounded border-white/20 bg-white/5 text-medical-blue focus:ring-medical-blue"
            />
            <label htmlFor={fieldId} className="text-white font-medium">
              {field.label} {field.required && '*'}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div key={fieldId} className="space-y-2">
            <label className="block text-white font-medium">
              {field.label} {field.required && '*'}
            </label>
            <div className="space-y-1">
              {field.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${fieldId}_${option}`}
                    name={fieldId}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFieldChange(fieldId, e.target.value, field)}
                    className="border-white/20 bg-white/5 text-medical-blue focus:ring-medical-blue"
                  />
                  <label htmlFor={`${fieldId}_${option}`} className="text-white/60">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <GlassInput
            key={fieldId}
            {...commonProps}
          />
        );
    }
  };

  if (fieldGroups.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">
          Este perfil profissional não possui campos específicos adicionais no prontuário.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fieldGroups.map((group) => (
        <GlassCard key={group.id} className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">{group.title}</h3>
            {group.description && (
              <p className="text-white/60 text-sm">{group.description}</p>
            )}
          </div>

          <div className="space-y-4">
            {group.fields.map((field) => renderField(field, group.id))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default ProfessionalFieldsRenderer;









