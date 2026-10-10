import React from 'react';
import { ListeningPanel } from '../components/voice/ListeningPanel';
import { RecentCommands } from '../components/voice/RecentCommands';
import { DictationReview } from '../components/voice/DictationReview';
import { CommandLibrary } from '../components/voice/CommandLibrary';
import { CustomCommands } from '../components/voice/CustomCommands';

export function VoiceCommands() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <ListeningPanel />
          <DictationReview />
        </div>
        <div className="xl:col-span-5">
          <RecentCommands />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <CommandLibrary />
        </div>
        <div className="xl:col-span-4">
          <CustomCommands />
        </div>
      </div>
    </div>
  );
}
