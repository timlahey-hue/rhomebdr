import { useState, useEffect } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { Contact } from '@/types/bdr';
import { KanbanBoard } from '@/components/KanbanBoard';
import { FocusView } from '@/components/FocusView';
import { ContactDetailSheet } from '@/components/ContactDetailSheet';
import { AddContactDialog } from '@/components/AddContactDialog';
import { ImportContactsDialog } from '@/components/ImportContactsDialog';
import { VoiceSettingsDialog } from '@/components/VoiceSettingsDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, Users, LayoutGrid, Home, Sparkles, Upload, Trash2, Download } from 'lucide-react';
import { exportContactsToCSV } from '@/lib/exportContacts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { mockContacts } from '@/lib/mockData';

type ViewType = 'focus' | 'pipeline' | 'active';

const Index = () => {
  const {
    contacts,
    isLoading,
    refetch,
    addContact,
    importContacts,
    updateContact,
    deleteContact,
    moveContact,
    getProspectContacts,
    getActiveContacts,
    clearBoard,
  } = useContacts();

  const [currentView, setCurrentView] = useState<ViewType>('focus');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);

  // Keep selectedContact in sync with contacts array
  useEffect(() => {
    if (selectedContact) {
      const updatedContact = contacts.find((c) => c.id === selectedContact.id);
      if (updatedContact && JSON.stringify(updatedContact) !== JSON.stringify(selectedContact)) {
        setSelectedContact(updatedContact);
      }
    }
  }, [contacts, selectedContact]);
  useEffect(() => {
    const seedData = async () => {
      if (hasSeeded || isLoading || contacts.length > 0) return;
      
      try {
        // Check if we already have contacts
        const { count } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true });
        
        if (count === 0) {
          // Insert mock data
          const dbContacts = mockContacts.map((c) => ({
            name: c.name,
            company: c.company,
            role: c.role,
            relationship_type: c.relationshipType,
            last_touch_date: c.lastTouchDate,
            next_touch_date: c.nextTouchDate,
            status_notes: c.statusNotes,
            relationship_strength: c.relationshipStrength,
            tags: c.tags,
            board: c.board,
            stage: c.stage,
          }));

          await supabase.from('contacts').insert(dbContacts);
          setHasSeeded(true);
          window.location.reload();
        }
      } catch (error) {
        console.error('Error seeding data:', error);
      }
    };

    seedData();
  }, [contacts, isLoading, hasSeeded]);

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

  const handleAddContact = async (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    await addContact(contactData);
    toast({ title: 'Contact added', description: `${contactData.name} has been added.` });
  };

  const handleImportContacts = async (contactsData: Omit<Contact, 'id' | 'createdAt'>[]) => {
    await importContacts(contactsData);
    toast({ title: 'Contacts imported', description: `${contactsData.length} contacts have been imported.` });
  };

  const handleClearBoard = async (board: 'prospect' | 'active') => {
    await clearBoard(board);
    toast({ 
      title: 'Board cleared', 
      description: `All ${board === 'prospect' ? 'Pipeline' : 'Active'} contacts have been removed.` 
    });
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

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVoiceOpen(true)}
                className="text-muted-foreground hover:text-foreground"
                title="Email Voice Settings"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsImportOpen(true)}
                className="gap-1.5"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button
                onClick={() => setIsAddOpen(true)}
                className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Contact</span>
              </Button>
            </div>
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Pipeline Relationships</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Track prospects from research to referral partner
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportContactsToCSV(getProspectContacts(), 'pipeline')}
                  className="gap-1.5"
                  disabled={getProspectContacts().length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive gap-1.5">
                      <Trash2 className="h-4 w-4" />
                      Clear Board
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Pipeline Board?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {getProspectContacts().length} contacts from the Pipeline board. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleClearBoard('prospect')}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, clear all
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Active Relationships</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Nurture your existing partners and advocates
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportContactsToCSV(getActiveContacts(), 'active')}
                  className="gap-1.5"
                  disabled={getActiveContacts().length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive gap-1.5">
                      <Trash2 className="h-4 w-4" />
                      Clear Board
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Active Board?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {getActiveContacts().length} contacts from the Active board. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleClearBoard('active')}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, clear all
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
        onRefresh={refetch}
      />

      <AddContactDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAddContact}
        defaultBoard={currentView === 'active' ? 'active' : 'prospect'}
      />

      <VoiceSettingsDialog
        open={isVoiceOpen}
        onOpenChange={setIsVoiceOpen}
      />

      <ImportContactsDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={handleImportContacts}
      />
    </div>
  );
};

export default Index;
