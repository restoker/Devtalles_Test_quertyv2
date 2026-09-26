'use client';

import { cn } from '@/lib/utils';
import type { CourseStatus } from '@/types/curso-schema';
import { STATUS_LABELS } from './curso-helpers';

const STATUS_STYLES: Record<CourseStatus, string> = {
    published:
        'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    draft: 'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    archived:
        'border-zinc-500/35 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
};

export default function StatusBadge({ status }: { status: CourseStatus }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold tracking-wide',
                STATUS_STYLES[status]
            )}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}
