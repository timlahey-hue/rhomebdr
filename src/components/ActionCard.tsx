import { SuggestedAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  action: SuggestedAction;
  onClick?: () => void;
}

export const ActionCard = ({ action, onClick }: ActionCardProps) => {
  const priorityStyles = {
    high: 'border-l-priority-high bg-priority-high/5',
    medium: 'border-l-priority-medium bg-priority-medium/5',
    low: 'border-l-priority-low bg-priority-low/5',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border border-border/50 border-l-2 transition-card',
        'hover:shadow-card hover:border-accent/30',
        priorityStyles[action.priority]
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-lg flex-shrink-0">{action.icon}</span>
        <div className="min-w-0">
          <h4 className="font-medium text-sm text-foreground">{action.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {action.description}
          </p>
        </div>
      </div>
    </button>
  );
};
