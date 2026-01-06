import { Contact } from '@/types/bdr';
import { isOverdue, isDueSoon, needsAttention, getSuggestedActions } from '@/lib/actions';
import { ContactCard } from './ContactCard';
import { ActionCard } from './ActionCard';
import { WatchList } from './WatchList';
import { ActivityTimeline } from './ActivityTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Star, TrendingUp } from 'lucide-react';

interface FocusViewProps {
  contacts: Contact[];
  onCardClick: (contact: Contact) => void;
}

export const FocusView = ({ contacts, onCardClick }: FocusViewProps) => {
  // Calculate weekly stats
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const touchesThisWeek = contacts.filter(
    (c) => c.lastTouchDate && new Date(c.lastTouchDate) >= weekAgo
  ).length;

  const overdueContacts = contacts.filter(isOverdue);
  const dueSoonContacts = contacts.filter((c) => isDueSoon(c) && !isOverdue(c));
  const needsAttentionContacts = contacts.filter(needsAttention);
  
  const highPotentialContacts = contacts
    .filter((c) => c.relationshipStrength >= 3 && c.board === 'prospect')
    .slice(0, 5);

  // Get top priority actions across all contacts
  const topActions = needsAttentionContacts
    .slice(0, 3)
    .map((contact) => ({
      contact,
      action: getSuggestedActions(contact)[0],
    }))
    .filter((item) => item.action);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{touchesThisWeek}</p>
                <p className="text-xs text-muted-foreground">Touches this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{overdueContacts.length}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-highlight/10">
                <Clock className="h-5 w-5 text-highlight" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{dueSoonContacts.length}</p>
                <p className="text-xs text-muted-foreground">Due this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Star className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{highPotentialContacts.length}</p>
                <p className="text-xs text-muted-foreground">High potential</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Watch List - Front and Center */}
      <WatchList contacts={contacts} onCardClick={onCardClick} />

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Priority Actions */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              Top Priority Actions
              <Badge variant="secondary" className="text-xs font-normal">This Week</Badge>
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

        {/* Due This Week */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              Due This Week
              {dueSoonContacts.length > 0 && (
                <Badge className="text-xs font-normal bg-highlight/20 text-highlight border-0">
                  {dueSoonContacts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dueSoonContacts.length > 0 ? (
              dueSoonContacts.slice(0, 4).map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onClick={() => onCardClick(contact)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nothing urgent this week. Time to prospect!
              </p>
            )}
          </CardContent>
        </Card>

        {/* High Potential Prospects */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              High Potential Prospects
              <Badge variant="secondary" className="text-xs font-normal">Strength 3+</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {highPotentialContacts.length > 0 ? (
              highPotentialContacts.slice(0, 4).map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onClick={() => onCardClick(contact)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Keep building those relationships to see high-potential prospects here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline / Reporting */}
      <ActivityTimeline maxItems={30} />
    </div>
  );
};
