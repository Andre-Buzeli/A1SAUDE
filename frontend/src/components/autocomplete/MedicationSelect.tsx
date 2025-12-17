import React, { forwardRef, useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X, Check, Pill } from 'lucide-react';
import { cn } from '@/utils/cn';
import medicamentosData from '@/data/medicamentos.json';

interface MedicationOption {
  id: string;
  nomeComercial: string;
  principioAtivo: string;
  dosagem: string;
  apresentacao: string;
  viaAdministracao: string;
  categoria: string;
  tarja: string;
  laboratorio: string;
}

interface MedicationSelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string, option?: MedicationOption) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showDetails?: boolean;
}

const MedicationSelect = forwardRef<HTMLDivElement, MedicationSelectProps>(({
  label,
  placeholder = 'Buscar medicamento...',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  showDetails = true
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cast the imported data to the correct type
  const medicationOptions: MedicationOption[] = medicamentosData as MedicationOption[];

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return medicationOptions.slice(0, 50); // Show first 50 when no search
    }

    const term = searchTerm.toLowerCase();
    return medicationOptions.filter(medication =>
      medication.nomeComercial.toLowerCase().includes(term) ||
      medication.principioAtivo.toLowerCase().includes(term) ||
      medication.categoria.toLowerCase().includes(term) ||
      medication.laboratorio.toLowerCase().includes(term)
    ).slice(0, 100); // Limit to 100 results
  }, [searchTerm, medicationOptions]);

  // Find selected option
  const selectedOption = medicationOptions.find(option => option.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: MedicationOption) => {
    onChange?.(option.id, option);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange?.('', undefined);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  const getTarjaColor = (tarja: string) => {
    switch (tarja) {
      case 'Preta':
        return 'bg-black/20 border-black/30 text-black';
      case 'Vermelha':
        return 'bg-red-500/20 border-red-500/30 text-red-400';
      default:
        return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const selectClasses = cn(
    'w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg',
    'px-4 py-3 text-white cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-medical-blue/50 focus:border-medical-blue/50',
    'transition-all duration-200',
    'flex items-center justify-between',
    error ? 'border-medical-red/50 focus:ring-medical-red/50' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  );

  return (
    <motion.div
      ref={ref}
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label} {required && <span className="text-medical-red">*</span>}
        </label>
      )}
      <div className="relative" ref={selectRef}>
        <div
          className={selectClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? 'text-white text-sm' : 'text-white/60'}>
            {selectedOption ? (
              <div className="flex items-center space-x-3">
                <Pill className="w-4 h-4 text-medical-blue flex-shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold truncate">{selectedOption.nomeComercial}</span>
                  <div className="flex items-center space-x-2 text-xs text-white/80">
                    <span>{selectedOption.principioAtivo}</span>
                    <span>•</span>
                    <span>{selectedOption.dosagem}</span>
                  </div>
                </div>
              </div>
            ) : placeholder}
          </span>
          <div className="flex items-center space-x-2">
            {selectedOption && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-white/60 hover:text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'w-5 h-5 text-white/60 transition-transform duration-200',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 bg-white/15 backdrop-blur-xl border border-white/30 rounded-lg shadow-glass-xl max-h-80 overflow-hidden"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setHighlightedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar por nome, princípio ativo ou laboratório..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-medical-blue/50 focus:border-medical-blue/50 text-sm"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-6 text-center text-white/60 text-sm">
                    {searchTerm ? 'Nenhum medicamento encontrado' : 'Digite para buscar...'}
                  </div>
                ) : (
                  filteredOptions.map((medication, index) => (
                    <div
                      key={medication.id}
                      className={cn(
                        'px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-white/5 last:border-b-0',
                        'hover:bg-white/10',
                        index === highlightedIndex && 'bg-medical-blue/20',
                        selectedOption?.id === medication.id && 'bg-medical-green/20'
                      )}
                      onClick={() => handleSelect(medication)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Pill className="w-4 h-4 text-medical-blue flex-shrink-0" />
                            <span className="font-semibold text-white text-sm">
                              {medication.nomeComercial}
                            </span>
                            {selectedOption?.id === medication.id && (
                              <Check className="w-4 h-4 text-medical-green flex-shrink-0" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <p className="text-white/80 text-sm">
                              <span className="font-medium">Princípio ativo:</span> {medication.principioAtivo}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-white/70">
                              <span>{medication.dosagem}</span>
                              <span>•</span>
                              <span>{medication.apresentacao}</span>
                              <span>•</span>
                              <span>{medication.viaAdministracao}</span>
                            </div>
                            {showDetails && (
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-white/60 text-xs">
                                  {medication.laboratorio}
                                </span>
                                <span
                                  className={cn(
                                    'px-2 py-0.5 rounded-full text-xs border',
                                    getTarjaColor(medication.tarja)
                                  )}
                                >
                                  {medication.tarja}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer with result count */}
              {filteredOptions.length > 0 && (
                <div className="px-4 py-2 border-t border-white/10 bg-white/5">
                  <p className="text-white/60 text-xs text-center">
                    {filteredOptions.length} medicamento{filteredOptions.length !== 1 ? 's' : ''} encontrado{filteredOptions.length !== 1 ? 's' : ''}
                    {searchTerm && ` para "${searchTerm}"`}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <motion.p
          className="text-sm text-medical-red"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
});

MedicationSelect.displayName = 'MedicationSelect';

export default MedicationSelect;









