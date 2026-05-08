import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { classNames } from '~/utils/classNames';
import { Header } from '~/components/header/Header';
import { Menu } from '~/components/sidebar/Menu.client';
import { Workbench } from '~/components/workbench/Workbench.client';

interface DashboardShellProps {
  children: React.ReactNode;
  chatStarted?: boolean;
  isStreaming?: boolean;
}

export function DashboardShell({
  children,
  chatStarted = false,
  isStreaming = false,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen w-full bg-bolt-elements-bg-root overflow-hidden">
      <div className="relative h-full">
        <Header />

        <div className="flex w-full h-[calc(100vh-var(--header-height))]">
          <aside className="hidden lg:block w-[350px] flex-shrink-0">
            <ClientOnly fallback={<div />}>
              {() => <Menu />}
            </ClientOnly>
          </aside>

          <main className="flex-1 overflow-hidden">
            <div className={classNames('h-full w-full')}>
              {children}
            </div>
          </main>

          <div className="hidden lg:block">
            <ClientOnly fallback={<div />}>
              {() => (
                <Workbench
                  chatStarted={chatStarted}
                  isStreaming={isStreaming}
                />
              )}
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  );
}
