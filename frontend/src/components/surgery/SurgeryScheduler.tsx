import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Save,
  X,
  Search,
  Plus
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import { useSurgery } from '@/hooks/useSurgery';
import { Surgery, SurgeryTeam, SurgeryTeamMember } from '@/types/surgery';

interface SurgerySchedulerProps {
  onScheduled?: (surgery: Surgery) => void;
  onCancel?: () => void;
}

const SurgeryScheduler: React.FC<SurgerySchedulerProps> = ({
  onScheduled,
  onCancel
}) => {
  const { rooms, scheduleSurgery, loading } = useSurgery();

  const [form, setForm] = useState({
    // Patient Info
    patientId: '',
    patientName: '',
    patientAge: '',
    patientGender: 'M' as 'M' | 'F',
    patientBloodType: '',
    patientAllergies: '',

    // Surgery Info
    procedureCode: '',
    procedureName: '',
    procedureType: '',
    description: '',
    diagnosis: '',
    cid10Code: '',

    // Scheduling
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: '',
    priority: 'elective' as 'elective' | 'urgent' | 'emergency',

    // Location
    roomId: '',

    // Anesthesia
    anesthesiaType: 'general' as 'general' | 'regional' | 'local' | 'sedation' | 'none',
    asaClassification: 2,

    // Team
    surgeonId: '',
    surgeonName: '',
    assistantId: '',
    assistantName: '',
    anesthetistId: '',
    anesthetistName: '',
    scrubNurseId: '',
    scrubNurseName: '',
    circulatingNurseId: '',
    circulatingNurseName: '',

    // Additional
    estimatedCost: '',
    specialRequirements: '',
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [availableRooms, setAvailableRooms] = useState(rooms);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Mock data for team members
  const mockTeamMembers: SurgeryTeamMember[] = [
    {
      id: 'surgeon-1',
      userId: 'u1',
      name: 'Dr. Carlos Mendes',
      role: 'surgeon',
      specialty: 'Cirurgia Geral',
      licenseNumber: 'CRM12345',
      phone: '(11) 99999-9999',
      isAvailable: true
    },
    {
      id: 'surgeon-2',
      userId: 'u2',
      name: 'Dra. Ana Silva',
      role: 'surgeon',
      specialty: 'Cirurgia Vascular',
      licenseNumber: 'CRM67890',
      phone: '(11) 88888-8888',
      isAvailable: true
    },
    {
      id: 'anest-1',
      userId: 'u3',
      name: 'Dr. Roberto Lima',
      role: 'anesthetist',
      specialty: 'Anestesiologia',
      licenseNumber: 'CRM54321',
      phone: '(11) 77777-7777',
      isAvailable: true
    }
  ];

  const filteredTeamMembers = mockTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.patientName.trim()) errors.patientName = 'Nome do paciente é obrigatório';
    if (!form.procedureName.trim()) errors.procedureName = 'Nome do procedimento é obrigatório';
    if (!form.scheduledDate) errors.scheduledDate = 'Data é obrigatória';
    if (!form.scheduledTime) errors.scheduledTime = 'Horário é obrigatório';
    if (!form.estimatedDuration) errors.estimatedDuration = 'Duração estimada é obrigatória';
    if (!form.roomId) errors.roomId = 'Sala é obrigatória';
    if (!form.surgeonId) errors.surgeonId = 'Cirurgião é obrigatório';
    if (!form.anesthetistId) errors.anesthetistId = 'Anestesista é obrigatório';

    // Validate date is not in the past
    if (form.scheduledDate) {
      const selectedDate = new Date(`${form.scheduledDate}T${form.scheduledTime}`);
      const now = new Date();
      if (selectedDate <= now) {
        errors.scheduledDate = 'Data/hora deve ser futura';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const surgeryData = {
        patientId: form.patientId || `temp-${Date.now()}`,
        patientName: form.patientName,
        patientAge: parseInt(form.patientAge) || 0,
        patientGender: form.patientGender,
        patientBloodType: form.patientBloodType,
        patientAllergies: form.patientAllergies.split(',').map(a => a.trim()).filter(a => a),

        scheduledDate: new Date(`${form.scheduledDate}T${form.scheduledTime}`),
        scheduledTime: form.scheduledTime,
        estimatedDuration: parseInt(form.estimatedDuration),
        priority: form.priority,

        procedureCode: form.procedureCode,
        procedureName: form.procedureName,
        procedureType: form.procedureType,
        description: form.description,
        diagnosis: form.diagnosis,
        cid10Code: form.cid10Code,

        roomId: form.roomId,
        roomNumber: rooms.find(r => r.id === form.roomId)?.number || '',

        team: {
          id: `team-${Date.now()}`,
          surgeryId: '',
          surgeon: mockTeamMembers.find(m => m.id === form.surgeonId)!,
          assistant: form.assistantId ? mockTeamMembers.find(m => m.id === form.assistantId) : undefined,
          anesthetist: mockTeamMembers.find(m => m.id === form.anesthetistId)!,
          scrubNurse: mockTeamMembers.find(m => m.id === form.scrubNurseId)!,
          circulatingNurse: mockTeamMembers.find(m => m.id === form.circulatingNurseId)!,
        } as SurgeryTeam,

        anesthesiaType: form.anesthesiaType,
        asaClassification: form.asaClassification as 1 | 2 | 3 | 4 | 5 | 6,

        materials: [],
        estimatedCost: parseFloat(form.estimatedCost) || undefined,

        requestedBy: 'current-user',
        requestedByName: 'Usuário Atual'
      };

      const result = await scheduleSurgery(surgeryData);

      if (result.success && onScheduled) {
        onScheduled(result.surgery!);
      }
    } catch (error) {
      console.error('Erro ao agendar cirurgia:', error);
    }
  };

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectTeamMember = (role: string, member: SurgeryTeamMember) => {
    updateForm(`${role}Id`, member.id);
    updateForm(`${role}Name`, member.name);
    setSearchTerm('');
  };

  const availableRoomsForDate = rooms.filter(room =>
    room.status === 'available' &&
    room.isActive
  );

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Agendar Cirurgia</h3>
            <p className="text-white/70 text-sm">
              Preencha os dados para agendar uma nova cirurgia
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onCancel && (
              <GlassButton onClick={onCancel} variant="secondary">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </GlassButton>
            )}
            <GlassButton
              onClick={handleSubmit}
              disabled={loading}
              variant="primary"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Agendando...' : 'Agendar Cirurgia'}
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Patient Information */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Informações do Paciente
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GlassInput
            label="Nome do Paciente *"
            placeholder="Digite o nome completo"
            value={form.patientName}
            onChange={(value) => updateForm('patientName', value)}
            error={validationErrors.patientName}
            required
          />

          <GlassInput
            label="Idade"
            type="number"
            placeholder="Ex: 45"
            value={form.patientAge}
            onChange={(value) => updateForm('patientAge', value)}
          />

          <div>
            <label className="block text-white/80 text-sm mb-2">Gênero</label>
            <select
              value={form.patientGender}
              onChange={(e) => updateForm('patientGender', e.target.value as 'M' | 'F')}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>

          <GlassInput
            label="Tipo Sanguíneo"
            placeholder="Ex: O+"
            value={form.patientBloodType}
            onChange={(value) => updateForm('patientBloodType', value)}
          />

          <div className="md:col-span-2">
            <GlassInput
              label="Alergias"
              placeholder="Separe por vírgula (Ex: Penicilina, Dipirona)"
              value={form.patientAllergies}
              onChange={(value) => updateForm('patientAllergies', value)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Procedure Information */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Procedimento Cirúrgico
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Código do Procedimento"
            placeholder="Ex: ABCD123"
            value={form.procedureCode}
            onChange={(value) => updateForm('procedureCode', value)}
          />

          <GlassInput
            label="Nome do Procedimento *"
            placeholder="Ex: Colecistectomia"
            value={form.procedureName}
            onChange={(value) => updateForm('procedureName', value)}
            error={validationErrors.procedureName}
            required
          />

          <GlassInput
            label="Tipo de Cirurgia"
            placeholder="Ex: Cirurgia Geral"
            value={form.procedureType}
            onChange={(value) => updateForm('procedureType', value)}
          />

          <GlassInput
            label="Código CID-10"
            placeholder="Ex: K80.2"
            value={form.cid10Code}
            onChange={(value) => updateForm('cid10Code', value)}
          />

          <div className="md:col-span-2">
            <GlassInput
              label="Diagnóstico"
              placeholder="Descrição do diagnóstico"
              value={form.diagnosis}
              onChange={(value) => updateForm('diagnosis', value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-white/80 text-sm mb-2">
              Descrição do Procedimento
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Descrição detalhada do procedimento cirúrgico"
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white resize-none"
              rows={3}
            />
          </div>
        </div>
      </GlassCard>

      {/* Scheduling */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Agendamento
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Data *</label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => updateForm('scheduledDate', e.target.value)}
              className={`w-full bg-white/10 border rounded px-3 py-2 text-white ${
                validationErrors.scheduledDate ? 'border-red-500' : 'border-white/20'
              }`}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {validationErrors.scheduledDate && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.scheduledDate}</p>
            )}
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Horário *</label>
            <input
              type="time"
              value={form.scheduledTime}
              onChange={(e) => updateForm('scheduledTime', e.target.value)}
              className={`w-full bg-white/10 border rounded px-3 py-2 text-white ${
                validationErrors.scheduledTime ? 'border-red-500' : 'border-white/20'
              }`}
              required
            />
            {validationErrors.scheduledTime && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.scheduledTime}</p>
            )}
          </div>

          <GlassInput
            label="Duração Estimada (min) *"
            type="number"
            placeholder="Ex: 90"
            value={form.estimatedDuration}
            onChange={(value) => updateForm('estimatedDuration', value)}
            error={validationErrors.estimatedDuration}
            min="1"
            required
          />

          <div>
            <label className="block text-white/80 text-sm mb-2">Prioridade</label>
            <select
              value={form.priority}
              onChange={(e) => updateForm('priority', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            >
              <option value="elective">Eletiva</option>
              <option value="urgent">Urgente</option>
              <option value="emergency">Emergência</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Location and Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Selection */}
        <GlassCard className="p-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Sala Cirúrgica
          </h4>

          <div className="space-y-4">
            {availableRoomsForDate.map((room) => (
              <div
                key={room.id}
                onClick={() => updateForm('roomId', room.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  form.roomId === room.id
                    ? 'border-medical-blue bg-medical-blue/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{room.name} ({room.number})</p>
                    <p className="text-white/60 text-sm">Tipo: {room.type} • Capacidade: {room.capacity}</p>
                  </div>
                  {form.roomId === room.id && (
                    <CheckCircle className="w-5 h-5 text-medical-blue" />
                  )}
                </div>
              </div>
            ))}

            {availableRoomsForDate.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <p className="text-white/60">Nenhuma sala disponível</p>
              </div>
            )}

            {validationErrors.roomId && (
              <p className="text-red-400 text-sm">{validationErrors.roomId}</p>
            )}
          </div>
        </GlassCard>

        {/* Team Selection */}
        <GlassCard className="p-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Equipe Cirúrgica
          </h4>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar profissional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
              />
            </div>

            {/* Team Roles */}
            <div className="space-y-3">
              {[
                { key: 'surgeon', label: 'Cirurgião Principal *', required: true },
                { key: 'assistant', label: 'Cirurgião Assistente', required: false },
                { key: 'anesthetist', label: 'Anestesista *', required: true },
                { key: 'scrubNurse', label: 'Instrumentador *', required: true },
                { key: 'circulatingNurse', label: 'Circulante *', required: true }
              ].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-white/80 text-sm mb-1">{label}</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={form[`${key}Name` as keyof typeof form] as string || ''}
                      readOnly
                      placeholder="Selecione..."
                      className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                    />
                    <GlassButton
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        // Open selection modal (simplified for now)
                        const selected = filteredTeamMembers[0];
                        if (selected) selectTeamMember(key, selected);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </GlassButton>
                  </div>
                  {validationErrors[`${key}Id`] && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors[`${key}Id`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Anesthesia and Additional Info */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Anestesia e Informações Adicionais
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Tipo de Anestesia</label>
            <select
              value={form.anesthesiaType}
              onChange={(e) => updateForm('anesthesiaType', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            >
              <option value="general">Geral</option>
              <option value="regional">Regional</option>
              <option value="local">Local</option>
              <option value="sedation">Sedação</option>
              <option value="none">Nenhuma</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Classificação ASA</label>
            <select
              value={form.asaClassification}
              onChange={(e) => updateForm('asaClassification', parseInt(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            >
              <option value={1}>ASA 1 - Saudável</option>
              <option value={2}>ASA 2 - Doença leve</option>
              <option value={3}>ASA 3 - Doença grave</option>
              <option value={4}>ASA 4 - Doença grave que ameaça a vida</option>
              <option value={5}>ASA 5 - Moribundo</option>
              <option value={6}>ASA 6 - Morte cerebral</option>
            </select>
          </div>

          <GlassInput
            label="Custo Estimado (R$)"
            type="number"
            placeholder="0.00"
            value={form.estimatedCost}
            onChange={(value) => updateForm('estimatedCost', value)}
            step="0.01"
            min="0"
          />

          <div className="md:col-span-3">
            <GlassInput
              label="Requisitos Especiais"
              placeholder="Equipamentos especiais, materiais específicos, etc."
              value={form.specialRequirements}
              onChange={(value) => updateForm('specialRequirements', value)}
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-white/80 text-sm mb-2">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              placeholder="Observações adicionais sobre a cirurgia"
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white resize-none"
              rows={3}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default SurgeryScheduler;









