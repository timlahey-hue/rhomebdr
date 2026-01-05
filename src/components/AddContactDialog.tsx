import { useState } from 'react';
import { Contact, ROLE_OPTIONS, RELATIONSHIP_TYPE_OPTIONS, PROSPECT_COLUMNS, ACTIVE_COLUMNS } from '@/types/bdr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  defaultBoard?: 'prospect' | 'active';
}

export const AddContactDialog = ({
  open,
  onOpenChange,
  onAdd,
  defaultBoard = 'prospect',
}: AddContactDialogProps) => {
  const [formData, setFormData] = useState<Partial<Omit<Contact, 'id' | 'createdAt'>>>({
    board: defaultBoard,
    stage: defaultBoard === 'prospect' ? 'researching' : 'new-relationship',
    role: 'Architect',
    relationshipType: 'Target',
    relationshipStrength: 1,
    tags: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) return;

    onAdd({
      name: formData.name,
      company: formData.company,
      role: formData.role!,
      relationshipType: formData.relationshipType!,
      lastTouchDate: formData.lastTouchDate || null,
      nextTouchDate: formData.nextTouchDate || null,
      statusNotes: formData.statusNotes || '',
      relationshipStrength: formData.relationshipStrength!,
      tags: formData.tags || [],
      board: formData.board!,
      stage: formData.stage!,
    });

    // Reset form
    setFormData({
      board: defaultBoard,
      stage: defaultBoard === 'prospect' ? 'researching' : 'new-relationship',
      role: 'Architect',
      relationshipType: 'Target',
      relationshipStrength: 1,
      tags: [],
    });
    onOpenChange(false);
  };

  const columns = formData.board === 'prospect' ? PROSPECT_COLUMNS : ACTIVE_COLUMNS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Sarah Mitchell"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Mitchell Architecture"
                required
              />
            </div>

            <div>
              <Label>Board</Label>
              <Select
                value={formData.board}
                onValueChange={(value: 'prospect' | 'active') => {
                  setFormData({
                    ...formData,
                    board: value,
                    stage: value === 'prospect' ? 'researching' : 'new-relationship',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Pipeline</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value as Contact['stage'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as Contact['role'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
              <Select
                value={formData.relationshipType}
                onValueChange={(value) => setFormData({ ...formData, relationshipType: value as Contact['relationshipType'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.statusNotes || ''}
                onChange={(e) => setFormData({ ...formData, statusNotes: e.target.value })}
                placeholder="How did you meet? What's the context?"
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Add Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
