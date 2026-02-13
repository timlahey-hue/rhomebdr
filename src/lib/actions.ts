import { Contact, ProspectStage, ActiveStage } from '@/types/bdr';

export interface SuggestedAction {
  icon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const daysSince = (dateStr: string | null): number => {
  if (!dateStr) return 999;
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const daysUntil = (dateStr: string | null): number => {
  if (!dateStr) return -999;
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getProspectActions = (contact: Contact): SuggestedAction[] => {
  const stage = contact.stage as ProspectStage;
  const daysSinceTouch = daysSince(contact.lastTouchDate);
  const actions: SuggestedAction[] = [];

  switch (stage) {
    case 'researching':
      actions.push(
        { icon: '🔍', title: 'Research their recent work', description: 'Review portfolio, press mentions, and recent projects', priority: 'medium' },
        { icon: '🔗', title: 'Find mutual connections', description: 'Check LinkedIn for shared contacts who could introduce you', priority: 'high' },
        { icon: '📝', title: 'Add to watch list', description: 'Set a reminder to check their upcoming projects', priority: 'low' }
      );
      break;
    case 'identified':
      actions.push(
        { icon: '👋', title: 'Warm introduction', description: 'Request an intro via mutual connection', priority: 'high' },
        { icon: '💬', title: 'Comment on recent project', description: 'Engage authentically on their work via social or email', priority: 'medium' },
        { icon: '📧', title: 'Light value email', description: 'Share relevant insight—no pitch, just value', priority: 'medium' }
      );
      break;
    case 'first-contact':
      if (daysSinceTouch > 7) {
        actions.push({ icon: '🔄', title: 'Follow up', description: 'Send a gentle follow-up on your initial outreach', priority: 'high' });
      }
      actions.push(
        { icon: '☕', title: 'Propose a coffee', description: 'Suggest a brief informal meeting', priority: 'medium' },
        { icon: '📰', title: 'Share relevant news', description: 'Forward an article or insight relevant to their work', priority: 'low' }
      );
      break;
    case 'active-conversation':
      actions.push(
        { icon: '🤝', title: 'Deepen the dialogue', description: 'Ask about their current challenges or upcoming projects', priority: 'high' },
        { icon: '🏠', title: 'Offer a site visit', description: 'Invite them to see a recent r:home installation', priority: 'medium' },
        { icon: '📅', title: 'Schedule next touch', description: 'Book a follow-up before this conversation ends', priority: 'medium' }
      );
      break;
    case 'hot-stove':
    case 'identified-competitor':
      if (daysSinceTouch > 14) {
        actions.push({ icon: '⏰', title: 'Reconnect soon', description: `It's been ${daysSinceTouch} days—time for a touchpoint`, priority: 'high' });
      }
      actions.push(
        { icon: '☕', title: 'Coffee or site visit', description: 'Schedule an in-person meeting to strengthen the bond', priority: 'high' },
        { icon: '💡', title: 'Share an insight', description: 'Send a relevant project or trend that benefits them', priority: 'medium' },
        { icon: '🎉', title: 'Invite to event', description: 'Include them in your next walkthrough or open house', priority: 'medium' }
      );
      break;
    case 'ready-for-referral':
      actions.push(
        { icon: '🤝', title: 'Discuss collaboration', description: 'Have a direct conversation about working together', priority: 'high' },
        { icon: '📋', title: 'Clarify referral process', description: 'Make it easy for them to recommend r:home', priority: 'high' },
        { icon: '🎁', title: 'Celebrate the milestone', description: 'Thank them and acknowledge the relationship growth', priority: 'medium' }
      );
      break;
    case 'dormant':
      actions.push(
        { icon: '🔄', title: 'Re-engage gently', description: 'Send a non-salesy check-in or share news', priority: 'medium' },
        { icon: '🔍', title: 'Review & reassess', description: 'Determine if this lead is still worth pursuing', priority: 'low' },
        { icon: '📁', title: 'Archive or wait', description: 'Move to archive if no longer relevant', priority: 'low' }
      );
      break;
  }

  return actions;
};

export const getActiveActions = (contact: Contact): SuggestedAction[] => {
  const stage = contact.stage as ActiveStage;
  const daysSinceTouch = daysSince(contact.lastTouchDate);
  const actions: SuggestedAction[] = [];

  switch (stage) {
    case 'new-relationship':
      actions.push(
        { icon: '🎯', title: 'Set expectations', description: 'Discuss how you can support each other', priority: 'high' },
        { icon: '📅', title: 'Schedule regular check-ins', description: 'Propose monthly or quarterly touchpoints', priority: 'high' },
        { icon: '📧', title: 'Send welcome resources', description: 'Share r:home materials they can reference', priority: 'medium' }
      );
      break;
    case 'active-healthy':
      if (daysSinceTouch > 21) {
        actions.push({ icon: '⏰', title: 'Touch base', description: `${daysSinceTouch} days since last contact—stay top of mind`, priority: 'high' });
      }
      actions.push(
        { icon: '🎉', title: 'Celebrate their wins', description: 'Acknowledge their recent projects or achievements', priority: 'medium' },
        { icon: '🤝', title: 'Ask how to help', description: 'Proactively offer support on their current work', priority: 'medium' },
        { icon: '📰', title: 'Share success stories', description: 'Keep them updated on r:home projects', priority: 'low' }
      );
      break;
    case 'under-engaged':
      actions.push(
        { icon: '📞', title: 'Personal check-in', description: 'Call or meet to reconnect on a personal level', priority: 'high' },
        { icon: '💡', title: 'Share a success story', description: 'Remind them of the value you bring', priority: 'high' },
        { icon: '❓', title: 'Ask about projects', description: 'Inquire about their current and upcoming work', priority: 'medium' },
        { icon: '☕', title: 'Schedule in-person', description: 'Prioritize face-to-face time', priority: 'medium' }
      );
      break;
    case 'strong-advocate':
      actions.push(
        { icon: '🙏', title: 'Express gratitude', description: 'Thank them for their continued support', priority: 'high' },
        { icon: '🎁', title: 'Give back', description: 'Find ways to support their business or refer clients', priority: 'high' },
        { icon: '🌟', title: 'Feature their work', description: 'Highlight their projects in your marketing', priority: 'medium' }
      );
      break;
    case 'at-risk':
      actions.push(
        { icon: '🚨', title: 'Urgent outreach', description: 'Reach out immediately to understand any issues', priority: 'high' },
        { icon: '🔍', title: 'Diagnose the issue', description: 'Identify what caused the relationship to cool', priority: 'high' },
        { icon: '🤝', title: 'Offer to help', description: 'Provide value without expectations', priority: 'medium' }
      );
      break;
    case 'paused':
      actions.push(
        { icon: '📅', title: 'Set reminder', description: 'Schedule a future check-in date', priority: 'medium' },
        { icon: '📝', title: 'Document reasons', description: 'Note why the relationship is paused', priority: 'low' },
        { icon: '👀', title: 'Monitor passively', description: 'Keep an eye on their activity for re-engagement opportunities', priority: 'low' }
      );
      break;
  }

  return actions;
};

export const getSuggestedActions = (contact: Contact): SuggestedAction[] => {
  if (contact.board === 'prospect') {
    return getProspectActions(contact);
  }
  return getActiveActions(contact);
};

export const isOverdue = (contact: Contact): boolean => {
  if (!contact.nextTouchDate) return false;
  return daysUntil(contact.nextTouchDate) < 0;
};

export const isDueSoon = (contact: Contact): boolean => {
  if (!contact.nextTouchDate) return false;
  const days = daysUntil(contact.nextTouchDate);
  return days >= 0 && days <= 7;
};

export const needsAttention = (contact: Contact): boolean => {
  const daysSinceTouch = daysSince(contact.lastTouchDate);
  
  if (contact.board === 'active' && contact.stage === 'under-engaged') return true;
  if (contact.board === 'active' && contact.stage === 'at-risk') return true;
  if (contact.relationshipStrength >= 4 && daysSinceTouch > 14) return true;
  if (daysSinceTouch > 30) return true;
  
  return isOverdue(contact);
};
