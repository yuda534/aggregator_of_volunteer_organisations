import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bell, LogOut, MapPin, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { getNotifications } from '@/api/notifications';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { to: '/events', label: 'Мероприятия' },
  { to: '/organizations', label: 'Организации' },
  { to: '/volunteers', label: 'Волонтёры' },
  { to: '/initiatives', label: 'Инициативы' },
  { to: '/map', label: 'Карта' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    getNotifications('unread')
      .then((items) => setUnreadCount(items.length))
      .catch(() => setUnreadCount(0));
  }, [user, location.pathname]);

  const avatarSrc = useMemo(() => {
    if (!user) return undefined;
    if (user.user_type === 'organization') {
      return user.profile && 'logo' in user.profile ? user.profile.logo || undefined : undefined;
    }
    return user.avatar || undefined;
  }, [user]);

  const avatarFallback = useMemo(() => {
    if (!user) return '';
    if (user.user_type === 'organization') {
      const name = user.profile && 'name' in user.profile ? user.profile.name || '' : '';
      return (name || user.username).slice(0, 2).toUpperCase();
    }
    const name = user.first_name || user.username;
    return name.slice(0, 2).toUpperCase();
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold font-display">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <MapPin className="h-4 w-4" />
          </span>
          Go2Help
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/notifications" aria-label="Уведомления">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={avatarSrc} alt={user.username} />
                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Уведомления
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Войти</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Регистрация</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
