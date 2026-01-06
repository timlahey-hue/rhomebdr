import { useState } from 'react';
import { Contact, ROLE_OPTIONS, RELATIONSHIP_TYPE_OPTIONS } from '@/types/bdr';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RelationshipStrength } from './RelationshipStrength';
import { ActionCard } from './ActionCard';
import { ScheduleFollowupDialog } from './ScheduleFollowupDialog';
import { getSuggestedActions } from '@/lib/actions';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Building2, X, Trash2, ArrowRight, Globe, Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useContactResearch } from '@/hooks/useContactResearch';
import { useContactActivity } from '@/hooks/useContactActivity';

interface ContactDetailSheetProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Contact>) => void;
  onDelete: (id: string) => void;
  onMoveToActive?: (contact: Contact) => void;
  onRefresh?: () => void;
}

export const ContactDetailSheet = ({
  contact,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onMoveToActive,
  onRefresh,
}: ContactDetailSheetProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Contact>>({});
  const [newTag, setNewTag] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const { researchContact, isResearching } = useContactResearch();
  const { logActivity } = useContactActivity();

  if (!contact) return null;

  const actions = getSuggestedActions(contact);
  const displayData = isEditing ? { ...contact, ...editData } : contact;
  const isCurrentlyResearching = isResearching === contact.id;

  const handleResearch = async () => {
    await researchContact(contact);
    onRefresh?.();
  };

  const handleSave = () => {
    // Check if relationship type changed from Target to Active Partner
    if (
      editData.relationshipType === 'Active Partner' && 
      contact.relationshipType === 'Target' && 
      contact.board === 'prospect'
    ) {
      // Move to active board
      onUpdate(contact.id, { 
        ...editData, 
        board: 'active', 
        stage: 'new-relationship' 
      });
      toast({ 
        title: 'Moved to Active Relationships', 
        description: `${contact.name} has been promoted to Active Partner.` 
      });
    } else if (
      editData.relationshipType === 'Target' && 
      contact.relationshipType !== 'Target' && 
      contact.board === 'active'
    ) {
      // Move back to prospect board
      onUpdate(contact.id, { 
        ...editData, 
        board: 'prospect', 
        stage: 'warm-relationship' 
      });
      toast({ 
        title: 'Moved to Pipeline', 
        description: `${contact.name} has been moved back to Pipeline.` 
      });
    } else {
      onUpdate(contact.id, editData);
      toast({ title: 'Contact updated', description: 'Changes saved successfully.' });
    }
    setIsEditing(false);
    setEditData({});
  };

  const handleQuickTouch = async () => {
    const today = new Date().toISOString().split('T')[0];
    onUpdate(contact.id, { lastTouchDate: today });
    await logActivity({
      contactId: contact.id,
      activityType: 'touch',
      toValue: today,
    });
    toast({ title: 'Touch logged', description: 'Last touch date updated to today.' });
  };

  const handleToggleWatch = async () => {
    const newWatchedState = !contact.watched;
    onUpdate(contact.id, { watched: newWatchedState });
    await logActivity({
      contactId: contact.id,
      activityType: 'watched',
      fromValue: contact.watched ? 'watched' : 'unwatched',
      toValue: newWatchedState ? 'watched' : 'unwatched',
    });
    toast({ 
      title: newWatchedState ? 'Added to Watch List' : 'Removed from Watch List',
      description: newWatchedState 
        ? `${contact.name} is now on your watch list.`
        : `${contact.name} has been removed from your watch list.`
    });
  };

  const handleScheduled = (date: string) => {
    onUpdate(contact.id, { nextTouchDate: date });
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const updatedTags = [...(displayData.tags || []), newTag.trim()];
    if (isEditing) {
      setEditData({ ...editData, tags: updatedTags });
    } else {
      onUpdate(contact.id, { tags: updatedTags });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = (displayData.tags || []).filter((t) => t !== tagToRemove);
    if (isEditing) {
      setEditData({ ...editData, tags: updatedTags });
    } else {
      onUpdate(contact.id, { tags: updatedTags });
    }
  };

  const handleMoveToActive = () => {
    if (onMoveToActive && contact.board === 'prospect' && contact.stage === 'ready-for-referral') {
      onMoveToActive(contact);
      onOpenChange(false);
      toast({ 
        title: 'Moved to Active Relationships', 
        description: `${contact.name} is now an active partner.` 
      });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-xl">{contact.name}</SheetTitle>
                <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">{contact.company}</span>
                </div>
                {contact.website && (
                  <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:text-accent hover:underline"
                    >
                      {contact.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}
              </div>
              <RelationshipStrength strength={contact.relationshipStrength} size="md" />
            </div>
          </SheetHeader>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              size="sm" 
              variant={contact.watched ? "default" : "outline"}
              onClick={handleToggleWatch}
              className={cn(
                contact.watched && "bg-accent text-accent-foreground hover:bg-accent/90"
              )}
            >
              {contact.watched ? (
                <>
                  <Eye className="h-4 w-4 mr-1.5" />
                  Watching
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1.5" />
                  Watch
                </>
              )}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleQuickTouch}>
              <Clock className="h-4 w-4 mr-1.5" />
              Log Touch
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowScheduleDialog(true)}>
              <Calendar className="h-4 w-4 mr-1.5" />
              Schedule
            </Button>
            {contact.board === 'prospect' && contact.stage === 'ready-for-referral' && (
              <Button size="sm" variant="default" onClick={handleMoveToActive} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <ArrowRight className="h-4 w-4 mr-1.5" />
                Move to Active
              </Button>
            )}
            <Button 
              size="sm" 
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                  setEditData({});
                }
              }}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>

          <Separator className="mb-4" />

          {/* AI Research Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                AI Research
              </h3>
              {contact.website && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResearch}
                  disabled={isCurrentlyResearching}
                >
                  {isCurrentlyResearching ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      Researching...
                    </>
                  ) : contact.aiSummary ? (
                    'Re-research'
                  ) : (
                    'Research Contact'
                  )}
                </Button>
              )}
            </div>
            
            {contact.aiSummary ? (
              <div className="space-y-3">
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                  <Label className="text-xs text-muted-foreground mb-1 block">Executive Summary</Label>
                  <p className="text-sm text-foreground">{contact.aiSummary}</p>
                </div>
                {contact.aiAvPartners && (
                  <div className="bg-muted/50 border border-border rounded-lg p-3">
                    <Label className="text-xs text-muted-foreground mb-1 block">Potential AV Partners</Label>
                    <p className="text-sm text-foreground">{contact.aiAvPartners}</p>
                  </div>
                )}
              </div>
            ) : contact.website ? (
              <p className="text-sm text-muted-foreground">
                Click "Research Contact" to get an AI-generated summary and discover potential AV integration partners.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add a website to this contact to enable AI research.
              </p>
            )}
          </div>

          <Separator className="mb-4" />

          {/* Suggested Actions */}
          <div className="mb-6">
            <h3 className="font-medium text-sm mb-3 text-foreground">Suggested Actions</h3>
            <div className="space-y-2">
              {actions.slice(0, 3).map((action, index) => (
                <ActionCard key={index} action={action} contact={contact} />
              ))}
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Contact Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Role</Label>
                {isEditing ? (
                  <Select
                    value={displayData.role}
                    onValueChange={(value) => setEditData({ ...editData, role: value as Contact['role'] })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium mt-1">{displayData.role}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                {isEditing ? (
                  <Select
                    value={displayData.relationshipType}
                    onValueChange={(value) => setEditData({ ...editData, relationshipType: value as Contact['relationshipType'] })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium mt-1">{displayData.relationshipType}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Last Touch</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={displayData.lastTouchDate || ''}
                    onChange={(e) => setEditData({ ...editData, lastTouchDate: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">
                    {displayData.lastTouchDate 
                      ? new Date(displayData.lastTouchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Not set'}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Next Touch</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={displayData.nextTouchDate || ''}
                    onChange={(e) => setEditData({ ...editData, nextTouchDate: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">
                    {displayData.nextTouchDate 
                      ? new Date(displayData.nextTouchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Not set'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Relationship Strength</Label>
              {isEditing ? (
                <div className="flex gap-2 mt-2">
                  {([1, 2, 3, 4, 5] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setEditData({ ...editData, relationshipStrength: level })}
                      className={cn(
                        'w-8 h-8 rounded-full text-sm font-medium transition-colors',
                        displayData.relationshipStrength === level
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-1">
                  <RelationshipStrength strength={displayData.relationshipStrength} size="md" />
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Notes</Label>
              {isEditing ? (
                <Textarea
                  value={displayData.statusNotes || ''}
                  onChange={(e) => setEditData({ ...editData, statusNotes: e.target.value })}
                  className="mt-1 min-h-[80px]"
                  placeholder="Add notes about this relationship..."
                />
              ) : (
                <p className="text-sm mt-1 text-foreground/80">
                  {displayData.statusNotes || 'No notes yet.'}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(displayData.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs pl-2 pr-1 py-0.5">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="text-sm"
                />
                <Button size="sm" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Danger Zone */}
          <div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                onDelete(contact.id);
                onOpenChange(false);
                toast({ title: 'Contact deleted', variant: 'destructive' });
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Contact
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ScheduleFollowupDialog
        contact={contact}
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onScheduled={handleScheduled}
      />
    </>
  );
};
