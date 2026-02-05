import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({ title, subtitle, align = 'left' }: SectionHeaderProps) {
  return (
    <div className={cn('space-y-2', align === 'center' && 'text-center')}>
      <h2 className="text-xl font-semibold font-display sm:text-2xl">{title}</h2>
      {subtitle ? <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p> : null}
    </div>
  );
}
