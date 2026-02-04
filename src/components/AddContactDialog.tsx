import { useState } from 'react';
import { Contact, ROLE_OPTIONS, RELATIONSHIP_TYPE_OPTIONS, COMPANY_TYPE_OPTIONS, PROSPECT_COLUMNS, ACTIVE_COLUMNS, TierLevel } from '@/types/bdr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

const TIER_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'No Tier' },
  { value: '1', label: 'Tier 1 - Top Priority' },
  { value: '2', label: 'Tier 2 - Medium Priority' },
  { value: '3', label: 'Tier 3 - Low Priority' },
];

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
      phone: formData.phone,
      email: formData.email,
      title: formData.title,
      companyType: formData.companyType,
      address: formData.address,
      tier: formData.tier,
      secondaryContactName: formData.secondaryContactName,
      secondaryContactTitle: formData.secondaryContactTitle,
      secondaryContactPhone: formData.secondaryContactPhone,
      secondaryContactEmail: formData.secondaryContactEmail,
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Essential Fields - Always visible */}
          <div className="space-y-3 pb-3 border-b">
            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="name">Primary Contact Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contact name"
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Principal"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, City, State 12345"
                className="mt-1"
              />
            </div>
          </div>

          {/* Classification */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-10">
                Classification
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 pb-3 border-b">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as Contact['role'] })}
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
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.relationshipType}
                    onValueChange={(value) => setFormData({ ...formData, relationshipType: value as Contact['relationshipType'] })}
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    <SelectTrigger className="mt-1">
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
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Company Type</Label>
                  <Select
                    value={formData.companyType || 'none'}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      companyType: value === 'none' ? undefined : value as any
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
                </div>
                <div>
                  <Label>Tier</Label>
                  <Select
                    value={formData.tier?.toString() || 'none'}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      tier: value === 'none' ? undefined : parseInt(value) as TierLevel 
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Secondary Contact */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-10">
                Secondary Contact (Optional)
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 pb-3 border-b">
              <div>
                <Label htmlFor="secondary-name">Name</Label>
                <Input
                  id="secondary-name"
                  value={formData.secondaryContactName || ''}
                  onChange={(e) => setFormData({ ...formData, secondaryContactName: e.target.value })}
                  placeholder="e.g., Estimator or Project Manager"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.secondaryContactTitle || ''}
                    onChange={(e) => setFormData({ ...formData, secondaryContactTitle: e.target.value })}
                    placeholder="Title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.secondaryContactPhone || ''}
                    onChange={(e) => setFormData({ ...formData, secondaryContactPhone: e.target.value })}
                    placeholder="Phone"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.secondaryContactEmail || ''}
                  onChange={(e) => setFormData({ ...formData, secondaryContactEmail: e.target.value })}
                  placeholder="email@company.com"
                  className="mt-1"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.statusNotes || ''}
              onChange={(e) => setFormData({ ...formData, statusNotes: e.target.value })}
              placeholder="How did you meet? What's the context?"
              className="mt-1 min-h-[60px]"
            />
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
