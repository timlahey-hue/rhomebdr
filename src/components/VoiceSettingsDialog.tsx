import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Sparkles, Save } from 'lucide-react';

interface VoiceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VoiceSettingsDialog = ({ open, onOpenChange }: VoiceSettingsDialogProps) => {
  const queryClient = useQueryClient();
  const [toneDescription, setToneDescription] = useState('');

  const { data: voiceProfile, isLoading } = useQuery({
    queryKey: ['voiceProfile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voice_profile')
        .select('*')
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (voiceProfile) {
      setToneDescription(voiceProfile.tone_description || '');
    }
  }, [voiceProfile]);

  const updateMutation = useMutation({
    mutationFn: async (newTone: string) => {
      if (!voiceProfile) return;
      
      const { error } = await supabase
        .from('voice_profile')
        .update({ tone_description: newTone })
        .eq('id', voiceProfile.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceProfile'] });
      toast({ title: 'Voice profile updated', description: 'Your email tone has been saved.' });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: 'Failed to save', variant: 'destructive' });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(toneDescription);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Your Email Voice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Describe how you write emails. The AI will use this to match your personal communication style when drafting follow-ups.
          </p>

          <div>
            <Label className="text-sm">Tone & Style Description</Label>
            <Textarea
              value={toneDescription}
              onChange={(e) => setToneDescription(e.target.value)}
              placeholder="e.g., Professional but warm. I avoid formal language and prefer conversational tone. I personalize based on the person's work. Short paragraphs, 3-5 sentences max."
              className="mt-1.5 min-h-[150px]"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground font-medium mb-2">Tips for a good voice profile:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Describe your typical email length preference</li>
              <li>• Mention if you use first names or formal titles</li>
              <li>• Note any phrases or openers you commonly use</li>
              <li>• Specify if you're more casual or formal</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Voice Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
