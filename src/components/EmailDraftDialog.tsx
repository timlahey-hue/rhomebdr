import { useState } from 'react';
import { Contact } from '@/types/bdr';
import { SuggestedAction } from '@/lib/actions';
import { useEmailDraft } from '@/hooks/useEmailDraft';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Mail, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EmailDraftDialogProps {
  contact: Contact;
  action: SuggestedAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmailDraftDialog = ({ contact, action, open, onOpenChange }: EmailDraftDialogProps) => {
  const { draft, isGenerating, error, generateDraft, clearDraft } = useEmailDraft();
  const [copied, setCopied] = useState<'subject' | 'body' | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');

  const handleGenerate = async () => {
    try {
      const result = await generateDraft({
        contactName: contact.name,
        contactCompany: contact.company,
        contactRole: contact.role,
        relationshipStage: contact.stage,
        actionType: action.title,
        lastNotes: contact.statusNotes,
      });
      setEditedSubject(result.subject);
      setEditedBody(result.body);
    } catch {
      toast({
        title: 'Failed to generate draft',
        description: error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async (type: 'subject' | 'body') => {
    const text = type === 'subject' ? editedSubject : editedBody;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async () => {
    const fullEmail = `Subject: ${editedSubject}\n\n${editedBody}`;
    await navigator.clipboard.writeText(fullEmail);
    toast({ title: 'Full email copied to clipboard' });
  };

  const handleClose = () => {
    clearDraft();
    setEditedSubject('');
    setEditedBody('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-accent" />
            Draft Email for {contact.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Context info */}
          <Card className="bg-muted/30 border-border/50">
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-muted-foreground mb-1">Action type</p>
              <p className="text-sm font-medium">{action.icon} {action.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
            </CardContent>
          </Card>

          {!draft && !isGenerating && (
            <div className="text-center py-6">
              <Sparkles className="h-10 w-10 text-accent/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Generate a personalized email draft in your voice
              </p>
              <Button onClick={handleGenerate} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Draft
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Crafting your email...</p>
            </div>
          )}

          {draft && !isGenerating && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('subject')}
                    className="h-6 px-2 text-xs"
                  >
                    {copied === 'subject' ? (
                      <Check className="h-3 w-3 text-accent" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <Input
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-muted-foreground">Body</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('body')}
                    className="h-6 px-2 text-xs"
                  >
                    {copied === 'body' ? (
                      <Check className="h-3 w-3 text-accent" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <Textarea
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="min-h-[150px] text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Regenerate
                </Button>
                <Button
                  onClick={handleCopyAll}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copy All
                </Button>
              </div>
            </div>
          )}

          {error && !isGenerating && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
