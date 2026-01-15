import { WorkItem, Status, Priority } from '../../shared/types';

export interface WorkItemDTO {
  id: string;
  item_title: string;
  item_desc: string;
  item_type: string;
  item_priority: string;
  item_status: string;
  project_id: string;
  assignee_id?: string;
  creator_id?: string;
  created_at: string;
  due_date: string;
  tags?: string[];
  comments?: any[];
  approval_chain?: any[];
}

export class WorkItemMapper {
  static toDomain(dto: WorkItemDTO): WorkItem {
    return {
      id: dto.id,
      title: dto.item_title,
      description: dto.item_desc,
      type: dto.item_type as any,
      priority: dto.item_priority as Priority,
      status: dto.item_status as Status,
      projectId: dto.project_id,
      assigneeId: dto.assignee_id,
      creatorId: dto.creator_id,
      createdAt: dto.created_at,
      dueDate: dto.due_date,
      tags: dto.tags || [],
      comments: dto.comments || [],
      approvalChain: dto.approval_chain || []
    };
  }

  static toDTO(domain: Partial<WorkItem>): Partial<WorkItemDTO> {
    return {
      id: domain.id,
      item_title: domain.title,
      item_desc: domain.description,
      item_type: domain.type,
      item_priority: domain.priority,
      item_status: domain.status,
      project_id: domain.projectId,
      assignee_id: domain.assigneeId,
      creator_id: domain.creatorId,
      created_at: domain.createdAt,
      due_date: domain.dueDate,
      tags: domain.tags
    };
  }
}