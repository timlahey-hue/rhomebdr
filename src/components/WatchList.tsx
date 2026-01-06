import { Contact } from '@/types/bdr';
import { ContactCard } from './ContactCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface WatchListProps {
  contacts: Contact[];
  onCardClick: (contact: Contact) => void;
}

export const WatchList = ({ contacts, onCardClick }: WatchListProps) => {
  const watchedContacts = contacts.filter((c) => c.watched);

  return (
    <Card className="border-border/50 border-l-4 border-l-accent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Eye className="h-4 w-4 text-accent" />
          Watch List
          {watchedContacts.length > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              {watchedContacts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {watchedContacts.length > 0 ? (
          watchedContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => onCardClick(contact)}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No contacts on your watch list. Add contacts to keep an eye on their activity.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
