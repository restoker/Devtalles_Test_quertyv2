'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
    ArrowUp01Icon,
    ArrowDown01Icon,
    Cancel01Icon,
    PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import type { PublishedCourseOption } from '@/types/roadmap-schema';

interface CourseOrderPickerProps {
    catalog: PublishedCourseOption[];
    courseIds: number[];
    onChange: (ids: number[]) => void;
    error?: string;
    /** Fallback titles when a selected id is not in catalog (e.g. archived). */
    titleById?: Record<number, string>;
}

export default function CourseOrderPicker({
    catalog,
    courseIds,
    onChange,
    error,
    titleById,
}: CourseOrderPickerProps) {
    const available = catalog.filter((c) => !courseIds.includes(c.id));

    const labelFor = (id: number) =>
        catalog.find((c) => c.id === id)?.title ??
        titleById?.[id] ??
        `Curso #${id}`;

    const move = (index: number, direction: -1 | 1) => {
        const next = [...courseIds];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    const remove = (id: number) => onChange(courseIds.filter((c) => c !== id));
    const add = (id: number) => onChange([...courseIds, id]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    Cursos ordenados <span className="text-purple-600 dark:text-purple-400">*</span>
                </label>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                    {courseIds.length} seleccionado(s)
                </span>
            </div>

            {courseIds.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
                    Aún no hay cursos. Elige del catálogo inferior.
                </div>
            ) : (
                <ul className="space-y-2">
                    {courseIds.map((id, index) => (
                        <li
                            key={id}
                            className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-3 py-2"
                        >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-purple-500/10 text-[11px] font-bold tabular-nums text-purple-600 dark:text-purple-400">
                                {index + 1}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                                {labelFor(id)}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => move(index, -1)}
                                    disabled={index === 0}
                                    title="Subir"
                                    className="inline-flex size-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-30"
                                >
                                    <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => move(index, 1)}
                                    disabled={index === courseIds.length - 1}
                                    title="Bajar"
                                    className="inline-flex size-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-30"
                                >
                                    <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => remove(id)}
                                    title="Quitar"
                                    className="inline-flex size-7 items-center justify-center rounded-lg border border-destructive/30 text-destructive/80 transition-all hover:bg-destructive/10"
                                >
                                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {error && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                    <span className="size-1 rounded-full bg-destructive" />
                    {error}
                </p>
            )}

            {available.length > 0 && (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Catálogo disponible
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {available.map((course) => (
                            <button
                                key={course.id}
                                type="button"
                                onClick={() => add(course.id)}
                                className={cn(
                                    'inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border/70 bg-background/80 px-2.5 py-1.5 text-xs font-medium text-foreground',
                                    'transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.98] dark:hover:text-purple-400'
                                )}
                            >
                                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3 shrink-0" />
                                <span className="truncate">{course.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
