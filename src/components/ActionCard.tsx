import { useState } from 'react';
import { Contact } from '@/types/bdr';
import { SuggestedAction } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Mail } from 'lucide-react';
import { EmailDraftDialog } from './EmailDraftDialog';

interface ActionCardProps {
  action: SuggestedAction;
  contact?: Contact;
  onClick?: () => void;
}

// Actions that can trigger email drafting
const EMAIL_ACTIONS = [
  'Follow up',
  'Light value email',
  'Warm introduction',
  'Reconnect soon',
  'Personal check-in',
  'Re-engage gently',
  'Share relevant news',
  'Share an insight',
  'Share a success story',
];

export const ActionCard = ({ action, contact, onClick }: ActionCardProps) => {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  const priorityStyles = {
    high: 'border-l-priority-high bg-priority-high/5',
    medium: 'border-l-priority-medium bg-priority-medium/5',
    low: 'border-l-priority-low bg-priority-low/5',
  };

  const canDraftEmail = contact && EMAIL_ACTIONS.some(
    (emailAction) => action.title.toLowerCase().includes(emailAction.toLowerCase())
  );

  const handleClick = () => {
    if (canDraftEmail) {
      setShowEmailDialog(true);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          'w-full text-left p-3 rounded-lg border border-border/50 border-l-2 transition-card',
          'hover:shadow-card hover:border-accent/30',
          priorityStyles[action.priority]
        )}
      >
        <div className="flex items-start gap-2.5">
          <span className="text-lg flex-shrink-0">{action.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm text-foreground">{action.title}</h4>
              {canDraftEmail && (
                <Mail className="h-3.5 w-3.5 text-accent flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {action.description}
            </p>
          </div>
        </div>
      </button>

      {contact && (
        <EmailDraftDialog
          contact={contact}
          action={action}
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
        />
      )}
    </>
  );
};
