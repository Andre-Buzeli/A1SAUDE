import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  getNotifications = async (req: Request, res: Response) => {
    try {
      const { id: userId } = req.user!;
      const { limit = 50 } = req.query;

      const notifications = await this.notificationService.getUserNotifications(userId, Number(limit));

      res.status(200).json({
        success: true,
        data: notifications,
        message: 'Notificações obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'NOTIFICATIONS_FETCH_FAILED'
        }
      });
    }
  };

  getUnreadCount = async (req: Request, res: Response) => {
    try {
      const { id: userId } = req.user!;

      const count = await this.notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { count },
        message: 'Contagem de notificações não lidas obtida com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'UNREAD_COUNT_FETCH_FAILED'
        }
      });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user!;

      const notification = await this.notificationService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        data: notification,
        message: 'Notificação marcada como lida'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'NOTIFICATION_MARK_READ_FAILED'
        }
      });
    }
  };

  createNotification = async (req: Request, res: Response) => {
    try {
      const notification = await this.notificationService.createNotification(req.body);

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notificação criada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'NOTIFICATION_CREATION_FAILED'
        }
      });
    }
  };
}
