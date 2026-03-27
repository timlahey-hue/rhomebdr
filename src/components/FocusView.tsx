import { useState } from 'react';
import { Contact } from '@/types/bdr';
import { useReminders } from '@/hooks/useReminders';
import { useRecentNotes, DateRange } from '@/hooks/useRecentNotes';
import { isOverdue, isDueSoon, needsAttention, getSuggestedActions } from '@/lib/actions';
import { ContactCard } from './ContactCard';
import { ActionCard } from './ActionCard';
import { WatchList } from './WatchList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, AlertCircle, MessageSquare, Trash2, Clock } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';

interface FocusViewProps {
  contacts: Contact[];
  onCardClick: (contact: Contact) => void;
}

export const FocusView = ({ contacts, onCardClick }: FocusViewProps) => {
  const { reminders, overdueReminders, upcomingReminders, deleteReminder } = useReminders();
  const [notesRange, setNotesRange] = useState<DateRange>('2weeks');
  const { recentNotes } = useRecentNotes(notesRange);

  const overdueContacts = contacts.filter(isOverdue);
  const needsAttentionContacts = contacts.filter(needsAttention);

  const topActions = needsAttentionContacts
    .slice(0, 3)
    .map((contact) => ({
      contact,
      action: getSuggestedActions(contact)[0],
    }))
    .filter((item) => item.action);

  return (
    <div className="space-y-6">
      {/* Reminders Section */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bell className="h-4 w-4 text-accent" />
            Reminders
            {(overdueReminders.length + upcomingReminders.length) > 0 && (
              <Badge variant="secondary" className="text-xs font-normal">
                {overdueReminders.length + upcomingReminders.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[350px]">
            {overdueReminders.length === 0 && upcomingReminders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No reminders set. Use the Reminder button on a contact card to add one.
              </p>
            ) : (
              <div className="space-y-2 pr-3">
                {overdueReminders.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 cursor-pointer"
                    onClick={() => {
                      const contact = contacts.find(c => c.id === r.contactId);
                      if (contact) onCardClick(contact);
                    }}
                  >
                    <div className="p-1.5 rounded bg-destructive/10 mt-0.5">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{r.contactName}</span>
                        <span className="text-xs text-muted-foreground">• {r.contactCompany}</span>
                      </div>
                      {r.notes && <p className="text-xs text-muted-foreground mt-0.5">{r.notes}</p>}
                      <p className="text-xs text-destructive mt-1 font-medium">
                        Overdue — {format(parseISO(r.reminderDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => { e.stopPropagation(); deleteReminder(r.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {upcomingReminders.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30 cursor-pointer"
                    onClick={() => {
                      const contact = contacts.find(c => c.id === r.contactId);
                      if (contact) onCardClick(contact);
                    }}
                  >
                    <div className="p-1.5 rounded bg-accent/10 mt-0.5">
                      <Bell className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{r.contactName}</span>
                        <span className="text-xs text-muted-foreground">• {r.contactCompany}</span>
                      </div>
                      {r.notes && <p className="text-xs text-muted-foreground mt-0.5">{r.notes}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {isToday(parseISO(r.reminderDate)) ? 'Today' : format(parseISO(r.reminderDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => { e.stopPropagation(); deleteReminder(r.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Watch List */}
      <WatchList contacts={contacts} onCardClick={onCardClick} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Priority Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              Top Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topActions.length > 0 ? (
              topActions.map(({ contact, action }) => (
                <div key={contact.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{contact.name}</span>
                    <span className="text-xs text-muted-foreground">• {contact.company}</span>
                  </div>
                  <ActionCard action={action} contact={contact} onClick={() => onCardClick(contact)} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No urgent actions right now. Keep nurturing those relationships!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Overdue Follow-ups */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              Overdue Follow-ups
              {overdueContacts.length > 0 && (
                <Badge variant="destructive" className="text-xs font-normal">
                  {overdueContacts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueContacts.length > 0 ? (
              overdueContacts.slice(0, 4).map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onClick={() => onCardClick(contact)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                All caught up! No overdue follow-ups.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Notes Activity Feed */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              Recent Notes Activity
              <Badge variant="secondary" className="text-xs font-normal">
                {recentNotes.length} notes
              </Badge>
            </CardTitle>
            <Select value={notesRange} onValueChange={(v) => setNotesRange(v as DateRange)}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1week">Past Week</SelectItem>
                <SelectItem value="2weeks">Past 2 Weeks</SelectItem>
                <SelectItem value="30days">Past 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {recentNotes.length > 0 ? (
              <div className="space-y-2">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30 cursor-pointer"
                    onClick={() => {
                      const contact = contacts.find(c => c.id === note.contactId);
                      if (contact) onCardClick(contact);
                    }}
                  >
                    <div className="p-1.5 rounded bg-accent/10 text-accent mt-0.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{note.contactName}</span>
                        <span className="text-xs text-muted-foreground">• {note.contactCompany}</span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1 line-clamp-2">{note.note}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {format(parseISO(note.createdAt), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No notes yet. Add notes on contact cards to see activity here.
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
