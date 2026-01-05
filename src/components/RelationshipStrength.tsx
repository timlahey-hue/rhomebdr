import { cn } from '@/lib/utils';

interface RelationshipStrengthProps {
  strength: 1 | 2 | 3 | 4 | 5;
  size?: 'sm' | 'md';
}

export const RelationshipStrength = ({ strength, size = 'sm' }: RelationshipStrengthProps) => {
  const strengthColors = {
    1: 'bg-strength-1',
    2: 'bg-strength-2',
    3: 'bg-strength-3',
    4: 'bg-strength-4',
    5: 'bg-strength-5',
  };

  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const gap = size === 'sm' ? 'gap-0.5' : 'gap-1';

  return (
    <div className={cn('flex items-center', gap)} title={`Relationship Strength: ${strength}/5`}>
      {[1, 2, 3, 4, 5].map((level) => (
        <div
          key={level}
          className={cn(
            dotSize,
            'rounded-full transition-colors',
            level <= strength ? strengthColors[strength] : 'bg-border'
          )}
        />
      ))}
    </div>
  );
};
