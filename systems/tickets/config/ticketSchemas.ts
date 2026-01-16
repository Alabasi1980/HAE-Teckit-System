import { TicketType } from '../../../shared/types';

export interface TicketField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export const TICKET_SCHEMAS: Record<TicketType, { fields: TicketField[] }> = {
  [TicketType.INCIDENT]: {
    fields: [
      { name: 'location_details', label: 'تفاصيل الموقع الدقيقة', type: 'text', required: true, placeholder: 'مثلاً: المبنى B، الطابق 3' },
      { name: 'equipment_id', label: 'معرف المعدة (إن وجد)', type: 'text', required: false },
      { name: 'impact_scope', label: 'نطاق التأثير', type: 'select', required: true, options: ['فردي', 'قسم كامل', 'الموقع بالكامل'] }
    ]
  },
  [TicketType.SERVICE_REQUEST]: {
    fields: [
      { name: 'service_category', label: 'فئة الخدمة', type: 'select', required: true, options: ['دعم تقني', 'صيانة مرافق', 'تصاريح دخول', 'خدمات لوجستية'] },
      { name: 'preferred_time', label: 'الوقت المفضل للتنفيذ', type: 'date', required: false }
    ]
  },
  [TicketType.CHANGE_REQUEST]: {
    fields: [
      { name: 'reason_for_change', label: 'مبررات التغيير', type: 'textarea', required: true },
      { name: 'risk_level', label: 'مستوى المخاطرة', type: 'select', required: true, options: ['منخفض', 'متوسط', 'عالي'] },
      { name: 'rollback_plan', label: 'خطة التراجع في حال الفشل', type: 'textarea', required: true }
    ]
  },
  [TicketType.COMPLAINT]: {
    fields: [
      { name: 'complaint_category', label: 'نوع الشكوى', type: 'select', required: true, options: ['تأخير تنفيذ', 'سلوك مهني', 'جودة مواد', 'أخرى'] },
      { name: 'incident_date', label: 'تاريخ الواقعة', type: 'date', required: true }
    ]
  },
  [TicketType.PROBLEM]: { fields: [] },
  [TicketType.INQUIRY]: { fields: [] }
};
