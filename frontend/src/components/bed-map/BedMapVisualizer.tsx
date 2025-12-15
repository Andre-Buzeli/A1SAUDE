import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bed,
  User,
  Wrench,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Edit3,
  Eye,
  Save
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BedMapEditor from './BedMapEditor';

interface BedInfo {
  id: string;
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

interface BedMapData {
  units: Record<string, BedInfo[]>;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  maintenanceBeds: number;
}

interface BedMapVisualizerProps {
  bedMap: BedMapData | null;
  loading: boolean;
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
  onSaveLayout?: (layout: any) => Promise<void>;
}

const BedMapVisualizer: React.FC<BedMapVisualizerProps> = ({
  bedMap,
  loading,
  selectedUnit,
  onUnitChange,
  onSaveLayout
}) => {
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

  const getBedStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-500/20 border-green-500/50 text-green-300',
      occupied: 'bg-red-500/20 border-red-500/50 text-red-300',
      maintenance: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
      cleaning: 'bg-blue-500/20 border-blue-500/50 text-blue-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 border-gray-500/50 text-gray-300';
  };

  const getBedStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'occupied':
        return <User className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'cleaning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bed className="w-4 h-4" />;
    }
  };

  const getBedStatusLabel = (status: string) => {
    const labels = {
      available: 'Disponível',
      occupied: 'Ocupado',
      maintenance: 'Manutenção',
      cleaning: 'Limpeza'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getUnitStats = (unitName: string) => {
    if (!bedMap?.units[unitName]) return { total: 0, available: 0, occupied: 0 };
    const beds = bedMap.units[unitName];
    return {
      total: beds.length,
      available: beds.filter(b => b.status === 'available').length,
      occupied: beds.filter(b => b.status === 'occupied').length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const unitsToShow = selectedUnit === 'all'
    ? Object.keys(bedMap?.units || {})
    : [selectedUnit];

  if (viewMode === 'edit') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Editor do Mapa de Leitos</h2>
          <GlassButton
            onClick={() => setViewMode('view')}
            variant="secondary"
          >
            <Eye className="w-4 h-4 mr-2" />
            Modo Visualização
          </GlassButton>
        </div>

        <BedMapEditor
          onSave={async (layout) => {
            if (onSaveLayout) {
              await onSaveLayout(layout);
            }
            setViewMode('view');
          }}
          onCancel={() => setViewMode('view')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with mode toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Mapa de Leitos</h2>
          <p className="text-text-secondary">Visualização e controle de ocupação hospitalar</p>
        </div>

        <GlassButton
          onClick={() => setViewMode('edit')}
          variant="primary"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Modo Edição
        </GlassButton>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total de Leitos</p>
              <p className="text-2xl font-bold text-white">{bedMap?.totalBeds}</p>
            </div>
            <Bed className="w-8 h-8 text-medical-blue" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Disponíveis</p>
              <p className="text-2xl font-bold text-green-300">{bedMap?.availableBeds}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Ocupados</p>
              <p className="text-2xl font-bold text-red-300">{bedMap?.occupiedBeds}</p>
            </div>
            <User className="w-8 h-8 text-red-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Taxa de Ocupação</p>
              <p className="text-2xl font-bold text-medical-purple">
                {bedMap?.totalBeds ?
                  Math.round((bedMap.occupiedBeds / bedMap.totalBeds) * 100)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-medical-purple" />
          </div>
        </GlassCard>
      </div>

      {/* Unit Filter */}
      <GlassCard className="p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-text-secondary" />
          <span className="text-white font-medium">Filtrar por unidade:</span>
          <div className="flex space-x-2">
            <GlassButton
              variant={selectedUnit === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onUnitChange('all')}
              className="text-white"
            >
              Todas
            </GlassButton>
            {bedMap && Object.keys(bedMap.units).map(unitName => (
              <GlassButton
                key={unitName}
                variant={selectedUnit === unitName ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onUnitChange(unitName)}
                className="text-white"
              >
                {unitName}
              </GlassButton>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Unit Beds */}
      <div className="space-y-6">
        {unitsToShow.map(unitName => {
          const beds = bedMap?.units[unitName] || [];
          const stats = getUnitStats(unitName);

          return (
            <motion.div
              key={unitName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{unitName}</h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-text-secondary">
                      {stats.available} disponíveis
                    </span>
                    <span className="text-text-secondary">
                      {stats.occupied} ocupados
                    </span>
                    <span className="text-text-secondary">
                      {stats.total} total
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {beds.map(bed => (
                    <motion.div
                      key={bed.id}
                      whileHover={{ scale: 1.05 }}
                      className={`p-4 rounded-lg border backdrop-blur-sm transition-all cursor-pointer ${getBedStatusColor(bed.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {getBedStatusIcon(bed.status)}
                        <span className="text-xs font-medium">
                          {bed.number}
                        </span>
                      </div>

                      <div className="text-xs text-white/80 mb-2">
                        {getBedStatusLabel(bed.status)}
                      </div>

                      {bed.patient && (
                        <div className="text-xs">
                          <p className="font-medium truncate">{bed.patient.name}</p>
                          <p className="text-white/60">
                            {new Date(bed.patient.admissionDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {(!bedMap || Object.keys(bedMap.units).length === 0) && (
        <GlassCard className="p-8 text-center">
          <Bed className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">Nenhum leito encontrado</p>
        </GlassCard>
      )}
    </div>
  );
};

export default BedMapVisualizer;







