export type RoleType = 'Architect' | 'Builder' | 'Interior Designer' | 'Landscape Designer' | 'Real Estate Advisor' | 'Other';

export type RelationshipType = 'Target' | 'Active Partner' | 'Influencer';

export type CompanyType = 'Design Build' | 'Architecture Firm' | 'Contractor' | 'Other';

export type ProspectStage = 
  | 'researching'
  | 'identified'
  | 'first-contact'
  | 'active-conversation'
  | 'warm-relationship'
  | 'ready-for-referral'
  | 'dormant';

export type ActiveStage = 
  | 'new-relationship'
  | 'active-healthy'
  | 'under-engaged'
  | 'strong-advocate'
  | 'at-risk'
  | 'paused';

export type TierLevel = 1 | 2 | 3;

export interface Contact {
  id: string;
  name: string;
  company: string;
  role: RoleType;
  relationshipType: RelationshipType;
  lastTouchDate: string | null;
  nextTouchDate: string | null;
  statusNotes: string;
  relationshipStrength: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  board: 'prospect' | 'active';
  stage: ProspectStage | ActiveStage;
  createdAt: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  title?: string;
  companyType?: CompanyType;
  aiSummary?: string;
  aiAvPartners?: string;
  watched?: boolean;
  tier?: TierLevel;
  secondaryContactName?: string;
  secondaryContactTitle?: string;
  secondaryContactPhone?: string;
  secondaryContactEmail?: string;
}

export interface Column<T extends string> {
  id: T;
  title: string;
  color: string;
}

export const PROSPECT_COLUMNS: Column<ProspectStage>[] = [
  { id: 'researching', title: 'Researching', color: 'bg-column-research' },
  { id: 'identified', title: 'Identified', color: 'bg-column-identified' },
  { id: 'first-contact', title: 'First Contact', color: 'bg-column-contact' },
  { id: 'active-conversation', title: 'Active Conversation', color: 'bg-column-active' },
  { id: 'warm-relationship', title: 'Warm Relationship', color: 'bg-column-warm' },
  { id: 'ready-for-referral', title: 'Ready for Referral', color: 'bg-column-ready' },
  { id: 'dormant', title: 'Dormant', color: 'bg-column-dormant' },
];

export const ACTIVE_COLUMNS: Column<ActiveStage>[] = [
  { id: 'new-relationship', title: 'New Relationship', color: 'bg-column-new' },
  { id: 'active-healthy', title: 'Active & Healthy', color: 'bg-column-healthy' },
  { id: 'under-engaged', title: 'Under-Engaged', color: 'bg-column-underengaged' },
  { id: 'strong-advocate', title: 'Strong Advocate', color: 'bg-column-advocate' },
  { id: 'at-risk', title: 'At Risk', color: 'bg-column-risk' },
  { id: 'paused', title: 'Paused', color: 'bg-column-paused' },
];

export const ROLE_OPTIONS: RoleType[] = [
  'Architect',
  'Builder',
  'Interior Designer',
  'Landscape Designer',
  'Real Estate Advisor',
  'Other',
];

export const RELATIONSHIP_TYPE_OPTIONS: RelationshipType[] = [
  'Target',
  'Active Partner',
  'Influencer',
];

export const COMPANY_TYPE_OPTIONS: CompanyType[] = [
  'Design Build',
  'Architecture Firm',
  'Contractor',
  'Other',
];
