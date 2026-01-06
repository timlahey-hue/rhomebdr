import { useState } from 'react';
import { Contact } from '@/types/bdr';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, Loader2, ExternalLink } from 'lucide-react';

interface ScheduleFollowupDialogProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled?: (date: string) => void;
}

export const ScheduleFollowupDialog = ({
  contact,
  open,
  onOpenChange,
  onScheduled,
}: ScheduleFollowupDialogProps) => {
  const { isConnected, isConnecting, connect, createEvent } = useGoogleCalendar();
  const [isCreating, setIsCreating] = useState(false);

  // Default to next business day at 10am
  const getDefaultDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    return date.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getDefaultDate());
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState(`Follow up with ${contact.name} at ${contact.company}`);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'Could not initiate Google Calendar connection.',
        variant: 'destructive',
      });
    }
  };

  const handleSchedule = async () => {
    if (!isConnected) {
      await handleConnect();
      return;
    }

    setIsCreating(true);
    try {
      const startDateTime = new Date(`${date}T${time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60 * 1000);

      await createEvent({
        summary: `Follow up: ${contact.name} (${contact.company})`,
        description: `${notes}\n\n---\nContact: ${contact.name}\nCompany: ${contact.company}\nRole: ${contact.role}\nRelationship: ${contact.relationshipType}`,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
      });

      toast({
        title: 'Follow-up scheduled',
        description: `Added to your calendar for ${new Date(startDateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at ${time}`,
      });

      if (onScheduled) {
        onScheduled(date);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      toast({
        title: 'Failed to schedule',
        description: error instanceof Error ? error.message : 'Could not create calendar event.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Schedule Follow-up
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm font-medium">{contact.name}</p>
            <p className="text-xs text-muted-foreground">{contact.company} • {contact.role}</p>
          </div>

          {!isConnected && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-center">
              <Calendar className="h-8 w-8 text-accent/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Connect Google Calendar to schedule follow-ups
              </p>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Connect Google Calendar
              </Button>
            </div>
          )}

          {isConnected && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Duration (minutes)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="15"
                  max="120"
                  step="15"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 min-h-[80px]"
                  placeholder="Add context for this follow-up..."
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {isConnected && (
            <Button
              onClick={handleSchedule}
              disabled={isCreating}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Add to Calendar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
