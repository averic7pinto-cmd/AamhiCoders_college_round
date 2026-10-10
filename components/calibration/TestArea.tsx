import React, { useState } from 'react';

interface TestAreaProps {
  hits: number[];
  onHit: (index: number) => void;
  dwellMs: number;
}

const targets = [
  { x: '15%', y: '25%' },
  { x: '50%', y: '20%' },
  { x: '82%', y: '35%' },
  { x: '30%', y: '70%' },
  { x: '72%', y: '75%' },
];

export default function TestArea({ hits, onHit, dwellMs }: TestAreaProps) {
  const [activeTarget, setActiveTarget] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-2xl font-semibold">
          Test your hands-free pointer
        </h3>
        <p className="mt-2 text-muted">
          Select every target to test your pointer control. You can click a
          target or hold the pointer over it for the dwell duration.
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <span>Targets completed</span>
        <span className="font-semibold text-cyan">
          {hits.length} / {targets.length}
        </span>
      </div>

      <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-line bg-[#0B0E16] bg-grid">
        {targets.map((target, index) => {
          const completed = hits.includes(index);

          return (
            <button
              key={index}
              type="button"
              aria-label={`Target ${index + 1}${completed ? ', completed' : ''}`}
              disabled={completed}
              onMouseEnter={() => setActiveTarget(index)}
              onMouseLeave={() => setActiveTarget(null)}
              onClick={() => onHit(index)}
              className={`absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-sm font-bold transition-all duration-200 ${
                completed
                  ? 'border-lime bg-lime/20 text-lime'
                  : activeTarget === index
                    ? 'scale-125 border-cyan bg-cyan/20 text-cyan'
                    : 'border-violet-soft bg-violet-soft/10 text-violet-soft hover:border-cyan hover:text-cyan'
              }`}
              style={{ left: target.x, top: target.y }}
            >
              {completed ? '✓' : index + 1}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-muted">
        Dwell setting: {dwellMs} ms. Use the targets to check your accuracy
        and comfort before continuing.
      </p>
    </div>
  );
}