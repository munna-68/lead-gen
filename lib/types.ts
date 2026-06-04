export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'engaged'
  | 'pitched'
  | 'no_response'
  | 'closed'
  | 'dead';

export type LeadQuality = 'warm' | 'cold';

export interface Lead {
  id: string;
  name: string;
  business_name: string | null;
  niche: string;
  location: string;
  facebook_url: string | null;
  facebook_page_url: string | null;
  post_url: string | null;
  website: string | null;
  has_website: boolean | null;
  post_context: string;
  message_1_hook: string;
  lead_quality: LeadQuality;
  source_group: string;
  skip_reason: string | null;
  status: LeadStatus;
  msg1_sent: boolean;
  msg1_seen: boolean;
  msg1_replied: boolean;
  msg2_sent: boolean;
  msg2_replied: boolean;
  msg3_sent: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkippedLead extends Omit<Lead, 'skip_reason'> {
  skip_reason: string;
}

export interface StatsResponse {
  total: number;
  warm: number;
  contacted: number;
  replied: number;
  pitched: number;
  closed: number;
}

export interface ImportResult {
  inserted: number;
  skipped: number;
  duplicates: number;
  errors: string[];
}
