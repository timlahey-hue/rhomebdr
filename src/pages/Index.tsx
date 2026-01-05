import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { Contact } from '@/types/bdr';
import { KanbanBoard } from '@/components/KanbanBoard';
import { FocusView } from '@/components/FocusView';
import { ContactDetailSheet } from '@/components/ContactDetailSheet';
import { AddContactDialog } from '@/components/AddContactDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, Users, LayoutGrid, Home } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type ViewType = 'focus' | 'pipeline' | 'active';

const Index = () => {
  const {
    contacts,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    moveContact,
    getProspectContacts,
    getActiveContacts,
  } = useContacts();

  const [currentView, setCurrentView] = useState<ViewType>('focus');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleCardClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleMoveContact = (contactId: string, newStage: Contact['stage']) => {
    moveContact(contactId, newStage);
  };

  const handleMoveToActive = (contact: Contact) => {
    moveContact(contact.id, 'new-relationship', 'active');
  };

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    addContact(contactData);
    toast({ title: 'Contact added', description: `${contactData.name} has been added.` });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">r:home</h1>
                <p className="text-[11px] text-muted-foreground -mt-0.5">Relationship Builder</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as ViewType)}>
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="focus" className="gap-1.5">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">This Week</span>
                </TabsTrigger>
                <TabsTrigger value="pipeline" className="gap-1.5">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Pipeline</span>
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-1.5">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Active</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Add Button */}
            <Button
              onClick={() => setIsAddOpen(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Contact</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'focus' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground">This Week's Focus</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Your priority relationships and actions to keep momentum
              </p>
            </div>
            <FocusView contacts={contacts} onCardClick={handleCardClick} />
          </div>
        )}

        {currentView === 'pipeline' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Pipeline Relationships</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Track prospects from research to referral partner
              </p>
            </div>
            <KanbanBoard
              boardType="prospect"
              contacts={getProspectContacts()}
              onMoveContact={handleMoveContact}
              onCardClick={handleCardClick}
            />
          </div>
        )}

        {currentView === 'active' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Active Relationships</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Nurture your existing partners and advocates
              </p>
            </div>
            <KanbanBoard
              boardType="active"
              contacts={getActiveContacts()}
              onMoveContact={handleMoveContact}
              onCardClick={handleCardClick}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <ContactDetailSheet
        contact={selectedContact}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={updateContact}
        onDelete={deleteContact}
        onMoveToActive={handleMoveToActive}
      />

      <AddContactDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAddContact}
        defaultBoard={currentView === 'active' ? 'active' : 'prospect'}
      />
    </div>
  );
};

export default Index;
