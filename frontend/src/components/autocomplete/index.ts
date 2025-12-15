// Componentes de autocomplete
export { default as CID10Select } from './CID10Select';
export { default as MedicationSelect } from './MedicationSelect';

// Tipos
export interface CID10Option {
  code: string;
  description: string;
  category?: string;
}

export interface MedicationOption {
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







