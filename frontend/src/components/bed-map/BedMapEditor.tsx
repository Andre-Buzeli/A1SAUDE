import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Move,
  PenTool,
  Plus,
  Trash2,
  Save,
  Undo,
  RotateCcw,
  Settings,
  MousePointer
} from 'lucide-react';
import GlassButton from '@/components/ui/GlassButton';
import GlassCard from '@/components/ui/GlassCard';
import { useBedMapEditor, type BedPosition, type Wall, type ToolType } from '@/hooks/useBedMapEditor';

interface BedMapEditorProps {
  initialLayout?: any;
  onSave?: (layout: any) => Promise<void>;
  onCancel?: () => void;
}

const BedMapEditor: React.FC<BedMapEditorProps> = ({
  initialLayout,
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isEditMode,
    selectedTool,
    selectedBedId,
    isDrawing,
    layout,
    hasUnsavedChanges,
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
    saveLayout,
    resetLayout,
    selectBed
  } = useBedMapEditor(initialLayout);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'add-bed') {
      addBed(x, y);
    } else if (selectedTool === 'draw-wall') {
      if (!isDrawing) {
        startDrawing(x, y);
      } else {
        endDrawing(x, y);
      }
    }
  }, [selectedTool, isDrawing, addBed, startDrawing, endDrawing]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'move' && e.buttons === 1) {
      updateDrag(e.clientX, e.clientY);
    } else if (selectedTool === 'draw-wall' && isDrawing) {
      updateDrawing(x, y);
    }
  }, [selectedTool, isDrawing, updateDrag, updateDrawing]);

  const handleBedClick = useCallback((bedId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (selectedTool === 'delete') {
      deleteBed(bedId);
    } else if (selectedTool === 'select') {
      selectBed(selectedBedId === bedId ? null : bedId);
    } else if (selectedTool === 'move') {
      startDrag(bedId, e.clientX, e.clientY);
    }
  }, [selectedTool, selectedBedId, deleteBed, selectBed, startDrag]);

  const handleWallClick = useCallback((wallId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (selectedTool === 'delete') {
      deleteWall(wallId);
    }
  }, [selectedTool, deleteWall]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await saveLayout();
      if (result.success && onSave) {
        await onSave(layout);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getToolIcon = (tool: ToolType) => {
    switch (tool) {
      case 'select': return MousePointer;
      case 'move': return Move;
      case 'draw-wall': return PenTool;
      case 'add-bed': return Plus;
      case 'delete': return Trash2;
      default: return MousePointer;
    }
  };

  const getToolLabel = (tool: ToolType) => {
    switch (tool) {
      case 'select': return 'Selecionar';
      case 'move': return 'Mover';
      case 'draw-wall': return 'Desenhar Parede';
      case 'add-bed': return 'Adicionar Leito';
      case 'delete': return 'Apagar';
      default: return tool;
    }
  };

  const getBedStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-500/20 border-green-500/50',
      occupied: 'bg-red-500/20 border-red-500/50',
      maintenance: 'bg-yellow-500/20 border-yellow-500/50',
      cleaning: 'bg-blue-500/20 border-blue-500/50'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 border-gray-500/50';
  };

  const tools: ToolType[] = ['select', 'move', 'draw-wall', 'add-bed', 'delete'];

  return (
    <div className="space-y-4">
      {/* Header with tools */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">
              Editor Visual do Mapa de Leitos
            </h3>
            {hasUnsavedChanges && (
              <span className="text-yellow-400 text-sm flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse" />
                Alterações não salvas
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <GlassButton
              onClick={resetLayout}
              variant="secondary"
              size="sm"
              disabled={!hasUnsavedChanges}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </GlassButton>

            <GlassButton
              onClick={handleSave}
              variant="primary"
              size="sm"
              disabled={!hasUnsavedChanges || isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </GlassButton>
          </div>
        </div>

        {/* Tool Selection */}
        <div className="flex items-center space-x-2">
          <span className="text-white/80 text-sm mr-2">Ferramentas:</span>
          {tools.map((tool) => {
            const Icon = getToolIcon(tool);
            return (
              <GlassButton
                key={tool}
                onClick={() => selectTool(tool)}
                variant={selectedTool === tool ? 'primary' : 'ghost'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{getToolLabel(tool)}</span>
              </GlassButton>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-3 p-3 bg-white/5 rounded-lg">
          <p className="text-white/70 text-sm">
            <strong>Instruções:</strong>{' '}
            {selectedTool === 'select' && 'Clique em um leito para selecioná-lo e ver detalhes.'}
            {selectedTool === 'move' && 'Clique e arraste um leito para reposicioná-lo.'}
            {selectedTool === 'draw-wall' && 'Clique e arraste para desenhar paredes.'}
            {selectedTool === 'add-bed' && 'Clique na área vazia para adicionar um novo leito.'}
            {selectedTool === 'delete' && 'Clique em um leito ou parede para removê-lo.'}
          </p>
        </div>
      </GlassCard>

      {/* Canvas */}
      <GlassCard className="p-4">
        <div
          ref={canvasRef}
          className="relative bg-slate-800/50 border-2 border-dashed border-white/20 rounded-lg overflow-hidden"
          style={{
            width: layout.canvasSize.width,
            height: layout.canvasSize.height,
            cursor: selectedTool === 'add-bed' ? 'crosshair' :
                   selectedTool === 'draw-wall' ? 'crosshair' :
                   selectedTool === 'move' ? 'grab' : 'default'
          }}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={endDrag}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Walls */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {layout.walls.map((wall) => (
              <line
                key={wall.id}
                x1={wall.x1}
                y1={wall.y1}
                x2={wall.x2}
                y2={wall.y2}
                stroke="#ffffff"
                strokeWidth="2"
                className={`${
                  selectedTool === 'delete' ? 'cursor-pointer pointer-events-auto hover:stroke-red-400' : ''
                }`}
                onClick={(e) => handleWallClick(wall.id, e)}
              />
            ))}

            {/* Drawing preview */}
            {isDrawing && drawingStart && (
              <line
                x1={drawingStart.x}
                y1={drawingStart.y}
                x2={drawingStart.x} // This would be updated by mouse move
                y2={drawingStart.y}
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </svg>

          {/* Beds */}
          {layout.beds.map((bed) => (
            <motion.div
              key={bed.id}
              className={`absolute p-2 rounded border backdrop-blur-sm cursor-pointer transition-all ${
                getBedStatusColor(bed.status)
              } ${
                selectedBedId === bed.id ? 'ring-2 ring-medical-blue shadow-lg scale-105' : ''
              } ${
                selectedTool === 'delete' ? 'hover:border-red-400 hover:bg-red-500/20' : ''
              }`}
              style={{
                left: bed.x,
                top: bed.y,
                width: bed.width,
                height: bed.height,
                zIndex: selectedBedId === bed.id ? 10 : 1
              }}
              onClick={(e) => handleBedClick(bed.id, e)}
              whileHover={{ scale: selectedTool !== 'delete' ? 1.05 : 1 }}
              drag={selectedTool === 'move'}
              dragMomentum={false}
              onDragStart={(e) => {
                const rect = e.target.getBoundingClientRect();
                startDrag(bed.id, e.clientX, e.clientY);
              }}
              onDrag={(e) => {
                updateDrag(e.clientX, e.clientY);
              }}
              onDragEnd={endDrag}
            >
              <div className="flex flex-col items-center justify-center h-full text-xs">
                <div className="font-semibold text-white text-center">
                  {bed.number}
                </div>
                <div className="text-white/70 text-center truncate w-full">
                  {bed.unit}
                </div>
                {bed.patient && (
                  <div className="text-white/60 text-center truncate w-full mt-1">
                    {bed.patient.name.split(' ')[0]}
                  </div>
                )}
              </div>

              {/* Delete indicator */}
              {selectedTool === 'delete' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <Trash2 className="w-2 h-2 text-white" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Selected bed details */}
          <AnimatePresence>
            {selectedBedId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-4 right-4 z-20"
              >
                <GlassCard className="p-4 min-w-64">
                  <BedDetailsPanel
                    bed={layout.beds.find(b => b.id === selectedBedId)!}
                    onUpdate={(updates) => updateBed(selectedBedId, updates)}
                    onClose={() => selectBed(null)}
                  />
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Footer with stats */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-white/70">
              Leitos: <span className="text-white font-semibold">{layout.beds.length}</span>
            </span>
            <span className="text-white/70">
              Unidades: <span className="text-white font-semibold">{layout.units.length}</span>
            </span>
            <span className="text-white/70">
              Paredes: <span className="text-white font-semibold">{layout.walls.length}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white/70">
              Canvas: {layout.canvasSize.width} × {layout.canvasSize.height}
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

// Componente para editar detalhes do leito selecionado
interface BedDetailsPanelProps {
  bed: BedPosition;
  onUpdate: (updates: Partial<BedPosition>) => void;
  onClose: () => void;
}

const BedDetailsPanel: React.FC<BedDetailsPanelProps> = ({ bed, onUpdate, onClose }) => {
  const [editing, setEditing] = useState(false);
  const [tempBed, setTempBed] = useState(bed);

  const handleSave = () => {
    onUpdate(tempBed);
    setEditing(false);
  };

  const handleCancel = () => {
    setTempBed(bed);
    setEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-white">Detalhes do Leito</h4>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          ✕
        </button>
      </div>

      {!editing ? (
        <div className="space-y-2">
          <p><span className="text-white/70">Número:</span> <span className="text-white">{bed.number}</span></p>
          <p><span className="text-white/70">Unidade:</span> <span className="text-white">{bed.unit}</span></p>
          <p><span className="text-white/70">Tipo:</span> <span className="text-white">{bed.type}</span></p>
          <p><span className="text-white/70">Status:</span> <span className="text-white">{bed.status}</span></p>
          {bed.patient && (
            <div>
              <p className="text-white/70">Paciente:</p>
              <p className="text-white text-sm">{bed.patient.name}</p>
              <p className="text-white/60 text-sm">
                Desde: {new Date(bed.patient.admissionDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}

          <GlassButton onClick={() => setEditing(true)} size="sm" className="w-full">
            Editar
          </GlassButton>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-white/70 text-sm mb-1">Número</label>
            <input
              type="text"
              value={tempBed.number}
              onChange={(e) => setTempBed(prev => ({ ...prev, number: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Unidade</label>
            <input
              type="text"
              value={tempBed.unit}
              onChange={(e) => setTempBed(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Tipo</label>
            <select
              value={tempBed.type}
              onChange={(e) => setTempBed(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            >
              <option value="standard">Padrão</option>
              <option value="icu">UTI</option>
              <option value="surgery">Cirúrgico</option>
            </select>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1">Status</label>
            <select
              value={tempBed.status}
              onChange={(e) => setTempBed(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
            >
              <option value="available">Disponível</option>
              <option value="occupied">Ocupado</option>
              <option value="maintenance">Manutenção</option>
              <option value="cleaning">Limpeza</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <GlassButton onClick={handleSave} size="sm" className="flex-1">
              Salvar
            </GlassButton>
            <GlassButton onClick={handleCancel} variant="secondary" size="sm" className="flex-1">
              Cancelar
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedMapEditor;









