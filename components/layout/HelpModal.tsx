import React from 'react';
import { Modal } from '../ui/Modal';
import { Kbd } from '../ui/Kbd';
import { Button } from '../ui/Button';
import { keyboardShortcuts } from '../../data/navigation';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Help & shortcuts"
      description="Everything in HANDSFREE works with a keyboard, a switch, your voice, or head movement. These shortcuts work from any page."
      footer={<Button onClick={onClose}>Got it</Button>}
    >
      <ul className="divide-y divide-line rounded-2xl border border-line bg-ink-3/50">
        {keyboardShortcuts.map((s) => (
          <li key={s.action} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm text-fg">{s.action}</span>
            <span className="flex gap-1">
              {s.keys.map((k) => (
                <Kbd key={k}>{k}</Kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">
        Say <span className="font-semibold text-cyan">“What can I say?”</span> during a session to hear available commands.
      </p>
    </Modal>
  );
}
