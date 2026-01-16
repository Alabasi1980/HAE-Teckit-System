
import { WorkItem, Project } from "../shared/types";
import { IAiService } from "../data/contracts";
import { httpClient } from "./httpClient";

/**
 * @class GeminiAiService
 * @description هذه الخدمة "Stateless" تماماً ولا تعرف شيئاً عن Gemini SDK.
 * مهمتها الوحيدة هي توجيه الطلب لنقطة نهاية مؤمنة في السيرفر تقوم بالمعالجة.
 */
export class GeminiAiService implements IAiService {
  async analyzeWorkItem(item: WorkItem): Promise<string> {
    const res = await httpClient.post<{ analysis: string }>('/ai/analyze-work-item', { itemId: item.id });
    return res.analysis;
  }

  async generateDailyReport(project: Project, items: WorkItem[], materials: any[], labor?: any[], machines?: any[]): Promise<string> {
    const res = await httpClient.post<{ report: string }>('/ai/generate-daily-report', { 
       projectId: project.id, 
       context: { itemsCount: items.length, laborCount: labor?.length } 
    });
    return res.report;
  }

  async generateFinancialInsight(project: Project, actualCosts: any): Promise<string> {
    const res = await httpClient.post<{ insight: string }>('/ai/financial-insight', { projectId: project.id, actualCosts });
    return res.insight;
  }

  async suggestPriority(title: string, description: string): Promise<string> {
    const res = await httpClient.post<{ priority: string }>('/ai/suggest-priority', { title, description });
    return res.priority;
  }

  async askWiki(context: string, query: string): Promise<string> {
    const res = await httpClient.post<{ answer: string }>('/ai/ask-wiki', { context, query });
    return res.answer;
  }

  async generateExecutiveBrief(stats: any): Promise<string> {
    const res = await httpClient.post<{ brief: string }>('/ai/executive-brief', { stats });
    return res.brief;
  }

  async analyzeNotification(title: string, message: string): Promise<{ priority: string; category: string; summary?: string }> {
    return await httpClient.post<any>('/ai/analyze-notification', { title, message });
  }
}

export const geminiService = new GeminiAiService();
