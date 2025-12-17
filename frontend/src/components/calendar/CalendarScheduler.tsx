/**
 * Componente de Calendário Visual para Agendamentos
 * Sistema A1 Saúde
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Clock,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Stethoscope,
  Syringe,
  TestTube,
  Scissors
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';

export interface CalendarEvent {
  id: string;
  title: string;
  patient: {
    id: string;
    name: string;
  };
  professional?: {
    id: string;
    name: string;
  };
  start: Date;
  end: Date;
  type: 'consultation' | 'procedure' | 'vaccination' | 'exam' | 'surgery';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

interface CalendarSchedulerProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date, hour?: number) => void;
  onAddEvent?: () => void;
  view?: 'month' | 'week' | 'day';
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7h às 19h

export const CalendarScheduler: React.FC<CalendarSchedulerProps> = ({
  events,
  onEventClick,
  onSlotClick,
  onAddEvent,
  view: initialView = 'month'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>(initialView);

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      consultation: 'bg-blue-500/30 border-blue-500 text-blue-200',
      procedure: 'bg-purple-500/30 border-purple-500 text-purple-200',
      vaccination: 'bg-green-500/30 border-green-500 text-green-200',
      exam: 'bg-yellow-500/30 border-yellow-500 text-yellow-200',
      surgery: 'bg-red-500/30 border-red-500 text-red-200'
    };
    return colors[type] || 'bg-gray-500/30 border-gray-500 text-gray-200';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="w-3 h-3" />;
      case 'vaccination':
        return <Syringe className="w-3 h-3" />;
      case 'exam':
        return <TestTube className="w-3 h-3" />;
      case 'surgery':
        return <Scissors className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const getStatusDot = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-400',
      confirmed: 'bg-green-400',
      in_progress: 'bg-yellow-400',
      completed: 'bg-emerald-400',
      cancelled: 'bg-red-400'
    };
    return colors[status] || 'bg-gray-400';
  };

  // Navegação
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'month') navigateMonth(direction);
    else if (view === 'week') navigateWeek(direction);
    else navigateDay(direction);
  };

  const goToToday = () => setCurrentDate(new Date());

  // Gerar dias do mês
  const getMonthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Dias do mês anterior
    const prevMonth = new Date(year, month, 0);
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentDate]);

  // Gerar dias da semana
  const getWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }, [currentDate]);

  // Filtrar eventos por dia
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  // Filtrar eventos por hora
  const getEventsForHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate() &&
        eventDate.getHours() === hour
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Renderizar evento
  const renderEvent = (event: CalendarEvent, compact = false) => (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        ${getEventColor(event.type)} 
        border-l-2 rounded px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity
        ${compact ? 'text-xs' : 'text-sm'}
      `}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick?.(event);
      }}
    >
      <div className="flex items-center space-x-1">
        {getEventIcon(event.type)}
        <span className={`${getStatusDot(event.status)} w-1.5 h-1.5 rounded-full`} />
        {!compact && <span className="truncate">{formatTime(event.start)}</span>}
      </div>
      <p className="truncate font-medium">{event.patient.name}</p>
      {!compact && event.professional && (
        <p className="truncate text-xs opacity-70">{event.professional.name}</p>
      )}
    </motion.div>
  );

  // Renderizar visão mensal
  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Header dias da semana */}
      {DAYS.map(day => (
        <div key={day} className="p-2 text-center text-text-secondary text-sm font-medium">
          {day}
        </div>
      ))}

      {/* Dias do mês */}
      {getMonthDays.map(({ date, isCurrentMonth }, index) => {
        const dayEvents = getEventsForDate(date);
        const today = isToday(date);

        return (
          <div
            key={index}
            onClick={() => onSlotClick?.(date)}
            className={`
              min-h-[100px] p-1 border border-white/5 rounded cursor-pointer
              transition-colors hover:bg-white/5
              ${!isCurrentMonth ? 'opacity-40' : ''}
              ${today ? 'bg-medical-blue/10 border-medical-blue/30' : ''}
            `}
          >
            <div className={`
              text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full
              ${today ? 'bg-medical-blue text-white' : 'text-white'}
            `}>
              {date.getDate()}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map(event => renderEvent(event, true))}
              {dayEvents.length > 3 && (
                <p className="text-xs text-text-secondary text-center">
                  +{dayEvents.length - 3} mais
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Renderizar visão semanal
  const renderWeekView = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-white/10">
          <div className="p-2 text-center text-text-secondary text-sm">Horário</div>
          {getWeekDays.map((day, index) => (
            <div
              key={index}
              className={`p-2 text-center ${isToday(day) ? 'bg-medical-blue/10' : ''}`}
            >
              <p className="text-text-secondary text-sm">{DAYS[day.getDay()]}</p>
              <p className={`text-lg font-bold ${isToday(day) ? 'text-medical-blue' : 'text-white'}`}>
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Grid de horários */}
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b border-white/5">
            <div className="p-2 text-center text-text-secondary text-xs">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {getWeekDays.map((day, index) => {
              const hourEvents = getEventsForHour(day, hour);
              return (
                <div
                  key={index}
                  onClick={() => onSlotClick?.(day, hour)}
                  className={`
                    min-h-[60px] p-1 border-l border-white/5 cursor-pointer
                    hover:bg-white/5 transition-colors
                    ${isToday(day) ? 'bg-medical-blue/5' : ''}
                  `}
                >
                  {hourEvents.map(event => renderEvent(event, true))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizar visão diária
  const renderDayView = () => (
    <div className="space-y-1">
      <div className="text-center p-4 border-b border-white/10">
        <p className="text-2xl font-bold text-white">
          {currentDate.getDate()} de {MONTHS[currentDate.getMonth()]}
        </p>
        <p className="text-text-secondary">{DAYS[currentDate.getDay()]}</p>
      </div>

      {HOURS.map(hour => {
        const hourEvents = getEventsForHour(currentDate, hour);
        return (
          <div
            key={hour}
            onClick={() => onSlotClick?.(currentDate, hour)}
            className="grid grid-cols-12 border-b border-white/5 hover:bg-white/5 cursor-pointer"
          >
            <div className="col-span-1 p-3 text-text-secondary text-sm text-right pr-4">
              {hour.toString().padStart(2, '0')}:00
            </div>
            <div className="col-span-11 p-2 min-h-[70px] space-y-1">
              {hourEvents.map(event => renderEvent(event))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <GlassCard className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <GlassButton size="sm" variant="ghost" onClick={() => navigate('prev')}>
              <ChevronLeft className="w-5 h-5" />
            </GlassButton>
            <h2 className="text-xl font-bold text-white min-w-[200px] text-center">
              {view === 'day' 
                ? `${currentDate.getDate()} de ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              }
            </h2>
            <GlassButton size="sm" variant="ghost" onClick={() => navigate('next')}>
              <ChevronRight className="w-5 h-5" />
            </GlassButton>
            <GlassButton size="sm" variant="secondary" onClick={goToToday}>
              Hoje
            </GlassButton>
          </div>

          <div className="flex items-center space-x-2">
            {/* View switcher */}
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  view === 'month' ? 'bg-medical-blue text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  view === 'week' ? 'bg-medical-blue text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  view === 'day' ? 'bg-medical-blue text-white' : 'text-text-secondary hover:text-white'
                }`}
              >
                Dia
              </button>
            </div>

            {onAddEvent && (
              <GlassButton variant="primary" size="sm" onClick={onAddEvent}>
                <Plus className="w-4 h-4 mr-2" />
                Agendar
              </GlassButton>
            )}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="px-4 py-2 border-b border-white/10 flex items-center space-x-4 flex-wrap gap-2">
        <span className="text-text-secondary text-xs">Tipos:</span>
        <span className="flex items-center space-x-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-text-secondary">Consulta</span>
        </span>
        <span className="flex items-center space-x-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-text-secondary">Vacinação</span>
        </span>
        <span className="flex items-center space-x-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-text-secondary">Exame</span>
        </span>
        <span className="flex items-center space-x-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-text-secondary">Procedimento</span>
        </span>
        <span className="flex items-center space-x-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-text-secondary">Cirurgia</span>
        </span>
      </div>

      {/* Calendar Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${currentDate.toISOString()}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </GlassCard>
  );
};

export default CalendarScheduler;








