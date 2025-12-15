import { PrismaClient } from '@prisma/client';

export interface CreateNotificationData {
  userId?: string;
  role?: string;
  unitId?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  body: string;
  expiresAt?: Date;
}

export interface Notification {
  id: string;
  userId?: string;
  role?: string;
  unitId?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  body: string;
  isRead: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationService {
  constructor(private prisma: PrismaClient) {}

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    // Mock implementation - substituir quando o modelo existir
    return {
      id: Math.random().toString(36).substr(2, 9),
      userId: data.userId,
      role: data.role,
      unitId: data.unitId,
      type: data.type,
      priority: data.priority,
      title: data.title,
      body: data.body,
      isRead: false,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getNotifications(filters: {
    userId?: string;
    role?: string;
    unitId?: string;
    isRead?: boolean;
    type?: string;
    priority?: string;
    limit?: number;
  } = {}): Promise<Notification[]> {
    // Mock implementation
    return [
      {
        id: '1',
        userId: filters.userId || 'mock-user-id',
        role: filters.role || 'enfermeiro',
        unitId: filters.unitId || 'mock-unit-id',
        type: 'warning' as const,
        priority: 'high' as const,
        title: 'Alerta de Estoque Baixo',
        body: 'Medicamento X está com estoque abaixo do mínimo',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        userId: filters.userId || 'mock-user-id',
        role: filters.role || 'enfermeiro',
        unitId: filters.unitId || 'mock-unit-id',
        type: 'info' as const,
        priority: 'medium' as const,
        title: 'Lembrete de Horário',
        body: 'Você tem um compromisso às 14:00',
        isRead: true,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 60 * 60 * 1000)
      }
    ];
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    // Mock implementation
    return {
      id: notificationId,
      userId: 'mock-user-id',
      role: 'enfermeiro',
      unitId: 'mock-unit-id',
      type: 'warning',
      priority: 'high',
      title: 'Alerta de Estoque Baixo',
      body: 'Medicamento X está com estoque abaixo do mínimo',
      isRead: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    // Mock implementation
    return true;
  }

  async deleteOldNotifications(days: number = 30): Promise<number> {
    // Mock implementation
    return 5;
  }

  async getUnreadCount(filters: {
    userId?: string;
    role?: string;
    unitId?: string;
    type?: string;
    priority?: string;
  } = {}): Promise<number> {
    // Mock implementation
    return 3;
  }
}