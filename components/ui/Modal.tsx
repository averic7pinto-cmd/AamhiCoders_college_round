import React, { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descId = useId();
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const first = ref.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? ref.current)?.focus();
    }, 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'Tab' && ref.current) {
        const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-ink/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="luminous relative w-full max-w-lg rounded-3xl bg-ink-2 p-6 shadow-panel sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg"
            >
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <h2 id={titleId} className="pr-10 font-display text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-2 text-sm leading-relaxed text-muted">
                {description}
              </p>
            )}
            {children && <div className="mt-5">{children}</div>}
            {footer && <div className="mt-7 flex flex-wrap justify-end gap-3">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
