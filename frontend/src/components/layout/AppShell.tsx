import { Outlet } from 'react-router-dom';

import { Navbar } from './Navbar';
import { SiteFooter } from './SiteFooter';

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
