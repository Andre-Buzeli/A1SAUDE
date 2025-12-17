import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Surgery,
  SurgeryRoom,
  SurgeryTeam,
  SurgeryDashboardData,
  SurgerySchedule,
  SurgeryRequest,
  PreOpAssessment,
  PostOpCare,
  SurgeryFilters
} from '@/types/surgery';

export const useSurgery = () => {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [rooms, setRooms] = useState<SurgeryRoom[]>([]);
  const [schedule, setSchedule] = useState<SurgerySchedule[]>([]);
  const [requests, setRequests] = useState<SurgeryRequest[]>([]);
  const [assessments, setAssessments] = useState<PreOpAssessment[]>([]);
  const [postOpCares, setPostOpCares] = useState<PostOpCare[]>([]);
  const [dashboardData, setDashboardData] = useState<SurgeryDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockDashboard: SurgeryDashboardData = {
        totalSurgeriesToday: 12,
        totalSurgeriesMonth: 156,
        surgeriesInProgress: 3,
        surgeriesCompleted: 8,
        surgeriesCancelled: 1,
        averageDuration: 120,
        roomUtilization: 78.5,
        emergencySurgeries: 2,
        rooms: {
          total: 6,
          available: 2,
          occupied: 3,
          maintenance: 1
        },
        team: {
          availableSurgeons: 8,
          availableAnesthetists: 5,
          availableNurses: 12
        }
      };
      setDashboardData(mockDashboard);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar cirurgias
  const loadSurgeries = useCallback(async (filters?: SurgeryFilters) => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockSurgeries: Surgery[] = [
        {
          id: 'surg-1',
          patientId: 'p1',
          patientName: 'João Silva',
          patientAge: 45,
          patientGender: 'M',
          patientBloodType: 'O+',
          patientAllergies: ['Penicilina'],

          scheduledDate: new Date(),
          scheduledTime: '08:00',
          estimatedDuration: 90,
          priority: 'elective',

          procedureCode: 'ABCD123',
          procedureName: 'Colecistectomia videolaparoscópica',
          procedureType: 'Cirurgia Geral',
          description: 'Cirurgia para retirada da vesícula biliar',
          diagnosis: 'Colelitíase sintomática',
          cid10Code: 'K80.2',

          roomId: 'room-1',
          roomNumber: 'Sala 1',

          team: {
            id: 'team-1',
            surgeryId: 'surg-1',
            surgeon: {
              id: 'surgeon-1',
              userId: 'u1',
              name: 'Dr. Carlos Mendes',
              role: 'surgeon',
              specialty: 'Cirurgia Geral',
              licenseNumber: 'CRM12345',
              phone: '(11) 99999-9999',
              isAvailable: true
            },
            anesthetist: {
              id: 'anest-1',
              userId: 'u2',
              name: 'Dra. Ana Paula',
              role: 'anesthetist',
              specialty: 'Anestesiologia',
              licenseNumber: 'CRM67890',
              phone: '(11) 88888-8888',
              isAvailable: true
            },
            scrubNurse: {
              id: 'nurse-1',
              userId: 'u3',
              name: 'Enf. Maria Silva',
              role: 'scrub_nurse',
              licenseNumber: 'COREN123',
              phone: '(11) 77777-7777',
              isAvailable: true
            },
            circulatingNurse: {
              id: 'nurse-2',
              userId: 'u4',
              name: 'Enf. Pedro Santos',
              role: 'circulating_nurse',
              licenseNumber: 'COREN456',
              phone: '(11) 66666-6666',
              isAvailable: true
            }
          },

          anesthesiaType: 'general',
          asaClassification: 2,

          status: 'scheduled',

          materials: [],
          estimatedCost: 2500,

          requestedBy: 'u5',
          requestedByName: 'Dr. Roberto Lima',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setSurgeries(mockSurgeries);
    } catch (err) {
      setError('Erro ao carregar cirurgias');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar salas cirúrgicas
  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockRooms: SurgeryRoom[] = [
        {
          id: 'room-1',
          number: 'Sala 1',
          name: 'Sala Cirurgia Geral',
          type: 'general',
          status: 'occupied',
          capacity: 1,
          equipment: [],
          lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          currentSurgery: 'surg-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'room-2',
          number: 'Sala 2',
          name: 'Sala Cardiovascular',
          type: 'cardiac',
          status: 'available',
          capacity: 1,
          equipment: [],
          lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          nextMaintenance: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setRooms(mockRooms);
    } catch (err) {
      setError('Erro ao carregar salas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Agendar cirurgia
  const scheduleSurgery = useCallback(async (surgeryData: Partial<Surgery>) => {
    try {
      setLoading(true);
      // Mock implementation - substituir por chamada real da API
      console.log('Agendando cirurgia:', surgeryData);

      const newSurgery: Surgery = {
        id: `surg-${Date.now()}`,
        patientId: surgeryData.patientId!,
        patientName: surgeryData.patientName!,
        patientAge: surgeryData.patientAge || 0,
        patientGender: surgeryData.patientGender || 'M',

        scheduledDate: surgeryData.scheduledDate || new Date(),
        scheduledTime: surgeryData.scheduledTime || '08:00',
        estimatedDuration: surgeryData.estimatedDuration || 60,
        priority: surgeryData.priority || 'elective',

        procedureCode: surgeryData.procedureCode || '',
        procedureName: surgeryData.procedureName || '',
        procedureType: surgeryData.procedureType || '',
        description: surgeryData.description || '',

        roomId: surgeryData.roomId || '',
        roomNumber: surgeryData.roomNumber || '',

        team: surgeryData.team || {} as SurgeryTeam,

        anesthesiaType: surgeryData.anesthesiaType || 'general',
        asaClassification: surgeryData.asaClassification || 1,

        status: 'scheduled',

        materials: [],
        requestedBy: 'current-user',
        requestedByName: 'Usuário Atual',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setSurgeries(prev => [newSurgery, ...prev]);

      return { success: true, surgery: newSurgery };
    } catch (err) {
      setError('Erro ao agendar cirurgia');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Iniciar cirurgia
  const startSurgery = useCallback(async (surgeryId: string) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Iniciando cirurgia:', surgeryId);

      setSurgeries(prev => prev.map(surgery =>
        surgery.id === surgeryId
          ? {
              ...surgery,
              status: 'in_progress',
              startTime: new Date()
            }
          : surgery
      ));

      // Atualizar status da sala
      setRooms(prev => prev.map(room =>
        room.currentSurgery === surgeryId
          ? { ...room, status: 'occupied' }
          : room
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao iniciar cirurgia');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Finalizar cirurgia
  const completeSurgery = useCallback(async (surgeryId: string, data: {
    actualDuration?: number;
    complications?: string;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Finalizando cirurgia:', surgeryId, data);

      setSurgeries(prev => prev.map(surgery =>
        surgery.id === surgeryId
          ? {
              ...surgery,
              status: 'completed',
              endTime: new Date(),
              actualDuration: data.actualDuration,
              complications: data.complications,
              notes: data.notes
            }
          : surgery
      ));

      // Liberar sala
      setRooms(prev => prev.map(room =>
        room.currentSurgery === surgeryId
          ? { ...room, status: 'cleaning', currentSurgery: undefined }
          : room
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao finalizar cirurgia');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancelar cirurgia
  const cancelSurgery = useCallback(async (surgeryId: string, reason: string) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Cancelando cirurgia:', surgeryId, reason);

      setSurgeries(prev => prev.map(surgery =>
        surgery.id === surgeryId
          ? {
              ...surgery,
              status: 'cancelled',
              notes: `${surgery.notes || ''}\nCancelada: ${reason}`.trim()
            }
          : surgery
      ));

      // Liberar sala
      setRooms(prev => prev.map(room =>
        room.currentSurgery === surgeryId
          ? { ...room, status: 'available', currentSurgery: undefined }
          : room
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao cancelar cirurgia');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar cirurgias
  const searchSurgeries = useCallback((query: string, filters?: SurgeryFilters) => {
    return surgeries.filter(surgery => {
      const matchesQuery = !query ||
        surgery.patientName.toLowerCase().includes(query.toLowerCase()) ||
        surgery.procedureName.toLowerCase().includes(query.toLowerCase()) ||
        surgery.procedureCode.toLowerCase().includes(query.toLowerCase());

      const matchesFilters = !filters ||
        (!filters.status?.length || filters.status.includes(surgery.status)) &&
        (!filters.priority?.length || filters.priority.includes(surgery.priority)) &&
        (!filters.specialty?.length || filters.specialty.includes(surgery.procedureType));

      return matchesQuery && matchesFilters;
    });
  }, [surgeries]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const today = new Date();
    const todaySurgeries = surgeries.filter(s =>
      s.scheduledDate.toDateString() === today.toDateString()
    );

    return {
      totalSurgeries: surgeries.length,
      todaySurgeries: todaySurgeries.length,
      completedSurgeries: surgeries.filter(s => s.status === 'completed').length,
      inProgressSurgeries: surgeries.filter(s => s.status === 'in_progress').length,
      cancelledSurgeries: surgeries.filter(s => s.status === 'cancelled').length,
      emergencySurgeries: surgeries.filter(s => s.priority === 'emergency').length,
      roomUtilization: rooms.length > 0 ?
        (rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100 : 0,
      averageDuration: surgeries
        .filter(s => s.actualDuration)
        .reduce((sum, s) => sum + (s.actualDuration || 0), 0) /
        surgeries.filter(s => s.actualDuration).length || 0
    };
  }, [surgeries, rooms]);

  // Inicializar dados
  useEffect(() => {
    loadDashboardData();
    loadSurgeries();
    loadRooms();
  }, [loadDashboardData, loadSurgeries, loadRooms]);

  return {
    // State
    surgeries,
    rooms,
    schedule,
    requests,
    assessments,
    postOpCares,
    dashboardData,
    loading,
    error,
    stats,

    // Actions
    loadDashboardData,
    loadSurgeries,
    loadRooms,
    scheduleSurgery,
    startSurgery,
    completeSurgery,
    cancelSurgery,
    searchSurgeries,

    // Utilities
    clearError: () => setError(null)
  };
};









