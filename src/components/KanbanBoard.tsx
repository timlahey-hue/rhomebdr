import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Contact, Column, ProspectStage, ActiveStage, PROSPECT_COLUMNS, ACTIVE_COLUMNS } from '@/types/bdr';
import { KanbanColumn } from './KanbanColumn';

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
  const columns = boardType === 'prospect' ? PROSPECT_COLUMNS : ACTIVE_COLUMNS;

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const newStage = destination.droppableId as ProspectStage | ActiveStage;
    onMoveContact(draggableId, newStage);
  };

  const getContactsForColumn = (columnId: string) => {
    return contacts.filter((contact) => contact.stage === columnId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
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
  );
};
