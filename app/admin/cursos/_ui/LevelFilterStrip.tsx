'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { SignalFull01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import type { CourseLevel } from '@/types/curso-schema';
import { COURSE_LEVELS, LEVEL_LABELS } from './curso-helpers';

interface LevelFilterStripProps {
    value: CourseLevel | 'all';
    onChange: (level: CourseLevel | 'all') => void;
    counts: Record<CourseLevel | 'all', number>;
}

export default function LevelFilterStrip({
    value,
    onChange,
    counts,
}: LevelFilterStripProps) {
    const options: Array<{ key: CourseLevel | 'all'; label: string }> = [
        { key: 'all', label: 'Todos' },
        ...COURSE_LEVELS.map((level) => ({
            key: level,
            label: LEVEL_LABELS[level],
        })),
    ];

    return (
        <div className="-mx-1 flex min-w-0 w-full items-center gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            <span className="mr-1 inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <HugeiconsIcon
                    icon={SignalFull01Icon}
                    strokeWidth={2}
                    className="size-3.5 text-purple-600 dark:text-purple-400"
                />
                Nivel
            </span>
            {options.map((option) => {
                const active = value === option.key;
                return (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => onChange(option.key)}
                        className={cn(
                            'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-all active:scale-[0.98]',
                            active
                                ? 'border-purple-500/50 bg-purple-600 text-white shadow-sm shadow-purple-600/25'
                                : 'border-border/70 bg-background/50 text-muted-foreground hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-foreground'
                        )}
                    >
                        <span>{option.label}</span>
                        <span
                            className={cn(
                                'rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums',
                                active
                                    ? 'bg-white/20 text-white'
                                    : 'bg-muted/80 text-muted-foreground'
                            )}
                        >
                            {counts[option.key]}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
