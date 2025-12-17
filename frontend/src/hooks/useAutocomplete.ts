import { useState, useEffect, useMemo } from 'react';
import cid10Data from '@/data/cid10.json';
import medicamentosData from '@/data/medicamentos.json';

interface CID10Option {
  code: string;
  description: string;
  category?: string;
}

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

// Hook para busca otimizada de CID-10
export const useCID10 = (searchTerm: string = '', limit: number = 50) => {
  const [isLoading, setIsLoading] = useState(false);

  const cid10Options: CID10Option[] = cid10Data as CID10Option[];

  const filteredOptions = useMemo(() => {
    setIsLoading(true);

    let results: CID10Option[];

    if (!searchTerm.trim()) {
      results = cid10Options.slice(0, limit);
    } else {
      const term = searchTerm.toLowerCase();
      results = cid10Options.filter(option =>
        option.code.toLowerCase().includes(term) ||
        option.description.toLowerCase().includes(term) ||
        (option.category && option.category.toLowerCase().includes(term))
      ).slice(0, limit);
    }

    setIsLoading(false);
    return results;
  }, [searchTerm, limit]);

  const findByCode = (code: string): CID10Option | undefined => {
    return cid10Options.find(option => option.code === code);
  };

  const searchByDescription = (description: string, limit: number = 10): CID10Option[] => {
    const term = description.toLowerCase();
    return cid10Options.filter(option =>
      option.description.toLowerCase().includes(term)
    ).slice(0, limit);
  };

  const getCategories = (): string[] => {
    const categories = new Set(cid10Options.map(option => option.category).filter(Boolean));
    return Array.from(categories).sort();
  };

  return {
    options: filteredOptions,
    isLoading,
    totalCount: cid10Options.length,
    findByCode,
    searchByDescription,
    getCategories
  };
};

// Hook para busca otimizada de medicamentos
export const useMedications = (searchTerm: string = '', limit: number = 50) => {
  const [isLoading, setIsLoading] = useState(false);

  const medicationOptions: MedicationOption[] = medicamentosData as MedicationOption[];

  const filteredOptions = useMemo(() => {
    setIsLoading(true);

    let results: MedicationOption[];

    if (!searchTerm.trim()) {
      results = medicationOptions.slice(0, limit);
    } else {
      const term = searchTerm.toLowerCase();
      results = medicationOptions.filter(medication =>
        medication.nomeComercial.toLowerCase().includes(term) ||
        medication.principioAtivo.toLowerCase().includes(term) ||
        medication.categoria.toLowerCase().includes(term) ||
        medication.laboratorio.toLowerCase().includes(term)
      ).slice(0, limit);
    }

    setIsLoading(false);
    return results;
  }, [searchTerm, limit]);

  const findById = (id: string): MedicationOption | undefined => {
    return medicationOptions.find(option => option.id === id);
  };

  const searchByActivePrinciple = (principle: string, limit: number = 10): MedicationOption[] => {
    const term = principle.toLowerCase();
    return medicationOptions.filter(medication =>
      medication.principioAtivo.toLowerCase().includes(term)
    ).slice(0, limit);
  };

  const searchByCommercialName = (name: string, limit: number = 10): MedicationOption[] => {
    const term = name.toLowerCase();
    return medicationOptions.filter(medication =>
      medication.nomeComercial.toLowerCase().includes(term)
    ).slice(0, limit);
  };

  const getCategories = (): string[] => {
    const categories = new Set(medicationOptions.map(option => option.categoria));
    return Array.from(categories).sort();
  };

  const getLaboratories = (): string[] => {
    const laboratories = new Set(medicationOptions.map(option => option.laboratorio));
    return Array.from(laboratories).sort();
  };

  const getByTarja = (tarja: string): MedicationOption[] => {
    return medicationOptions.filter(medication => medication.tarja === tarja);
  };

  const getByAdministrationRoute = (route: string): MedicationOption[] => {
    return medicationOptions.filter(medication =>
      medication.viaAdministracao.toLowerCase() === route.toLowerCase()
    );
  };

  return {
    options: filteredOptions,
    isLoading,
    totalCount: medicationOptions.length,
    findById,
    searchByActivePrinciple,
    searchByCommercialName,
    getCategories,
    getLaboratories,
    getByTarja,
    getByAdministrationRoute
  };
};

// Hook combinado para múltiplas buscas
export const useAutocompleteData = () => {
  const cid10 = useCID10();
  const medications = useMedications();

  return {
    cid10,
    medications
  };
};









