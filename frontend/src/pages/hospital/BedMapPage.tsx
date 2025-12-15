import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import BedMapVisualizer from '@/components/bed-map/BedMapVisualizer';

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

const BedMapPage: React.FC = () => {
  const { user } = useAuth();
  const [bedMap, setBedMap] = useState<BedMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  useEffect(() => {
    loadBedMap();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadBedMap, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedUnit]);

  const loadBedMap = async () => {
    try {
      // Mock data - replace with actual API call
      const mockData: BedMapData = {
        units: {
          'Enfermaria Geral': [
            {
              id: '1',
              number: '101',
              type: 'standard',
              status: 'occupied',
              unit: 'Enfermaria Geral',
              patient: {
                id: 'p1',
                name: 'João Silva',
                admissionDate: '2024-01-15'
              }
            },
            {
              id: '2',
              number: '102',
              type: 'standard',
              status: 'available',
              unit: 'Enfermaria Geral'
            },
            {
              id: '3',
              number: '103',
              type: 'standard',
              status: 'maintenance',
              unit: 'Enfermaria Geral'
            }
          ],
          'UTI': [
            {
              id: '4',
              number: '201',
              type: 'icu',
              status: 'occupied',
              unit: 'UTI',
              patient: {
                id: 'p2',
                name: 'Maria Santos',
                admissionDate: '2024-01-14'
              }
            },
            {
              id: '5',
              number: '202',
              type: 'icu',
              status: 'occupied',
              unit: 'UTI',
              patient: {
                id: 'p3',
                name: 'Pedro Oliveira',
                admissionDate: '2024-01-13'
              }
            }
          ],
          'Centro Cirúrgico': [
            {
              id: '6',
              number: 'Sala 1',
              type: 'surgery',
              status: 'available',
              unit: 'Centro Cirúrgico'
            },
            {
              id: '7',
              number: 'Sala 2',
              type: 'surgery',
              status: 'maintenance',
              unit: 'Centro Cirúrgico'
            }
          ]
        },
        totalBeds: 7,
        availableBeds: 2,
        occupiedBeds: 3,
        maintenanceBeds: 2
      };

      setBedMap(mockData);
    } catch (error) {
      console.error('Erro ao carregar mapa de leitos:', error);
      toast.error('Erro ao carregar mapa de leitos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLayout = async (layout: any) => {
    try {
      // Aqui seria implementada a chamada para a API
      console.log('Salvando layout do mapa de leitos:', layout);
      toast.success('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar layout:', error);
      toast.error('Erro ao salvar layout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Mapa de Leitos
          </h1>
          <p className="text-text-secondary">
            {user?.establishmentName} - Controle de ocupação hospitalar
          </p>
        </motion.div>

        <BedMapVisualizer
          bedMap={bedMap}
          loading={loading}
          selectedUnit={selectedUnit}
          onUnitChange={setSelectedUnit}
          onSaveLayout={handleSaveLayout}
        />
      </div>
    </div>
  );
};

export default BedMapPage;
