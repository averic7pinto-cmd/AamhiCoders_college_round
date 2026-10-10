import React from 'react';
import { TrackingViewport } from '../components/live/TrackingViewport';
import { SessionControlBar } from '../components/live/SessionControlBar';
import { TrackingStatusPanel } from '../components/live/TrackingStatusPanel';
import { MovementPanel } from '../components/live/MovementPanel';
import { TranscriptPanel } from '../components/live/TranscriptPanel';
import { CommandHistory } from '../components/live/CommandHistory';

export function LiveControl() {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-8">
        <TrackingViewport />
        <SessionControlBar />
        <div className="grid gap-6 md:grid-cols-2">
          <TranscriptPanel />
          <CommandHistory />
        </div>
      </div>
      <div className="space-y-6 xl:col-span-4">
        <TrackingStatusPanel />
        <MovementPanel />
      </div>
    </div>
  );
}
