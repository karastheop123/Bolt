import React from 'react';
import { classNames } from '~/utils/classNames';
import { Header } from '~/components/header/Header';
import { Menu } from '~/components/sidebar/Menu.client';
import { Workbench } from '~/components/workbench/Workbench.client';

interface DashboardShellProps {
  children: React.ReactNode;
  chatStarted?: boolean;
  isStreaming?: boolean;
}

export function DashboardShell({ children, chatStarted = false, isStreaming = false }: DashboardShellProps) {
  return (
    <div className="min-h-screen w-full bg-bolt-elements-bg-root overflow-hidden" data-dashboard-shell>
      {/* Top gradient backdrop (Lovable-like hero feel) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* App-base44-ish soft vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85" />
        {/* Colored glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[920px] rounded-full blur-[80px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.35),transparent_60%)]" />
        <div className="absolute top-20 left-[-200px] h-[420px] w-[680px] rounded-full blur-[70px] bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.28),transparent_55%)]" />
      </div>

      <div className="relative z-1 h-full">
        <Header />

        <div className="flex w-full h-[calc(100vh-var(--header-height))]">
          {/* Left sidebar */}
          <aside className="hidden lg:block w-[350px] flex-shrink-0">
            <Menu />
          </aside>

          {/* Main */}
          <main className="flex-1 overflow-hidden">
            <div className={classNames('h-full w-full', chatStarted ? 'pt-0' : 'pt-0')}>{children}</div>
          </main>

          {/* Right workbench drawer/panel (existing logic) */}
          <div className="hidden lg:block">
            <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />
          </div>
        </div>
      </div>
    </div>
  );
}
