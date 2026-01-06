import { Contact } from '@/types/bdr';
import { RelationshipStrength } from './RelationshipStrength';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Building2, Globe, Sparkles, Loader2 } from 'lucide-react';
import { isOverdue, isDueSoon, needsAttention } from '@/lib/actions';
import { useContactResearch } from '@/hooks/useContactResearch';

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
  isDragging?: boolean;
  onResearchComplete?: () => void;
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatNextDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ContactCard = ({ contact, onClick, isDragging, onResearchComplete }: ContactCardProps) => {
  const overdue = isOverdue(contact);
  const dueSoon = isDueSoon(contact);
  const attention = needsAttention(contact);
  const { researchContact, isResearching } = useContactResearch();

  const handleResearch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await researchContact(contact);
    onResearchComplete?.();
  };

  const isCurrentlyResearching = isResearching === contact.id;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-card rounded-lg p-3 cursor-pointer transition-card border border-border/60',
        'hover:shadow-card-hover hover:border-accent/30',
        isDragging && 'shadow-card-hover rotate-2 scale-105',
        attention && 'border-l-2 border-l-highlight'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm text-foreground truncate leading-snug">
            {contact.name}
          </h4>
          <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
            <Building2 className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs truncate">{contact.company}</span>
          </div>
        </div>
        <RelationshipStrength strength={contact.relationshipStrength} />
      </div>

      {/* Website */}
      {contact.website && (
        <div className="flex items-center gap-1 text-muted-foreground mb-2">
          <Globe className="h-3 w-3 flex-shrink-0" />
          <a 
            href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs truncate hover:text-accent hover:underline"
          >
            {contact.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        </div>
      )}

      {/* AI Summary */}
      {contact.aiSummary && (
        <div className="bg-accent/5 border border-accent/20 rounded p-2 mb-2">
          <p className="text-xs text-foreground/80 line-clamp-3">
            {contact.aiSummary}
          </p>
          {contact.aiAvPartners && (
            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
              <span className="font-medium">AV Partners:</span> {contact.aiAvPartners}
            </p>
          )}
        </div>
      )}

      {/* Research button if no summary yet */}
      {!contact.aiSummary && contact.website && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResearch}
          disabled={isCurrentlyResearching}
          className="w-full mb-2 h-7 text-xs"
        >
          {isCurrentlyResearching ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 mr-1" />
              Research Contact
            </>
          )}
        </Button>
      )}

      {/* Role badge */}
      <div className="flex items-center gap-1.5 mb-2">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
          {contact.role}
        </Badge>
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] px-1.5 py-0 font-normal border-accent/30",
            contact.relationshipType === 'Active Partner' && 'bg-accent/10 text-accent border-accent/40'
          )}
        >
          {contact.relationshipType}
        </Badge>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(contact.lastTouchDate)}</span>
        </div>
        <div className={cn(
          "flex items-center gap-1",
          overdue && "text-destructive font-medium",
          dueSoon && !overdue && "text-highlight font-medium"
        )}>
          <Calendar className="h-3 w-3" />
          <span>{formatNextDate(contact.nextTouchDate)}</span>
        </div>
      </div>

      {/* Tags preview */}
      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/40">
          {contact.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
          {contact.tags.length > 2 && (
            <span className="text-[10px] text-muted-foreground">
              +{contact.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
