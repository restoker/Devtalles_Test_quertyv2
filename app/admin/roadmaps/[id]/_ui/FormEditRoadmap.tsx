'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    ArrowLeft02Icon,
    Route01Icon,
    CheckmarkCircle02Icon,
    Delete02Icon,
    Loading03Icon,
} from '@hugeicons/core-free-icons';

import {
    createRoadmapSchema,
    courseTitleFromRoadmap,
    type CreateRoadmapSchema,
    type PublishedCourseOption,
    type RoadmapView,
} from '@/types/roadmap-schema';
import { updateRoadmapAction } from '@/server/actions/roadmaps/update-roadmap-action';
import { updateRoadmapProgressAction } from '@/server/actions/roadmaps/update-roadmap-progress-action';
import { deleteRoadmapAction } from '@/server/actions/roadmaps/delete-roadmap-action';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import CourseOrderPicker from '../../_ui/CourseOrderPicker';

interface FormEditRoadmapProps {
    roadmap: RoadmapView;
    catalog: PublishedCourseOption[];
    listHref?: string;
    canEditProgress?: boolean;
}

export default function FormEditRoadmap({
    roadmap,
    catalog,
    listHref = '/admin/roadmaps',
    canEditProgress = false,
}: FormEditRoadmapProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, startDelete] = useTransition();
    const [progressPending, setProgressPending] = useState<number | null>(null);

    const sorted = useMemo(
        () => [...roadmap.courses].sort((a, b) => a.sortOrder - b.sortOrder),
        [roadmap.courses]
    );

    const membershipById = useMemo(
        () => Object.fromEntries(sorted.map((c) => [c.courseId, c])),
        [sorted]
    );

    const titleById = useMemo(() => {
        const map: Record<number, string> = {};
        for (const m of sorted) {
            map[m.courseId] = courseTitleFromRoadmap(m.courseId, m, catalog);
        }
        return map;
    }, [sorted, catalog]);

    const [progressMap, setProgressMap] = useState<Record<number, number>>(() =>
        Object.fromEntries(sorted.map((c) => [c.courseId, c.progress]))
    );

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<CreateRoadmapSchema>({
        resolver: zodResolver(createRoadmapSchema),
        defaultValues: {
            title: roadmap.title,
            courseIds: sorted.map((c) => c.courseId),
        },
        mode: 'onChange',
    });

    const titleValue = watch('title') || '';
    const courseIds = watch('courseIds') || [];

    const labelFor = (courseId: number) =>
        courseTitleFromRoadmap(courseId, membershipById[courseId], catalog);

    const setProgressValue = (courseId: number, value: number) => {
        const clamped = Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)));
        setProgressMap((prev) => ({ ...prev, [courseId]: clamped }));
        return clamped;
    };

    const persistProgress = async (courseId: number, value: number) => {
        const clamped = setProgressValue(courseId, value);
        setProgressPending(courseId);
        const result = await updateRoadmapProgressAction(roadmap.id, courseId, clamped);
        setProgressPending(null);
        if (!result.ok) {
            toast.add({
                title: 'Error al actualizar progreso',
                description: result.msg,
                type: 'error',
            });
            const original = membershipById[courseId]?.progress ?? 0;
            setProgressMap((prev) => ({ ...prev, [courseId]: original }));
            return;
        }
        toast.add({
            title: 'Progreso actualizado',
            description: `${labelFor(courseId)} → ${clamped}%`,
            type: 'success',
        });
    };

    const onSubmit = (data: CreateRoadmapSchema) => {
        startTransition(async () => {
            const result = await updateRoadmapAction(roadmap.id, {
                title: data.title,
                courseIds: data.courseIds.map(Number),
            });
            if (!result.ok) {
                toast.add({
                    title: 'Error al actualizar el roadmap',
                    description: result.msg,
                    type: 'error',
                });
                return;
            }
            toast.add({
                title: 'Roadmap actualizado',
                description: result.msg,
                type: 'success',
            });
            router.push(listHref);
            router.refresh();
        });
    };

    const handleDelete = () => {
        const ok = window.confirm(
            `¿Eliminar el roadmap "${roadmap.title}"? Esta acción no se puede deshacer.`
        );
        if (!ok) return;
        startDelete(async () => {
            const result = await deleteRoadmapAction(roadmap.id);
            if (!result.ok) {
                toast.add({
                    title: 'Error al eliminar',
                    description: result.msg,
                    type: 'error',
                });
                return;
            }
            toast.add({
                title: 'Roadmap eliminado',
                description: result.msg,
                type: 'success',
            });
            router.push(listHref);
            router.refresh();
        });
    };

    const busy = isPending || isDeleting;

    return (
        <div className="mx-auto w-full max-w-2xl py-2 sm:py-6">
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex flex-col gap-2"
            >
                <div className="flex items-center gap-2">
                    <Link
                        href={listHref}
                        className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-accent hover:text-foreground active:scale-[0.98]"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft02Icon}
                            strokeWidth={2}
                            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                        />
                        <span>Roadmaps</span>
                    </Link>
                    <span className="text-xs text-muted-foreground/40">/</span>
                    <span className="truncate text-xs font-semibold text-foreground">{roadmap.title}</span>
                </div>

                <div className="mt-2 flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Editar roadmap
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {canEditProgress
                                ? 'Ajusta el título, el orden de cursos y el progreso por curso.'
                                : 'Ajusta el título y el orden de cursos.'}
                        </p>
                        {roadmap.rationale ? (
                            <p className="mt-3 max-w-xl text-sm text-foreground">
                                <span className="font-semibold">
                                    Hemos seleccionado los mejores cursos para ti.
                                </span>{' '}
                                {roadmap.rationale}
                            </p>
                        ) : null}
                    </div>
                    <div className="hidden size-11 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 shadow-xs sm:flex dark:text-purple-400">
                        <HugeiconsIcon icon={Route01Icon} strokeWidth={2} className="size-5" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-zinc-950/60"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="roadmap-title-edit"
                                className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                            >
                                Título <span className="text-purple-600 dark:text-purple-400">*</span>
                            </label>
                            <span className="text-[11px] tabular-nums text-muted-foreground">
                                {titleValue.length}/200
                            </span>
                        </div>
                        <input
                            id="roadmap-title-edit"
                            type="text"
                            autoComplete="off"
                            aria-invalid={!!errors.title}
                            disabled={busy}
                            className={cn(
                                'h-12 w-full rounded-xl border bg-background/50 px-4 text-sm font-medium text-foreground outline-none transition-all',
                                'focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500',
                                errors.title
                                    ? 'border-destructive text-destructive'
                                    : 'border-border hover:border-foreground/30'
                            )}
                            {...register('title')}
                        />
                        <AnimatePresence mode="wait">
                            {errors.title && (
                                <motion.p
                                    role="alert"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="flex items-center gap-1.5 text-xs font-medium text-destructive"
                                >
                                    <span className="size-1 rounded-full bg-destructive" />
                                    {errors.title.message}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <Controller
                        name="courseIds"
                        control={control}
                        render={({ field }) => (
                            <CourseOrderPicker
                                catalog={catalog}
                                courseIds={field.value}
                                titleById={titleById}
                                onChange={(ids) => {
                                    field.onChange(ids);
                                    setProgressMap((prev) => {
                                        const next = { ...prev };
                                        for (const id of ids) {
                                            if (next[id] === undefined) next[id] = 0;
                                        }
                                        return next;
                                    });
                                }}
                                error={errors.courseIds?.message}
                            />
                        )}
                    />

                    {courseIds.length > 0 && (
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                Progreso por curso
                            </label>
                            <ul className="space-y-3">
                                {courseIds.map((courseId) => {
                                    const value = progressMap[courseId] ?? 0;
                                    const saving = progressPending === courseId;
                                    return (
                                        <li
                                            key={courseId}
                                            className="rounded-xl border border-border/70 bg-background/40 p-3.5"
                                        >
                                            <div className="mb-2.5 flex items-center justify-between gap-2">
                                                <span className="truncate text-sm font-medium text-foreground">
                                                    {labelFor(courseId)}
                                                </span>
                                                <span className="text-xs font-semibold tabular-nums text-purple-600 dark:text-purple-400">
                                                    {saving ? '…' : `${value}%`}
                                                </span>
                                            </div>
                                            {canEditProgress ? (
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        value={value}
                                                        disabled={busy || saving}
                                                        onChange={(e) =>
                                                            setProgressValue(courseId, Number(e.target.value))
                                                        }
                                                        onPointerUp={(e) =>
                                                            void persistProgress(
                                                                courseId,
                                                                Number((e.target as HTMLInputElement).value)
                                                            )
                                                        }
                                                        className="h-2 flex-1 cursor-pointer accent-purple-600 disabled:opacity-50"
                                                        aria-label={`Progreso de ${labelFor(courseId)}`}
                                                    />
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        value={value}
                                                        disabled={busy || saving}
                                                        onChange={(e) =>
                                                            setProgressValue(courseId, Number(e.target.value))
                                                        }
                                                        onBlur={(e) =>
                                                            void persistProgress(
                                                                courseId,
                                                                Number(e.target.value)
                                                            )
                                                        }
                                                        className="h-9 w-16 rounded-lg border border-border/70 bg-background/60 px-2 text-center text-xs font-semibold tabular-nums outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                                                    role="progressbar"
                                                    aria-valuenow={value}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-label={`Progreso de ${labelFor(courseId)}`}
                                                >
                                                    <div
                                                        className="h-full rounded-full bg-purple-600"
                                                        style={{
                                                            width: `${Math.min(100, Math.max(0, value))}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            {canEditProgress ? (
                                <p className="text-[11px] text-muted-foreground">
                                    El progreso se guarda al soltar el slider o al salir del campo numérico.
                                    El orden de cursos se guarda con «Guardar cambios».
                                </p>
                            ) : (
                                <p className="text-[11px] text-muted-foreground">
                                    El orden de cursos se guarda con «Guardar cambios».
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-border/50 pt-5 lg:flex-row lg:items-center lg:justify-between">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={busy}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-5 text-sm font-medium text-destructive transition-all hover:bg-destructive/20 active:scale-[0.98] disabled:opacity-60"
                        >
                            <HugeiconsIcon
                                icon={isDeleting ? Loading03Icon : Delete02Icon}
                                strokeWidth={2}
                                className={cn('size-4', isDeleting && 'animate-spin')}
                            />
                            <span>{isDeleting ? 'Eliminando…' : 'Eliminar'}</span>
                        </button>

                        <div className="flex flex-col-reverse gap-3 lg:flex-row lg:items-center">
                            <Link
                                href={listHref}
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-border/80 bg-background/50 px-5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-[0.98]"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={busy}
                                className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 active:scale-[0.98] disabled:opacity-60 dark:hover:bg-purple-500"
                            >
                                <HugeiconsIcon
                                    icon={isPending ? Loading03Icon : CheckmarkCircle02Icon}
                                    strokeWidth={2}
                                    className={cn(
                                        'size-4',
                                        isPending ? 'animate-spin' : 'transition-transform group-hover:scale-110'
                                    )}
                                />
                                <span>{isPending ? 'Guardando…' : 'Guardar cambios'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
