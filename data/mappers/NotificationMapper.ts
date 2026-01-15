import { Notification, NotificationPriority, NotificationCategory } from '../../shared/types';

export interface NotificationDTO {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  relatedItemId?: string;
  aiSummary?: string;
}

export class NotificationMapper {
  static toDomain(dto: NotificationDTO): Notification {
    return {
      id: dto.notificationId,
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type as any,
      priority: dto.priority as NotificationPriority,
      category: dto.category as NotificationCategory,
      isRead: dto.isRead,
      createdAt: dto.createdAt,
      relatedItemId: dto.relatedItemId,
      aiSummary: dto.aiSummary
    };
  }

  static toDTO(domain: Partial<Notification>): Partial<NotificationDTO> {
    return {
      notificationId: domain.id,
      userId: domain.userId,
      title: domain.title,
      message: domain.message,
      type: domain.type,
      priority: domain.priority,
      category: domain.category,
      isRead: domain.isRead,
      createdAt: domain.createdAt,
      relatedItemId: domain.relatedItemId,
      aiSummary: domain.aiSummary
    };
  }
}
