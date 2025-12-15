/**
 * Componente de Seleção CID-10
 * Sistema A1 Saúde
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Plus, ChevronDown } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import cid10Data from '@/data/cid10.json';

interface CID10Item {
  code: string;
  description: string;
  category?: string;
}

interface CID10SelectProps {
  value: string[];
  onChange: (codes: string[]) => void;
  label?: string;
  placeholder?: string;
  maxItems?: number;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export const CID10Select: React.FC<CID10SelectProps> = ({
  value = [],
  onChange,
  label = 'Códigos CID-10',
  placeholder = 'Buscar CID-10...',
  maxItems = 5,
  disabled = false,
  required = false,
  error
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Converte os dados do CID-10 para o formato esperado
  const cidItems: CID10Item[] = useMemo(() => {
    if (Array.isArray(cid10Data)) {
      return cid10Data.map((item: any) => ({
        code: item.code || item.codigo,
        description: item.description || item.descricao,
        category: item.category || item.categoria
      }));
    }
    return [];
  }, []);

  // Filtra os resultados baseado na busca
  const filteredResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    return cidItems
      .filter(item => 
        item.code.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
      .filter(item => !value.includes(item.code))
      .slice(0, 10);
  }, [searchQuery, cidItems, value]);

  // Obtém os itens selecionados com suas descrições
  const selectedItems = useMemo(() => {
    return value.map(code => {
      const item = cidItems.find(i => i.code === code);
      return item || { code, description: 'CID não encontrado' };
    });
  }, [value, cidItems]);

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

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

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
          handleSelect(filteredResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (item: CID10Item) => {
    if (value.length >= maxItems) {
      return;
    }
    
    const newValue = [...value, item.code];
    onChange(newValue);
    setSearchQuery('');
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  const handleRemove = (code: string) => {
    const newValue = value.filter(c => c !== code);
    onChange(newValue);
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-white font-medium mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Selected Tags */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedItems.map(item => (
            <div
              key={item.code}
              className="inline-flex items-center px-3 py-1.5 bg-medical-blue/20 border border-medical-blue/40 rounded-full text-sm"
            >
              <span className="text-medical-blue font-medium mr-1">{item.code}</span>
              <span className="text-white/70 max-w-[200px] truncate">
                {item.description}
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(item.code)}
                  className="ml-2 p-0.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/60 hover:text-red-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      {value.length < maxItems && !disabled && (
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
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && filteredResults.length > 0 && (
        <div className="absolute z-50 w-full mt-2">
          <GlassCard className="p-0 overflow-hidden max-h-64 overflow-y-auto">
            {filteredResults.map((item, index) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item)}
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
                <span className="text-medical-blue font-mono font-medium min-w-[60px]">
                  {item.code}
                </span>
                <span className="text-white/80 flex-1 text-sm">
                  {item.description}
                </span>
                <Plus className="w-4 h-4 text-white/40" />
              </button>
            ))}
          </GlassCard>
        </div>
      )}

      {/* No results message */}
      {isOpen && searchQuery.length >= 2 && filteredResults.length === 0 && (
        <div className="absolute z-50 w-full mt-2">
          <GlassCard className="p-4 text-center">
            <p className="text-white/60">Nenhum CID encontrado para "{searchQuery}"</p>
          </GlassCard>
        </div>
      )}

      {/* Helper text */}
      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-white/40 text-sm mt-2">
          Digite pelo menos 2 caracteres para buscar
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}

      {/* Counter */}
      <p className="text-white/40 text-xs mt-2">
        {value.length} de {maxItems} selecionados
      </p>
    </div>
  );
};

export default CID10Select;

