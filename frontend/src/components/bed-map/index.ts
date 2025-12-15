// Componentes do Mapa de Leitos
export { default as BedMapVisualizer } from './BedMapVisualizer';
export { default as BedMapEditor } from './BedMapEditor';
export { default as BedMapExample } from './BedMapExample';

// Hooks
export { useBedMapEditor } from '@/hooks/useBedMapEditor';

// Tipos
export type {
  BedPosition,
  Wall,
  BedMapLayout,
  ToolType
} from '@/hooks/useBedMapEditor';
