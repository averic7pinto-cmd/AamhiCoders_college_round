import React from "react";
import { CameraIcon, CrosshairIcon, MicIcon, PlugZapIcon, BoxIcon } from "lucide-react";
import { ProgressRing } from "../ui/ProgressRing";
import { useSession } from "../../contexts/SessionContext";
type RowTone = 'ok' | 'warn' | 'bad';
const toneText: Record<RowTone, string> = {
  ok: 'text-lime',
  warn: 'text-amber',
  bad: 'text-coral'
};
export function TrackingStatusPanel() {
  const {
    confidence,
    cameraState,
    micState,
    isTracking
  } = useSession();
  const signal = confidence === null ? 'No signal yet' : confidence >= 92 ? 'Strong lock' : confidence >= 85 ? 'Good lock' : 'Weak — check lighting';
  const rows: Array<{
    icon: typeof BoxIcon;
    label: string;
    value: string;
    tone: RowTone;
  }> = [{
    icon: CameraIcon,
    label: 'Camera',
    value: cameraState === 'ready' ? 'Connected' : cameraState === 'permission' ? 'Permission required' : 'Face not found',
    tone: cameraState === 'ready' ? 'ok' : cameraState === 'permission' ? 'warn' : 'bad'
  }, {
    icon: MicIcon,
    label: 'Microphone',
    value: micState === 'ready' ? 'Connected' : 'Unavailable',
    tone: micState === 'ready' ? 'ok' : 'bad'
  }, {
    icon: PlugZapIcon,
    label: 'Active tab',
    value: 'news.example.com',
    tone: 'ok'
  }, {
    icon: CrosshairIcon,
    label: 'Calibration',
    value: 'Today, 09:08',
    tone: 'ok'
  }];
  return <section aria-labelledby="tracking-status-heading" className="rounded-4xl border border-line bg-ink-2 p-6 shadow-panel">
      <h2 id="tracking-status-heading" className="font-display text-base font-semibold">
        Tracking status
      </h2>

      <div className="mt-5 flex items-center gap-5">
        <ProgressRing value={confidence} size={128} from="#31D7FF" to="#C5FF4A">
          <div>
            <p className="font-mono text-3xl font-semibold tabular-nums">{confidence !== null ? confidence : '—'}</p>
            <p className="text-[11px] font-bold text-muted">{confidence !== null ? 'percent' : 'idle'}</p>
          </div>
        </ProgressRing>
        <div>
          <p className="text-sm font-semibold text-muted">Confidence</p>
          <p className={`mt-1 text-lg font-bold ${isTracking ? 'text-lime' : 'text-fg'}`}>{signal}</p>
          <p className="mt-1 text-xs text-muted">Simulated reading for this preview</p>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-line border-t border-line">
        {rows.map(r => <li key={r.label} className="flex items-center gap-3 py-3">
            <r.icon className="h-4 w-4 text-muted" aria-hidden="true" />
            <span className="flex-1 text-sm font-semibold text-fg">{r.label}</span>
            <span className={`text-sm font-bold ${toneText[r.tone]}`}>{r.value}</span>
          </li>)}
      </ul>
    </section>;
}