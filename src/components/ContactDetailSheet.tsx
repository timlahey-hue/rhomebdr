import { useState } from 'react';
import { Contact, ROLE_OPTIONS, RELATIONSHIP_TYPE_OPTIONS, COMPANY_TYPE_OPTIONS, TierLevel } from '@/types/bdr';
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
import { Calendar, Clock, Building2, X, Trash2, ArrowRight, Globe, Sparkles, Loader2, Eye, EyeOff, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useContactResearch } from '@/hooks/useContactResearch';
import { useContactActivity } from '@/hooks/useContactActivity';
import { useContactLunchMeetings } from '@/hooks/useBDRGoals';
import { format } from 'date-fns';

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
  const { lunchMeetings } = useContactLunchMeetings(contact?.id);

  if (!contact) return null;

  const actions = getSuggestedActions(contact);
  const displayData = isEditing ? { ...contact, ...editData } : contact;
  const isCurrentlyResearching = isResearching === contact.id;
  const hasLunchMeetings = lunchMeetings.length > 0;

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
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={displayData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="text-xl font-semibold mb-1"
                    placeholder="Contact name"
                  />
                ) : (
                  <SheetTitle className="text-xl">{contact.name}</SheetTitle>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  {isEditing ? (
                    <Input
                      value={displayData.company}
                      onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                      className="text-sm h-7"
                      placeholder="Company name"
                    />
                  ) : (
                    <span className="text-sm">{contact.company}</span>
                  )}
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <Input
                      value={displayData.website || ''}
                      onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                      className="text-sm h-7"
                      placeholder="Website URL"
                    />
                  </div>
                ) : contact.website ? (
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
                ) : null}
                {hasLunchMeetings && (
                  <Badge className="mt-2 bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500/30">
                    <Utensils className="h-3 w-3 mr-1" />
                    Lunch Meeting Complete
                  </Badge>
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

          {/* Lunch Meetings Section */}
          {hasLunchMeetings && (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-sm mb-3 text-foreground flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-green-500" />
                  Lunch Meetings
                  <Badge variant="secondary" className="text-xs font-normal">
                    {lunchMeetings.length}
                  </Badge>
                </h3>
                <div className="space-y-2">
                  {lunchMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                    >
                      <div className="p-1.5 rounded bg-green-500/20">
                        <Utensils className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {format(new Date(meeting.meetingDate), 'MMM d, yyyy')}
                          </span>
                          <Badge className="bg-green-500/20 text-green-600 border-0 text-xs">
                            Complete
                          </Badge>
                        </div>
                        {meeting.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {meeting.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator className="mb-4" />
            </>
          )}

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

            {/* Tier Selection - Pipeline only */}
            {contact.board === 'prospect' && (
              <div>
                <Label className="text-xs text-muted-foreground">Priority Tier</Label>
                {isEditing ? (
                  <Select
                    value={displayData.tier?.toString() || 'none'}
                    onValueChange={(value) => setEditData({ 
                      ...editData, 
                      tier: value === 'none' ? undefined : parseInt(value) as TierLevel 
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Tier</SelectItem>
                      <SelectItem value="1">Tier 1 - Top Priority</SelectItem>
                      <SelectItem value="2">Tier 2 - Medium Priority</SelectItem>
                      <SelectItem value="3">Tier 3 - Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium mt-1">
                    {displayData.tier ? `Tier ${displayData.tier}` : 'Not set'}
                  </p>
                )}
              </div>
            )}

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Title</Label>
                {isEditing ? (
                  <Input
                    value={displayData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="e.g., Principal Architect"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{displayData.title || '—'}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Company Type</Label>
                {isEditing ? (
                  <Select
                    value={displayData.companyType || 'none'}
                    onValueChange={(value) => setEditData({ 
                      ...editData, 
                      companyType: value === 'none' ? undefined : value as Contact['companyType'] 
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select type</SelectItem>
                      {COMPANY_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium mt-1">{displayData.companyType || '—'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                {isEditing ? (
                  <Input
                    value={displayData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{displayData.phone || '—'}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                {isEditing ? (
                  <Input
                    value={displayData.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{displayData.email ? <a href={`mailto:${displayData.email}`} className="text-accent hover:underline">{displayData.email}</a> : '—'}</p>
                )}
              </div>
            </div>

            {/* Secondary Contact */}
            {(displayData.secondaryContactName || isEditing) && (
              <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
                <h4 className="text-sm font-medium">Secondary Contact</h4>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  {isEditing ? (
                    <Input
                      value={displayData.secondaryContactName || ''}
                      onChange={(e) => setEditData({ ...editData, secondaryContactName: e.target.value })}
                      placeholder="e.g., Estimator or Project Manager"
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">{displayData.secondaryContactName || '—'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    {isEditing ? (
                      <Input
                        value={displayData.secondaryContactTitle || ''}
                        onChange={(e) => setEditData({ ...editData, secondaryContactTitle: e.target.value })}
                        placeholder="Title"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{displayData.secondaryContactTitle || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    {isEditing ? (
                      <Input
                        value={displayData.secondaryContactPhone || ''}
                        onChange={(e) => setEditData({ ...editData, secondaryContactPhone: e.target.value })}
                        placeholder="Phone"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm font-medium mt-1">{displayData.secondaryContactPhone || '—'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={displayData.secondaryContactEmail || ''}
                      onChange={(e) => setEditData({ ...editData, secondaryContactEmail: e.target.value })}
                      placeholder="email@company.com"
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">{displayData.secondaryContactEmail ? <a href={`mailto:${displayData.secondaryContactEmail}`} className="text-accent hover:underline">{displayData.secondaryContactEmail}</a> : '—'}</p>
                  )}
                </div>
              </div>
            )}

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
