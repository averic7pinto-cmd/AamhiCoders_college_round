import React from "react";
import { AccentTone } from "../../types/ui";
import { accentTile } from "../../utils/tone";
import { BoxIcon } from "lucide-react";
interface SettingsSectionProps {
  id: string;
  title: string;
  description: string;
  icon: typeof BoxIcon;
  tone: AccentTone;
  children: React.ReactNode;
}
export function SettingsSection({
  id,
  title,
  description,
  icon: Icon,
  tone,
  children
}: SettingsSectionProps) {
  return <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 rounded-4xl border border-line bg-ink-2 p-6 shadow-panel sm:p-8">
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${accentTile[tone]}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h2 id={`${id}-title`} className="font-display text-lg font-semibold">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-6 divide-y divide-line [&>*:first-child]:pt-0 [&>*:last-child]:pb-0 [&>*]:py-5">{children}</div>
    </section>;
}