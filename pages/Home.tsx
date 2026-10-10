import React from 'react';
import { HeroPanel } from '../components/home/HeroPanel';
import { LiveStatusPanel } from '../components/home/LiveStatusPanel';
import { FeatureCards } from '../components/home/FeatureCards';
import { SessionStats } from '../components/home/SessionStats';
import { ActivityTimeline } from '../components/home/ActivityTimeline';
import { CommandCheatSheet } from '../components/home/CommandCheatSheet';

export function Home() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div className="grid gap-6 xl:grid-cols-12">
        <HeroPanel className="xl:col-span-7" />
        <LiveStatusPanel className="xl:col-span-5" />
      </div>

      <FeatureCards />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <SessionStats />
          <ActivityTimeline />
        </div>
        <CommandCheatSheet className="xl:col-span-4" />
      </div>
    </div>
  );
}
