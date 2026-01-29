import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="container py-20 text-center space-y-6">
      <h1 className="text-3xl font-semibold font-display">Страница не найдена</h1>
      <p className="text-muted-foreground">Похоже, ссылка неверная. Перейдите на главную.</p>
      <Button asChild>
        <Link to="/">На главную</Link>
      </Button>
    </div>
  );
}
