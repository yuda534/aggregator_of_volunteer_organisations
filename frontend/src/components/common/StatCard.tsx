import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="border-none bg-muted/60">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold mt-2">{value}</p>
      </CardContent>
    </Card>
  );
}
