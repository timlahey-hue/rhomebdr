import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Utensils, Plus, Trash2, Target, TrendingUp, Calendar } from 'lucide-react';
import { useBDRGoals } from '@/hooks/useBDRGoals';
import { useContactActivity } from '@/hooks/useContactActivity';
import { Contact } from '@/types/bdr';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface GoalTrackerProps {
  contacts: Contact[];
}

export function GoalTracker({ contacts }: GoalTrackerProps) {
  const {
    weeklyTimeLogs,
    monthlyLunchMeetings,
    totalWeeklyHours,
    weeklyProgress,
    weeklyGoal,
    lunchMeetingsCount,
    lunchProgress,
    lunchGoal,
    addTimeLog,
    addLunchMeeting,
    deleteTimeLog,
    deleteLunchMeeting,
  } = useBDRGoals();

  const { logActivity } = useContactActivity();

  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [lunchDialogOpen, setLunchDialogOpen] = useState(false);
  const [hours, setHours] = useState('');
  const [timeNotes, setTimeNotes] = useState('');
  const [lunchContact, setLunchContact] = useState('');
  const [lunchNotes, setLunchNotes] = useState('');
  const [lunchDate, setLunchDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAddTime = async () => {
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      toast.error('Please enter valid hours');
      return;
    }
    try {
      await addTimeLog.mutateAsync({ hours: hoursNum, notes: timeNotes || undefined });
      toast.success('Time logged');
      setHours('');
      setTimeNotes('');
      setTimeDialogOpen(false);
    } catch {
      toast.error('Failed to log time');
    }
  };

  const handleAddLunch = async () => {
    const selectedContactId = lunchContact === 'none' ? undefined : lunchContact || undefined;
    try {
      await addLunchMeeting.mutateAsync({
        contactId: selectedContactId,
        notes: lunchNotes || undefined,
        date: lunchDate,
      });
      
      // Also log as contact activity if a contact was selected
      if (selectedContactId) {
        const contact = contacts.find(c => c.id === selectedContactId);
        await logActivity({
          contactId: selectedContactId,
          activityType: 'lunch_meeting',
          toValue: lunchDate,
          notes: lunchNotes || `Lunch meeting${contact ? ` with ${contact.name}` : ''}`,
        });
      }
      
      toast.success('Lunch meeting logged');
      setLunchContact('');
      setLunchNotes('');
      setLunchDate(format(new Date(), 'yyyy-MM-dd'));
      setLunchDialogOpen(false);
    } catch {
      toast.error('Failed to log lunch meeting');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Weekly BDR Time Goal */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Weekly BDR Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">This Week</span>
              <span className="font-medium">
                {totalWeeklyHours.toFixed(1)} / {weeklyGoal} hrs
                <span className="text-muted-foreground ml-1">
                  ({weeklyProgress.toFixed(0)}%)
                </span>
              </span>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Goal: 75% of 40-hour week = {weeklyGoal} hours on BDR
            </p>
          </div>

          <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Log BDR Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log BDR Time</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium">Hours</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    placeholder="e.g., 2.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <Textarea
                    placeholder="What did you work on?"
                    value={timeNotes}
                    onChange={(e) => setTimeNotes(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddTime} disabled={addTimeLog.isPending} className="w-full">
                  {addTimeLog.isPending ? 'Logging...' : 'Log Time'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {weeklyTimeLogs.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground">Recent logs</p>
              {weeklyTimeLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm bg-muted/50 rounded px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{log.hours}h</span>
                    {log.notes && (
                      <span className="text-muted-foreground text-xs truncate max-w-[120px]">
                        - {log.notes}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => deleteTimeLog.mutate(log.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Lunch Meetings Goal */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Utensils className="h-4 w-4 text-primary" />
            Monthly Lunch Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">This Month</span>
              <span className="font-medium">
                {lunchMeetingsCount} / {lunchGoal}
                {lunchProgress >= 100 && (
                  <TrendingUp className="inline h-4 w-4 ml-1 text-green-500" />
                )}
              </span>
            </div>
            <Progress value={lunchProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Goal: {lunchGoal} in-person lunch meetings per month
            </p>
          </div>

          <Dialog open={lunchDialogOpen} onOpenChange={setLunchDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Log Lunch Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Lunch Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={lunchDate}
                    onChange={(e) => setLunchDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact (optional)</label>
                  <Select value={lunchContact} onValueChange={setLunchContact}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific contact</SelectItem>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} - {contact.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <Textarea
                    placeholder="Meeting notes..."
                    value={lunchNotes}
                    onChange={(e) => setLunchNotes(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddLunch} disabled={addLunchMeeting.isPending} className="w-full">
                  {addLunchMeeting.isPending ? 'Logging...' : 'Log Meeting'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {monthlyLunchMeetings.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground">This month</p>
              {monthlyLunchMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between text-sm bg-muted/50 rounded px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{format(new Date(meeting.meetingDate), 'MMM d')}</span>
                    {meeting.contactName && (
                      <span className="text-muted-foreground text-xs">
                        with {meeting.contactName}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => deleteLunchMeeting.mutate(meeting.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
