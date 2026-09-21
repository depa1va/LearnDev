import type { ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import Brand from './Brand';
import { ThemeToggle } from '../ui/ThemeControls';

export default function AuthLayout(): ReactElement {
  return (
    <main className="relative min-h-screen overflow-hidden bg-mist px-4 py-5 sm:px-6 sm:py-8">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-grape/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <header className="flex items-center justify-between gap-4">
          <Brand />
          <ThemeToggle />
        </header>
        <div className="flex flex-1 items-start justify-center py-10 sm:items-center sm:py-14">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
