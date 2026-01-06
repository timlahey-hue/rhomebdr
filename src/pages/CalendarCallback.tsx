import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const CalendarCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback } = useGoogleCalendar();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast({
        title: 'Calendar connection failed',
        description: error,
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    if (code) {
      handleCallback(code)
        .then(() => {
          toast({
            title: 'Google Calendar connected',
            description: 'You can now schedule follow-ups directly to your calendar.',
          });
          navigate('/');
        })
        .catch((err) => {
          toast({
            title: 'Failed to connect calendar',
            description: err.message,
            variant: 'destructive',
          });
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Connecting Google Calendar...</p>
      </div>
    </div>
  );
};

export default CalendarCallback;
