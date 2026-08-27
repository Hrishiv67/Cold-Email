export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  title: string;
  created_at: string;
}

export interface Template {
  id: number;
  name: string;
  subject: string;
  body: string;
  created_at: string;
}

export interface Campaign {
  id: number;
  name: string;
  template_id: number;
  status: string;
  created_at: string;
}

export interface CampaignWithStats extends Campaign {
  template_name: string;
  sent_count: number;
}

export interface Send {
  id: number;
  campaign_id: number;
  contact_id: number;
  rendered_subject: string;
  rendered_body: string;
  status: string;
  sent_at: string;
}

export interface SendWithContact extends Send {
  first_name: string;
  last_name: string;
  email: string;
  company: string;
}
