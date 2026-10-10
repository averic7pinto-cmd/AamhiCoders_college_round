import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useGlobalShortcuts } from '../../hooks/useGlobalShortcuts';

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();
  useGlobalShortcuts();

  useEffect(() => setNavOpen(false), [location.pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setNavOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen w-full bg-ink text-fg">
        <a
          href="#main"
          className="sr-only z-[70] rounded-xl bg-electric px-4 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>

        <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 lg:flex">
          <Sidebar idPrefix="desktop" />
        </aside>

        <AnimatePresence>
          {navOpen && (
            <motion.div
              className="fixed inset-0 z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-ink/75 backdrop-blur-sm" onClick={() => setNavOpen(false)} aria-hidden="true" />
              <motion.aside
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="relative h-full w-[288px] max-w-[85vw]"
              >
                <Sidebar idPrefix="drawer" onNavigate={() => setNavOpen(false)} />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenNav={() => setNavOpen(true)} />
          <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-10 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
