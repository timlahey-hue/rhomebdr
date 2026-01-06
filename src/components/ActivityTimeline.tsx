import { useAllContactActivity } from '@/hooks/useContactActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, ArrowRight, Eye, Calendar, GitBranch, Utensils } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'stage_change':
      return <GitBranch className="h-3.5 w-3.5" />;
    case 'board_change':
      return <ArrowRight className="h-3.5 w-3.5" />;
    case 'touch':
      return <Calendar className="h-3.5 w-3.5" />;
    case 'watched':
      return <Eye className="h-3.5 w-3.5" />;
    case 'lunch_meeting':
      return <Utensils className="h-3.5 w-3.5" />;
    default:
      return <Activity className="h-3.5 w-3.5" />;
  }
};

const getActivityLabel = (type: string) => {
  switch (type) {
    case 'stage_change':
      return 'Stage Change';
    case 'board_change':
      return 'Board Change';
    case 'touch':
      return 'Touch Logged';
    case 'watched':
      return 'Watch Status';
    case 'created':
      return 'Created';
    case 'lunch_meeting':
      return 'Lunch Meeting';
    default:
      return type;
  }
};

const formatStageName = (stage: string | null) => {
  if (!stage) return '';
  return stage
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface ActivityTimelineProps {
  maxItems?: number;
}

export const ActivityTimeline = ({ maxItems = 50 }: ActivityTimelineProps) => {
  const { activities, isLoading } = useAllContactActivity();

  // Calculate days between consecutive activities for the same contact
  const activitiesWithDuration = activities.slice(0, maxItems).map((activity, index) => {
    // Find the previous activity for this contact
    const previousActivity = activities
      .slice(index + 1)
      .find((a) => a.contactId === activity.contactId);
    
    let daysSincePrevious: number | null = null;
    if (previousActivity) {
      daysSincePrevious = differenceInDays(
        parseISO(activity.createdAt),
        parseISO(previousActivity.createdAt)
      );
    }

    return { ...activity, daysSincePrevious };
  });

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading activity...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent" />
          Activity Timeline
          <Badge variant="secondary" className="text-xs font-normal">
            {activities.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activitiesWithDuration.length > 0 ? (
            <div className="space-y-3">
              {activitiesWithDuration.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30"
                >
                  <div className="p-1.5 rounded bg-accent/10 text-accent mt-0.5">
                    {getActivityIcon(activity.activityType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">
                        {activity.contactName}
                      </span>
                      {activity.contactCompany && (
                        <span className="text-xs text-muted-foreground">
                          • {activity.contactCompany}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {getActivityLabel(activity.activityType)}
                      </Badge>
                      {activity.fromValue && activity.toValue && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {formatStageName(activity.fromValue)}
                          <ArrowRight className="h-3 w-3" />
                          {formatStageName(activity.toValue)}
                        </span>
                      )}
                      {activity.toValue && !activity.fromValue && (
                        <span className="text-xs text-muted-foreground">
                          → {formatStageName(activity.toValue)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(parseISO(activity.createdAt), { addSuffix: true })}
                      </span>
                      {activity.daysSincePrevious !== null && activity.daysSincePrevious > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] font-normal"
                        >
                          {activity.daysSincePrevious}d since last activity
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No activity recorded yet. Activity will appear here as you interact with contacts.
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
