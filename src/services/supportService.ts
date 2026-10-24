import { apiClient } from './apiClient';
import { storage } from '../utils/storage';
import { GroupInquiryRequest, CorporateInquiryRequest, SupportTicket } from '../types/insurance';
import { demoGeneralFaqs } from '../data/demoFaqs';
import { demoGlossaryTerms, GlossaryTerm } from '../data/demoGlossary';

const USE_MOCK = !process.env.EXPO_PUBLIC_API_URL;

export const supportService = {
  /**
   * Submit Group Insurance inquiry
   */
  async submitGroupInquiry(inquiry: Omit<GroupInquiryRequest, 'id' | 'status' | 'submittedAt'>): Promise<GroupInquiryRequest> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const record: GroupInquiryRequest = {
        ...inquiry,
        id: `grp_${Date.now()}`,
        status: 'received',
        submittedAt: new Date().toISOString(),
      };
      const existing = (await storage.getItem<GroupInquiryRequest[]>('group_inquiries')) || [];
      await storage.setItem('group_inquiries', [record, ...existing]);
      return record;
    }
    const response = await apiClient.post<GroupInquiryRequest>('/inquiries/group', inquiry);
    return response.data;
  },

  /**
   * Submit Corporate Insurance inquiry
   */
  async submitCorporateInquiry(
    inquiry: Omit<CorporateInquiryRequest, 'id' | 'status' | 'submittedAt'>
  ): Promise<CorporateInquiryRequest> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const record: CorporateInquiryRequest = {
        ...inquiry,
        id: `corp_${Date.now()}`,
        status: 'received',
        submittedAt: new Date().toISOString(),
      };
      const existing = (await storage.getItem<CorporateInquiryRequest[]>('corp_inquiries')) || [];
      await storage.setItem('corp_inquiries', [record, ...existing]);
      return record;
    }
    const response = await apiClient.post<CorporateInquiryRequest>('/inquiries/corporate', inquiry);
    return response.data;
  },

  /**
   * Submit user support ticket or callback request
   */
  async submitSupportTicket(ticket: {
    subject: string;
    category: 'policy' | 'claim' | 'renewal' | 'portability' | 'general';
    message: string;
  }): Promise<SupportTicket> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const newTicket: SupportTicket = {
        id: `tkt_${Date.now()}`,
        ticketNumber: `TK-${Math.floor(100000 + Math.random() * 900000)}`,
        subject: ticket.subject,
        category: ticket.category,
        message: ticket.message,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      const existing = (await storage.getItem<SupportTicket[]>('support_tickets')) || [];
      await storage.setItem('support_tickets', [newTicket, ...existing]);
      return newTicket;
    }
    const response = await apiClient.post<SupportTicket>('/support/tickets', ticket);
    return response.data;
  },

  /**
   * Search FAQs
   */
  getFaqs(query?: string) {
    if (!query || query.trim() === '') return demoGeneralFaqs;
    const q = query.toLowerCase();
    return demoGeneralFaqs.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  },

  /**
   * Search Glossary
   */
  getGlossary(query?: string): GlossaryTerm[] {
    if (!query || query.trim() === '') return demoGlossaryTerms;
    const q = query.toLowerCase();
    return demoGlossaryTerms.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
  },
};
