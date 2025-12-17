import React, { forwardRef, useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import cid10Data from '@/data/cid10.json';

interface CID10Option {
  code: string;
  description: string;
  category?: string;
}

interface CID10SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string, option?: CID10Option) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showCategory?: boolean;
}

const CID10Select = forwardRef<HTMLDivElement, CID10SelectProps>(({
  label,
  placeholder = 'Buscar CID-10...',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  showCategory = true
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cast the imported data to the correct type
  const cid10Options: CID10Option[] = cid10Data as CID10Option[];

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return cid10Options.slice(0, 50); // Show first 50 when no search
    }

    const term = searchTerm.toLowerCase();
    return cid10Options.filter(option =>
      option.code.toLowerCase().includes(term) ||
      option.description.toLowerCase().includes(term) ||
      (option.category && option.category.toLowerCase().includes(term))
    ).slice(0, 100); // Limit to 100 results
  }, [searchTerm, cid10Options]);

  // Find selected option
  const selectedOption = cid10Options.find(option => option.code === value);

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

  const handleSelect = (option: CID10Option) => {
    onChange?.(option.code, option);
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

  const displayValue = selectedOption
    ? `${selectedOption.code} - ${selectedOption.description}`
    : '';

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
              <div className="flex flex-col">
                <span className="font-semibold">{selectedOption.code}</span>
                <span className="text-xs text-white/80 truncate max-w-[300px]">
                  {selectedOption.description}
                </span>
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
                    placeholder="Buscar por código ou descrição..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-medical-blue/50 focus:border-medical-blue/50 text-sm"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="max-h-64 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-6 text-center text-white/60 text-sm">
                    {searchTerm ? 'Nenhum resultado encontrado' : 'Digite para buscar...'}
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.code}
                      className={cn(
                        'px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-white/5 last:border-b-0',
                        'hover:bg-white/10',
                        index === highlightedIndex && 'bg-medical-blue/20',
                        selectedOption?.code === option.code && 'bg-medical-green/20'
                      )}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-medical-blue text-sm">
                              {option.code}
                            </span>
                            {selectedOption?.code === option.code && (
                              <Check className="w-4 h-4 text-medical-green flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-white text-sm mt-1 leading-tight">
                            {option.description}
                          </p>
                          {showCategory && option.category && (
                            <p className="text-white/60 text-xs mt-1">
                              {option.category}
                            </p>
                          )}
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
                    {filteredOptions.length} resultado{filteredOptions.length !== 1 ? 's' : ''} encontrado{filteredOptions.length !== 1 ? 's' : ''}
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

CID10Select.displayName = 'CID10Select';

export default CID10Select;









