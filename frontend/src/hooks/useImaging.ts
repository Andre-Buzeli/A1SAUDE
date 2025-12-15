import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ImagingExam,
  ImagingEquipment,
  ImagingDashboardData,
  ImagingWorklist,
  ImagingFilters,
  ImagingReport
} from '@/types/imaging';

export const useImaging = () => {
  const [exams, setExams] = useState<ImagingExam[]>([]);
  const [equipment, setEquipment] = useState<ImagingEquipment[]>([]);
  const [worklists, setWorklists] = useState<ImagingWorklist[]>([]);
  const [dashboardData, setDashboardData] = useState<ImagingDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockDashboard: ImagingDashboardData = {
        totalExamsToday: 87,
        totalExamsMonth: 2156,
        examsByType: {
          'Raio-X': 45,
          'Ultrassonografia': 23,
          'Tomografia': 12,
          'Ressonância': 7
        },
        equipmentStatus: {
          operational: 8,
          maintenance: 2,
          broken: 1,
          total: 11
        },
        averageWaitTime: 45,
        averageReportTime: 2.5,
        criticalFindings: 5,
        pendingReports: 12,
        utilizationRate: 78.5,
        technicianWorkload: 85.2,
        roomUtilization: {
          'Sala 1': 92.3,
          'Sala 2': 76.8,
          'Sala 3': 68.4,
          'Sala 4': 84.1
        }
      };
      setDashboardData(mockDashboard);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar exames
  const loadExams = useCallback(async (filters?: ImagingFilters) => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockExams: ImagingExam[] = [
        {
          id: 'exam-1',
          patientId: 'p1',
          patientName: 'João Silva',
          patientAge: 45,
          patientGender: 'M',
          patientBirthDate: new Date('1979-01-15'),

          requestedBy: 'dr1',
          requestedByName: 'Dr. Maria Santos',
          requestingDepartment: 'Clínica Médica',
          clinicalIndication: 'Dor torácica',
          urgency: 'urgent',

          examType: {
            id: 'rx',
            code: 'RX',
            name: 'Raio-X de Tórax',
            category: 'radiography',
            description: 'Radiografia do tórax',
            typicalDuration: 15,
            requiresContrast: false,
            active: true
          },
          examCode: 'CH',
          examName: 'Raio-X de Tórax',
          bodyRegion: ['Tórax'],
          laterality: null,
          contrast: false,

          scheduledDate: new Date(),
          scheduledTime: '10:00',

          technicianId: 'tech1',
          technicianName: 'Ana Costa',

          equipmentId: 'equip1',
          equipmentName: 'Raio-X Digital',
          roomNumber: 'Sala 1',

          status: 'completed',

          images: [],
          qualityControl: {
            id: 'qc1',
            examId: 'exam-1',
            equipmentId: 'equip1',
            kvp: 120,
            mas: 2.5,
            qualityScore: 8.5,
            passFail: true,
            performedBy: 'tech1',
            performedAt: new Date()
          },

          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setExams(mockExams);
    } catch (err) {
      setError('Erro ao carregar exames');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar equipamentos
  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - substituir por chamada real da API
      const mockEquipment: ImagingEquipment[] = [
        {
          id: 'equip1',
          name: 'Raio-X Digital',
          model: 'DRX-Revolution',
          manufacturer: 'Carestream',
          serialNumber: 'RX2023001',
          type: 'radiography',
          roomNumber: 'Sala 1',
          location: 'Centro de Imagem',

          specifications: {
            voltage: 220,
            current: 16,
            power: 3500,
            detectorType: 'DR'
          },

          status: 'operational',
          lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          lastCalibration: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          nextCalibration: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),

          utilizationHours: 1247,
          totalExams: 3456,
          availability: 92.3,

          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setEquipment(mockEquipment);
    } catch (err) {
      setError('Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Solicitar exame
  const requestExam = useCallback(async (examData: Partial<ImagingExam>) => {
    try {
      setLoading(true);
      // Mock implementation - substituir por chamada real da API
      console.log('Solicitando exame:', examData);

      const newExam: ImagingExam = {
        id: `exam-${Date.now()}`,
        patientId: examData.patientId!,
        patientName: examData.patientName!,
        patientAge: examData.patientAge || 0,
        patientGender: examData.patientGender || 'M',
        patientBirthDate: examData.patientBirthDate || new Date(),

        requestedBy: examData.requestedBy || 'current-user',
        requestedByName: examData.requestedByName || 'Usuário Atual',
        requestingDepartment: examData.requestingDepartment || '',
        clinicalIndication: examData.clinicalIndication || '',
        urgency: examData.urgency || 'routine',

        examType: examData.examType!,
        examCode: examData.examCode || '',
        examName: examData.examName || '',
        bodyRegion: examData.bodyRegion || [],
        laterality: examData.laterality || null,
        contrast: examData.contrast || false,

        technicianId: 'auto-assign',
        technicianName: 'Técnico Automático',

        equipmentId: 'auto-assign',
        equipmentName: 'Equipamento Automático',
        roomNumber: 'Auto',

        status: 'requested',

        images: [],
        qualityControl: {
          id: `qc-${Date.now()}`,
          examId: `exam-${Date.now()}`,
          equipmentId: 'auto-assign',
          qualityScore: 0,
          passFail: false,
          performedBy: 'system',
          performedAt: new Date()
        },

        createdAt: new Date(),
        updatedAt: new Date()
      };

      setExams(prev => [newExam, ...prev]);

      return { success: true, exam: newExam };
    } catch (err) {
      setError('Erro ao solicitar exame');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Agendar exame
  const scheduleExam = useCallback(async (examId: string, date: Date, time: string) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Agendando exame:', examId, date, time);

      setExams(prev => prev.map(exam =>
        exam.id === examId
          ? {
              ...exam,
              scheduledDate: date,
              scheduledTime: time,
              status: 'scheduled'
            }
          : exam
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao agendar exame');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Iniciar exame
  const startExam = useCallback(async (examId: string) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Iniciando exame:', examId);

      setExams(prev => prev.map(exam =>
        exam.id === examId
          ? {
              ...exam,
              status: 'in_progress',
              performedDate: new Date(),
              performedTime: new Date().toTimeString().slice(0, 5)
            }
          : exam
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao iniciar exame');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Finalizar exame
  const completeExam = useCallback(async (examId: string, data: {
    images?: any[];
    qualityControl?: any;
  }) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Finalizando exame:', examId, data);

      setExams(prev => prev.map(exam =>
        exam.id === examId
          ? {
              ...exam,
              status: 'completed',
              images: data.images || exam.images,
              qualityControl: data.qualityControl || exam.qualityControl
            }
          : exam
      ));

      return { success: true };
    } catch (err) {
      setError('Erro ao finalizar exame');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar laudo
  const createReport = useCallback(async (examId: string, reportData: Partial<ImagingReport>) => {
    try {
      setLoading(true);
      // Mock implementation
      console.log('Criando laudo:', examId, reportData);

      const report: ImagingReport = {
        id: `report-${Date.now()}`,
        examId,
        radiologistId: reportData.radiologistId || 'current-user',
        radiologistName: reportData.radiologistName || 'Usuário Atual',
        findings: reportData.findings || '',
        impression: reportData.impression || '',
        conclusion: reportData.conclusion || '',
        recommendations: reportData.recommendations || '',
        severity: reportData.severity || 'normal',
        status: 'final',
        createdAt: new Date(),
        updatedAt: new Date(),
        reportDate: new Date()
      };

      setExams(prev => prev.map(exam =>
        exam.id === examId
          ? {
              ...exam,
              report,
              status: 'reported'
            }
          : exam
      ));

      return { success: true, report };
    } catch (err) {
      setError('Erro ao criar laudo');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar exames
  const searchExams = useCallback((query: string, filters?: ImagingFilters) => {
    return exams.filter(exam => {
      const matchesQuery = !query ||
        exam.patientName.toLowerCase().includes(query.toLowerCase()) ||
        exam.examName.toLowerCase().includes(query.toLowerCase()) ||
        exam.examCode.toLowerCase().includes(query.toLowerCase());

      const matchesFilters = !filters ||
        (!filters.status?.length || filters.status.includes(exam.status)) &&
        (!filters.examType?.length || filters.examType.includes(exam.examType.category)) &&
        (!filters.urgency?.length || filters.urgency.includes(exam.urgency));

      return matchesQuery && matchesFilters;
    });
  }, [exams]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const today = new Date();
    const todayExams = exams.filter(exam =>
      exam.scheduledDate && exam.scheduledDate.toDateString() === today.toDateString()
    );

    return {
      totalExams: exams.length,
      todayExams: todayExams.length,
      completedExams: exams.filter(e => e.status === 'completed').length,
      pendingExams: exams.filter(e => e.status === 'requested' || e.status === 'scheduled').length,
      urgentExams: exams.filter(e => e.urgency === 'urgent' || e.urgency === 'emergency').length,
      equipmentAvailable: equipment.filter(e => e.status === 'operational').length,
      averageWaitTime: 45, // mock
      utilizationRate: equipment.length > 0 ?
        (equipment.filter(e => e.status === 'operational').length / equipment.length) * 100 : 0
    };
  }, [exams, equipment]);

  // Inicializar dados
  useEffect(() => {
    loadDashboardData();
    loadExams();
    loadEquipment();
  }, [loadDashboardData, loadExams, loadEquipment]);

  return {
    // State
    exams,
    equipment,
    worklists,
    dashboardData,
    loading,
    error,
    stats,

    // Actions
    loadDashboardData,
    loadExams,
    loadEquipment,
    requestExam,
    scheduleExam,
    startExam,
    completeExam,
    createReport,
    searchExams,

    // Utilities
    clearError: () => setError(null)
  };
};







