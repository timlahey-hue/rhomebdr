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
import { Calendar, Clock, Building2, X, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ContactDetailSheetProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Contact>) => void;
  onDelete: (id: string) => void;
  onMoveToActive?: (contact: Contact) => void;
}

export const ContactDetailSheet = ({
  contact,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onMoveToActive,
}: ContactDetailSheetProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Contact>>({});
  const [newTag, setNewTag] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  if (!contact) return null;

  const actions = getSuggestedActions(contact);
  const displayData = isEditing ? { ...contact, ...editData } : contact;

  const handleSave = () => {
    onUpdate(contact.id, editData);
    setIsEditing(false);
    setEditData({});
    toast({ title: 'Contact updated', description: 'Changes saved successfully.' });
  };

  const handleQuickTouch = () => {
    const today = new Date().toISOString().split('T')[0];
    onUpdate(contact.id, { lastTouchDate: today });
    toast({ title: 'Touch logged', description: 'Last touch date updated to today.' });
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
              </div>
              <RelationshipStrength strength={contact.relationshipStrength} size="md" />
            </div>
          </SheetHeader>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-2 mb-4">
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
