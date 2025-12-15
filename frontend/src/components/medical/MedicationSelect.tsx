/**
 * Componente de Seleção de Medicamentos
 * Sistema A1 Saúde
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Plus, ChevronDown, Pill, AlertTriangle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import medicamentosData from '@/data/medicamentos.json';

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  presentation?: string;
  concentration?: string;
  category?: string;
  controlled?: boolean;
  routes?: string[];
}

interface SelectedMedication {
  medication: Medication;
  dose: string;
  unit: string;
  route: string;
  frequency: string;
  duration: string;
  durationUnit: string;
  instructions?: string;
}

interface MedicationSelectProps {
  value: SelectedMedication[];
  onChange: (medications: SelectedMedication[]) => void;
  label?: string;
  placeholder?: string;
  maxItems?: number;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onAddPrescription?: (medication: SelectedMedication) => void;
}

const ROUTES = [
  { value: 'oral', label: 'Via Oral' },
  { value: 'iv', label: 'Intravenoso' },
  { value: 'im', label: 'Intramuscular' },
  { value: 'sc', label: 'Subcutâneo' },
  { value: 'topical', label: 'Tópico' },
  { value: 'inhalation', label: 'Inalatório' },
  { value: 'rectal', label: 'Retal' },
  { value: 'ocular', label: 'Oftálmico' },
  { value: 'nasal', label: 'Nasal' },
  { value: 'sublingual', label: 'Sublingual' }
];

const FREQUENCIES = [
  { value: '1x/dia', label: '1x ao dia' },
  { value: '2x/dia', label: '2x ao dia (12/12h)' },
  { value: '3x/dia', label: '3x ao dia (8/8h)' },
  { value: '4x/dia', label: '4x ao dia (6/6h)' },
  { value: '6x/dia', label: '6x ao dia (4/4h)' },
  { value: 'SOS', label: 'Se necessário (SOS)' },
  { value: 'ACM', label: 'A critério médico' },
  { value: 'jejum', label: 'Em jejum' },
  { value: 'noite', label: 'À noite' },
  { value: 'manha', label: 'Pela manhã' }
];

const UNITS = [
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
  { value: 'gotas', label: 'gotas' },
  { value: 'comp', label: 'comprimido(s)' },
  { value: 'caps', label: 'cápsula(s)' },
  { value: 'amp', label: 'ampola(s)' },
  { value: 'UI', label: 'UI' }
];

export const MedicationSelect: React.FC<MedicationSelectProps> = ({
  value = [],
  onChange,
  label = 'Medicamentos',
  placeholder = 'Buscar medicamento...',
  maxItems = 20,
  disabled = false,
  required = false,
  error,
  onAddPrescription
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    dose: '',
    unit: 'mg',
    route: 'oral',
    frequency: '1x/dia',
    duration: '',
    durationUnit: 'dias',
    instructions: ''
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Converte os dados dos medicamentos
  const medications: Medication[] = useMemo(() => {
    if (Array.isArray(medicamentosData)) {
      return medicamentosData.map((item: any, index: number) => ({
        id: item.id || `med-${index}`,
        name: item.name || item.nome,
        genericName: item.genericName || item.principioAtivo,
        presentation: item.presentation || item.apresentacao,
        concentration: item.concentration || item.concentracao,
        category: item.category || item.categoria,
        controlled: item.controlled || item.controlado || false,
        routes: item.routes || item.vias || ['oral']
      }));
    }
    return [];
  }, []);

  // Filtra os resultados
  const filteredResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    return medications
      .filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.genericName && item.genericName.toLowerCase().includes(query))
      )
      .slice(0, 10);
  }, [searchQuery, medications]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowForm(true);
    setIsOpen(false);
    setSearchQuery('');
    
    // Define a via padrão baseada no medicamento
    if (medication.routes && medication.routes.length > 0) {
      setPrescriptionForm(prev => ({ ...prev, route: medication.routes![0] }));
    }
  };

  const handleAddPrescription = () => {
    if (!selectedMedication) return;
    
    const newPrescription: SelectedMedication = {
      medication: selectedMedication,
      ...prescriptionForm
    };

    if (onAddPrescription) {
      onAddPrescription(newPrescription);
    } else {
      onChange([...value, newPrescription]);
    }

    // Reset form
    setShowForm(false);
    setSelectedMedication(null);
    setPrescriptionForm({
      dose: '',
      unit: 'mg',
      route: 'oral',
      frequency: '1x/dia',
      duration: '',
      durationUnit: 'dias',
      instructions: ''
    });
  };

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[highlightedIndex]) {
          handleSelectMedication(filteredResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {label && (
        <label className="block text-white font-medium">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Lista de medicamentos prescritos */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((item, index) => (
            <GlassCard key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-medical-blue/20 rounded-lg">
                    <Pill className="w-5 h-5 text-medical-blue" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-white">{item.medication.name}</h4>
                      {item.medication.controlled && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Controlado
                        </span>
                      )}
                    </div>
                    {item.medication.genericName && (
                      <p className="text-white/50 text-sm">{item.medication.genericName}</p>
                    )}
                    <p className="text-white/70 mt-1">
                      {item.dose} {item.unit} - {ROUTES.find(r => r.value === item.route)?.label} - {item.frequency}
                    </p>
                    {item.duration && (
                      <p className="text-white/50 text-sm">
                        Por {item.duration} {item.durationUnit}
                      </p>
                    )}
                    {item.instructions && (
                      <p className="text-white/50 text-sm italic mt-1">
                        "{item.instructions}"
                      </p>
                    )}
                  </div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/40 hover:text-red-400" />
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Formulário de prescrição */}
      {showForm && selectedMedication && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Pill className="w-6 h-6 text-medical-blue" />
              <div>
                <h4 className="font-semibold text-white">{selectedMedication.name}</h4>
                {selectedMedication.presentation && (
                  <p className="text-white/50 text-sm">{selectedMedication.presentation}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedMedication(null);
              }}
              className="p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5 text-white/40" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Dose */}
            <div>
              <label className="block text-white/60 text-sm mb-1">Dose</label>
              <input
                type="text"
                value={prescriptionForm.dose}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, dose: e.target.value }))}
                placeholder="Ex: 500"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
              />
            </div>

            {/* Unidade */}
            <div>
              <label className="block text-white/60 text-sm mb-1">Unidade</label>
              <select
                value={prescriptionForm.unit}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
              >
                {UNITS.map(unit => (
                  <option key={unit.value} value={unit.value} className="bg-slate-800">
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Via */}
            <div>
              <label className="block text-white/60 text-sm mb-1">Via</label>
              <select
                value={prescriptionForm.route}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, route: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
              >
                {ROUTES.map(route => (
                  <option key={route.value} value={route.value} className="bg-slate-800">
                    {route.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequência */}
            <div>
              <label className="block text-white/60 text-sm mb-1">Frequência</label>
              <select
                value={prescriptionForm.frequency}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
              >
                {FREQUENCIES.map(freq => (
                  <option key={freq.value} value={freq.value} className="bg-slate-800">
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duração */}
            <div>
              <label className="block text-white/60 text-sm mb-1">Duração</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={prescriptionForm.duration}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Ex: 7"
                  className="w-20 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
                />
                <select
                  value={prescriptionForm.durationUnit}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, durationUnit: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
                >
                  <option value="dias" className="bg-slate-800">dias</option>
                  <option value="semanas" className="bg-slate-800">semanas</option>
                  <option value="meses" className="bg-slate-800">meses</option>
                  <option value="uso contínuo" className="bg-slate-800">uso contínuo</option>
                </select>
              </div>
            </div>

            {/* Instruções */}
            <div className="col-span-2 md:col-span-3">
              <label className="block text-white/60 text-sm mb-1">Instruções adicionais</label>
              <input
                type="text"
                value={prescriptionForm.instructions}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Ex: Tomar após as refeições"
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <GlassButton
              onClick={handleAddPrescription}
              disabled={!prescriptionForm.dose}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar à Prescrição
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* Campo de busca */}
      {value.length < maxItems && !disabled && !showForm && (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full pl-10 pr-10 py-3
              bg-white/5 border rounded-lg
              text-white placeholder-white/40
              focus:outline-none focus:ring-2 focus:ring-medical-blue/50
              transition-all
              ${error ? 'border-red-500/50' : 'border-white/20'}
            `}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown */}
          {isOpen && filteredResults.length > 0 && (
            <div className="absolute z-50 w-full mt-2">
              <GlassCard className="p-0 overflow-hidden max-h-64 overflow-y-auto">
                {filteredResults.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMedication(item)}
                    className={`
                      w-full px-4 py-3 text-left
                      flex items-center space-x-3
                      transition-colors
                      ${index === highlightedIndex 
                        ? 'bg-medical-blue/20 border-l-2 border-medical-blue' 
                        : 'hover:bg-white/5 border-l-2 border-transparent'
                      }
                      ${index !== filteredResults.length - 1 ? 'border-b border-white/10' : ''}
                    `}
                  >
                    <Pill className="w-5 h-5 text-medical-blue/60" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{item.name}</span>
                        {item.controlled && (
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      {item.genericName && (
                        <span className="text-white/50 text-sm">{item.genericName}</span>
                      )}
                      {item.presentation && (
                        <span className="text-white/40 text-sm ml-2">({item.presentation})</span>
                      )}
                    </div>
                    <Plus className="w-4 h-4 text-white/40" />
                  </button>
                ))}
              </GlassCard>
            </div>
          )}

          {/* No results */}
          {isOpen && searchQuery.length >= 2 && filteredResults.length === 0 && (
            <div className="absolute z-50 w-full mt-2">
              <GlassCard className="p-4 text-center">
                <p className="text-white/60">Nenhum medicamento encontrado para "{searchQuery}"</p>
              </GlassCard>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};

export default MedicationSelect;

