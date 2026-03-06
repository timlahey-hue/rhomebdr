import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Contact, Column, ProspectStage, ActiveStage, PROSPECT_COLUMNS, ACTIVE_COLUMNS } from '@/types/bdr';
import { KanbanColumn } from './KanbanColumn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

type SortOption = 'none' | 'first-name' | 'last-name' | 'company' | 'most-recent';

interface KanbanBoardProps {
  boardType: 'prospect' | 'active';
  contacts: Contact[];
  onMoveContact: (contactId: string, newStage: Contact['stage']) => void;
  onCardClick: (contact: Contact) => void;
}

export const KanbanBoard = ({
  boardType,
  contacts,
  onMoveContact,
  onCardClick,
}: KanbanBoardProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const columns = boardType === 'prospect' ? PROSPECT_COLUMNS : ACTIVE_COLUMNS;

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newStage = destination.droppableId as ProspectStage | ActiveStage;
    onMoveContact(draggableId, newStage);
  };

  const sortContacts = (list: Contact[]) => {
    if (sortBy === 'none') return list;
    return [...list].sort((a, b) => {
      if (sortBy === 'most-recent') {
        const aDate = a.lastTouchDate ? new Date(a.lastTouchDate).getTime() : 0;
        const bDate = b.lastTouchDate ? new Date(b.lastTouchDate).getTime() : 0;
        return bDate - aDate;
      }
      if (sortBy === 'first-name') {
        return a.name.split(' ')[0].localeCompare(b.name.split(' ')[0]);
      }
      if (sortBy === 'last-name') {
        const aLast = a.name.split(' ').slice(-1)[0] || '';
        const bLast = b.name.split(' ').slice(-1)[0] || '';
        return aLast.localeCompare(bLast);
      }
      return a.company.localeCompare(b.company);
    });
  };

  const getContactsForColumn = (columnId: string) => {
    return sortContacts(contacts.filter((contact) => contact.stage === columnId));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[180px] h-8 text-sm">
            <SelectValue placeholder="Sort columns by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Default Order</SelectItem>
            <SelectItem value="most-recent">Most Recent</SelectItem>
            <SelectItem value="first-name">First Name</SelectItem>
            <SelectItem value="last-name">Last Name</SelectItem>
            <SelectItem value="company">Company Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              contacts={getContactsForColumn(column.id)}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
