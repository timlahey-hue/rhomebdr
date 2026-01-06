import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Contact, Column } from '@/types/bdr';
import { ContactCard } from './ContactCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps<T extends string> {
  column: Column<T>;
  contacts: Contact[];
  onCardClick: (contact: Contact) => void;
  onRefresh?: () => void;
}

export function KanbanColumn<T extends string>({
  column,
  contacts,
  onCardClick,
  onRefresh,
}: KanbanColumnProps<T>) {
  return (
    <div className="flex-shrink-0 w-72">
      <div className={cn('rounded-xl p-3', column.color)}>
        {/* Column header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-medium text-sm text-foreground">{column.title}</h3>
          <span className="text-xs text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full">
            {contacts.length}
          </span>
        </div>

        {/* Droppable area */}
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'min-h-[200px] space-y-2 rounded-lg transition-colors p-1',
                snapshot.isDraggingOver && 'bg-accent/10'
              )}
            >
              {contacts.map((contact, index) => (
                <Draggable key={contact.id} draggableId={contact.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <ContactCard
                        contact={contact}
                        onClick={() => onCardClick(contact)}
                        isDragging={snapshot.isDragging}
                        onResearchComplete={onRefresh}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
