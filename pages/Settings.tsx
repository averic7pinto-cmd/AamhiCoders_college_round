import React, { useEffect, useState } from 'react';
import { AccessibilityIcon, CheckCircle2Icon, LockIcon, MicIcon, ScanFaceIcon, ShieldCheckIcon, Trash2Icon, Volume2Icon } from 'lucide-react';
import { SettingsSection } from '../components/settings/SettingsSection';
import { PhraseChips } from '../components/settings/PhraseChips';
import { Toggle } from '../components/ui/Toggle';
import { Slider } from '../components/ui/Slider';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DeviceReadiness } from '../components/session/DeviceReadiness';
import { useSession } from '../contexts/SessionContext';

const sections = [
  { id: 'tracking', label: 'Head tracking' },
  { id: 'voice', label: 'Voice recognition' },
  { id: 'feedback', label: 'Speech feedback' },
  { id: 'safety', label: 'Confirmations' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'privacy', label: 'Privacy & permissions' },
];

export function Settings() {
  const s = useSession();
  const [active, setActive] = useState('tracking');
  const [pointerSize, setPointerSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [listenMode, setListenMode] = useState<'always' | 'wake' | 'push'>('wake');
  const [language, setLanguage] = useState('en-US');
  const [phrases, setPhrases] = useState(['Hey Handsfree', 'Start listening']);
  const [speech, setSpeech] = useState(true);
  const [verbosity, setVerbosity] = useState<'minimal' | 'standard' | 'detailed'>('standard');
  const [rate, setRate] = useState(1);
  const [confirm, setConfirm] = useState({ forms: true, tabs: true, payments: true, downloads: false });
  const [reduceMotion, setReduceMotion] = useState(false);
  const [textSize, setTextSize] = useState<'md' | 'lg' | 'xl'>('md');
  const [labelSize, setLabelSize] = useState<'md' | 'lg'>('lg');
  const [highContrast, setHighContrast] = useState(false);
  const [storeAnalytics, setStoreAnalytics] = useState(true);
  const [clearOpen, setClearOpen] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    return () => document.documentElement.classList.remove('reduce-motion');
  }, [reduceMotion]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -55% 0px' },
    );
    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Settings sections" className="hidden lg:block">
        <div className="sticky top-28">
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-lime" role="status">
            <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
            Saved automatically
          </p>
          <ul className="space-y-1">
            {sections.map((sec) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  aria-current={active === sec.id ? 'true' : undefined}
                  className={`relative flex h-11 items-center rounded-xl px-4 text-sm font-bold transition-colors duration-150 ${
                    active === sec.id ? 'bg-electric/15 text-fg' : 'text-muted hover:bg-white/[0.04] hover:text-fg'
                  }`}
                >
                  {active === sec.id && <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-cyan" aria-hidden="true" />}
                  {sec.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="min-w-0 space-y-6">
        <SettingsSection id="tracking" title="Head tracking" description="How your head movement moves the pointer." icon={ScanFaceIcon} tone="electric">
          <Toggle label="Enable head tracking" description="Uses your camera to follow head movement." checked={s.headTracking} onChange={s.setHeadTracking} />
          <Slider label="Cursor sensitivity" value={s.sensitivity} onChange={s.setSensitivity} min={1} max={10} format={(v) => `${v} / 10`} minLabel="Less travel" maxLabel="More travel" disabled={!s.headTracking} />
          <Slider label="Smoothing" description="Filters small, unintended movements like tremor." value={s.smoothing} onChange={s.setSmoothing} min={0} max={100} step={5} format={(v) => `${v}%`} minLabel="Responsive" maxLabel="Steady" disabled={!s.headTracking} />
          <Slider label="Dwell-to-select duration" description="How long the pointer must rest on something before it clicks." value={s.dwellMs} onChange={s.setDwellMs} min={400} max={2500} step={100} format={(v) => `${(v / 1000).toFixed(1)} s`} minLabel="Faster" maxLabel="More forgiving" disabled={!s.headTracking} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-fg">Pointer size</p>
              <p className="mt-1 text-sm text-muted">A larger pointer is easier to follow.</p>
            </div>
            <SegmentedControl label="Pointer size" value={pointerSize} onChange={setPointerSize} options={[{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
          </div>
        </SettingsSection>

        <SettingsSection id="voice" title="Voice recognition" description="How HANDSFREE listens for commands." icon={MicIcon} tone="violet">
          <Toggle label="Enable voice commands" checked={s.voiceEnabled} onChange={s.setVoiceEnabled} />
          <div className="space-y-3">
            <p className="text-sm font-semibold text-fg">Listening mode</p>
            <SegmentedControl label="Listening mode" value={listenMode} onChange={setListenMode} options={[{ value: 'wake', label: 'Wake phrase' }, { value: 'always', label: 'Always on' }, { value: 'push', label: 'Push to talk' }]} />
            <p className="text-sm text-muted">
              {listenMode === 'wake' ? 'Listens for an activation phrase, then for one command.' : listenMode === 'always' ? 'Every phrase is treated as a possible command.' : 'Listens only while you hold your assigned switch or key.'}
            </p>
          </div>
          <PhraseChips phrases={phrases} onChange={setPhrases} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <label htmlFor="lang" className="text-sm font-semibold text-fg">
              Recognition language
            </label>
            <select
              id="lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-11 rounded-xl border border-line bg-ink px-3 text-sm font-semibold text-fg hover:border-violet/50 focus:border-violet focus:outline-none"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Español</option>
              <option value="fr-FR">Français</option>
              <option value="de-DE">Deutsch</option>
            </select>
          </div>
        </SettingsSection>

        <SettingsSection id="feedback" title="Speech feedback" description="Spoken confirmations of what just happened." icon={Volume2Icon} tone="cyan">
          <Toggle label="Speak confirmations" description="For example, “Scrolled down” or “Opened link 4”." checked={speech} onChange={setSpeech} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold text-fg">Detail level</p>
            <SegmentedControl label="Feedback detail" value={verbosity} onChange={setVerbosity} options={[{ value: 'minimal', label: 'Minimal' }, { value: 'standard', label: 'Standard' }, { value: 'detailed', label: 'Detailed' }]} />
          </div>
          <Slider label="Speaking rate" value={rate} onChange={setRate} min={0.5} max={2} step={0.1} format={(v) => `${v.toFixed(1)}×`} minLabel="Slower" maxLabel="Faster" disabled={!speech} />
        </SettingsSection>

        <SettingsSection id="safety" title="Confirm before sensitive actions" description="Ask “Are you sure?” before actions that are hard to undo." icon={ShieldCheckIcon} tone="coral">
          <Toggle label="Submitting forms" checked={confirm.forms} onChange={(v) => setConfirm((c) => ({ ...c, forms: v }))} />
          <Toggle label="Closing tabs" checked={confirm.tabs} onChange={(v) => setConfirm((c) => ({ ...c, tabs: v }))} />
          <Toggle label="Payments and purchases" description="Strongly recommended. Confirmation always requires a spoken “Yes, confirm”." checked={confirm.payments} onChange={(v) => setConfirm((c) => ({ ...c, payments: v }))} />
          <Toggle label="Downloading files" checked={confirm.downloads} onChange={(v) => setConfirm((c) => ({ ...c, downloads: v }))} />
        </SettingsSection>

        <SettingsSection id="accessibility" title="Accessibility" description="Make HANDSFREE easier to see and use." icon={AccessibilityIcon} tone="lime">
          <Toggle label="Reduce motion" description="Turns off pulsing rings, scanning lines and animated transitions." checked={reduceMotion} onChange={setReduceMotion} />
          <Toggle label="High-contrast outlines" description="Adds thick outlines around targets on web pages." checked={highContrast} onChange={setHighContrast} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold text-fg">Interface text size</p>
            <SegmentedControl label="Interface text size" value={textSize} onChange={setTextSize} options={[{ value: 'md', label: 'Default' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra large' }]} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold text-fg">Target number labels</p>
            <SegmentedControl label="Target number label size" value={labelSize} onChange={setLabelSize} options={[{ value: 'md', label: 'Standard' }, { value: 'lg', label: 'Large' }]} />
          </div>
        </SettingsSection>

        <SettingsSection id="privacy" title="Privacy & permissions" description="You decide what HANDSFREE can access." icon={LockIcon} tone="amber">
          <DeviceReadiness />
          <p className="flex items-start gap-3 text-sm text-fg">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
            Camera frames are processed in your browser and never uploaded. Only the head position is used.
          </p>
          <Toggle label="Keep session analytics on this device" description="Powers the Performance page. Turn off to stop recording any history." checked={storeAnalytics} onChange={setStoreAnalytics} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-fg">Clear all local data</p>
              <p className="mt-1 text-sm text-muted" role="status">
                {cleared ? 'All local data has been cleared.' : 'Removes calibration, history and custom commands.'}
              </p>
            </div>
            <Button variant="danger" icon={Trash2Icon} onClick={() => setClearOpen(true)}>
              Clear data
            </Button>
          </div>
        </SettingsSection>
      </div>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear all local data?"
        description="This removes your calibration, session history and custom commands from this device. It can’t be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setClearOpen(false)}>
              Keep data
            </Button>
            <Button
              variant="danger"
              icon={Trash2Icon}
              onClick={() => {
                setCleared(true);
                setClearOpen(false);
              }}
            >
              Yes, clear everything
            </Button>
          </>
        }
      />
    </div>
  );
}
