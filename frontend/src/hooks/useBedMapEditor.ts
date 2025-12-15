import { useState, useCallback, useRef } from 'react';

export interface BedPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  number: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  unit: string;
  patient?: {
    id: string;
    name: string;
    admissionDate: string;
  };
}

export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'wall' | 'door';
}

export interface BedMapLayout {
  beds: BedPosition[];
  walls: Wall[];
  units: string[];
  canvasSize: { width: number; height: number };
}

export type ToolType = 'select' | 'move' | 'draw-wall' | 'add-bed' | 'delete';

export const useBedMapEditor = (initialLayout?: BedMapLayout) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);

  const [layout, setLayout] = useState<BedMapLayout>(initialLayout || {
    beds: [],
    walls: [],
    units: [],
    canvasSize: { width: 800, height: 600 }
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Referências para drag and drop
  const dragRef = useRef<{
    isDragging: boolean;
    bedId: string | null;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  }>({
    isDragging: false,
    bedId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });

  const toggleEditMode = useCallback(() => {
    if (isEditMode && hasUnsavedChanges) {
      // Poderia mostrar confirmação aqui
      const confirmed = window.confirm('Há alterações não salvas. Deseja sair do modo edição?');
      if (!confirmed) return;
    }
    setIsEditMode(!isEditMode);
    setSelectedTool('select');
    setSelectedBedId(null);
    setIsDrawing(false);
    setDrawingStart(null);
  }, [isEditMode, hasUnsavedChanges]);

  const selectTool = useCallback((tool: ToolType) => {
    setSelectedTool(tool);
    setSelectedBedId(null);
    setIsDrawing(false);
    setDrawingStart(null);
  }, []);

  const startDrag = useCallback((bedId: string, clientX: number, clientY: number) => {
    if (selectedTool !== 'move') return;

    const bed = layout.beds.find(b => b.id === bedId);
    if (!bed) return;

    dragRef.current = {
      isDragging: true,
      bedId,
      startX: clientX,
      startY: clientY,
      offsetX: clientX - bed.x,
      offsetY: clientY - bed.y
    };

    setSelectedBedId(bedId);
  }, [selectedTool, layout.beds]);

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragRef.current.isDragging || !dragRef.current.bedId) return;

    const newX = clientX - dragRef.current.offsetX;
    const newY = clientY - dragRef.current.offsetY;

    // Limitar aos limites do canvas
    const boundedX = Math.max(0, Math.min(layout.canvasSize.width - 60, newX));
    const boundedY = Math.max(0, Math.min(layout.canvasSize.height - 40, newY));

    setLayout(prev => ({
      ...prev,
      beds: prev.beds.map(bed =>
        bed.id === dragRef.current.bedId
          ? { ...bed, x: boundedX, y: boundedY }
          : bed
      )
    }));

    setHasUnsavedChanges(true);
  }, [layout.canvasSize]);

  const endDrag = useCallback(() => {
    dragRef.current.isDragging = false;
    dragRef.current.bedId = null;
  }, []);

  const startDrawing = useCallback((x: number, y: number) => {
    if (selectedTool !== 'draw-wall') return;

    setIsDrawing(true);
    setDrawingStart({ x, y });
  }, [selectedTool]);

  const updateDrawing = useCallback((x: number, y: number) => {
    if (!isDrawing || !drawingStart) return;
    // Temporary visual feedback could be added here
  }, [isDrawing, drawingStart]);

  const endDrawing = useCallback((x: number, y: number) => {
    if (!isDrawing || !drawingStart) return;

    const newWall: Wall = {
      id: `wall-${Date.now()}`,
      x1: drawingStart.x,
      y1: drawingStart.y,
      x2: x,
      y2: y,
      type: 'wall'
    };

    setLayout(prev => ({
      ...prev,
      walls: [...prev.walls, newWall]
    }));

    setHasUnsavedChanges(true);
    setIsDrawing(false);
    setDrawingStart(null);
  }, [isDrawing, drawingStart]);

  const addBed = useCallback((x: number, y: number, unitName: string = 'Nova Unidade') => {
    if (selectedTool !== 'add-bed') return;

    const newBed: BedPosition = {
      id: `bed-${Date.now()}`,
      x: x - 30, // Center the bed
      y: y - 20,
      width: 60,
      height: 40,
      number: `Novo-${Date.now().toString().slice(-3)}`,
      type: 'standard',
      status: 'available',
      unit: unitName
    };

    setLayout(prev => {
      const newUnits = [...prev.units];
      if (!newUnits.includes(unitName)) {
        newUnits.push(unitName);
      }

      return {
        ...prev,
        beds: [...prev.beds, newBed],
        units: newUnits
      };
    });

    setHasUnsavedChanges(true);
  }, [selectedTool]);

  const deleteBed = useCallback((bedId: string) => {
    if (selectedTool !== 'delete') return;

    setLayout(prev => ({
      ...prev,
      beds: prev.beds.filter(bed => bed.id !== bedId)
    }));

    setHasUnsavedChanges(true);
    setSelectedBedId(null);
  }, [selectedTool]);

  const deleteWall = useCallback((wallId: string) => {
    if (selectedTool !== 'delete') return;

    setLayout(prev => ({
      ...prev,
      walls: prev.walls.filter(wall => wall.id !== wallId)
    }));

    setHasUnsavedChanges(true);
  }, [selectedTool]);

  const updateBed = useCallback((bedId: string, updates: Partial<BedPosition>) => {
    setLayout(prev => ({
      ...prev,
      beds: prev.beds.map(bed =>
        bed.id === bedId ? { ...bed, ...updates } : bed
      )
    }));
    setHasUnsavedChanges(true);
  }, []);

  const updateCanvasSize = useCallback((width: number, height: number) => {
    setLayout(prev => ({
      ...prev,
      canvasSize: { width, height }
    }));
  }, []);

  const saveLayout = useCallback(async () => {
    try {
      // Aqui seria feita a chamada para a API
      console.log('Salvando layout:', layout);

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setHasUnsavedChanges(false);
      return { success: true };
    } catch (error) {
      console.error('Erro ao salvar layout:', error);
      return { success: false, error };
    }
  }, [layout]);

  const resetLayout = useCallback(() => {
    if (initialLayout) {
      setLayout(initialLayout);
      setHasUnsavedChanges(false);
    }
  }, [initialLayout]);

  const selectBed = useCallback((bedId: string | null) => {
    setSelectedBedId(bedId);
  }, []);

  return {
    // State
    isEditMode,
    selectedTool,
    selectedBedId,
    isDrawing,
    drawingStart,
    layout,
    hasUnsavedChanges,

    // Actions
    toggleEditMode,
    selectTool,
    startDrag,
    updateDrag,
    endDrag,
    startDrawing,
    updateDrawing,
    endDrawing,
    addBed,
    deleteBed,
    deleteWall,
    updateBed,
    updateCanvasSize,
    saveLayout,
    resetLayout,
    selectBed
  };
};







