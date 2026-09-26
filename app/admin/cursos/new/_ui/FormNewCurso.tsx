'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { motion, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    ArrowLeft02Icon,
    BookOpen01Icon,
    CheckmarkCircle02Icon,
    FileEditIcon,
    Archive02Icon,
    Link01Icon,
    Image01Icon,
    UserIcon,
    Clock01Icon,
    Tag01Icon,
} from '@hugeicons/core-free-icons';

import {
    createCursoSchema,
    type CreateCursoSchema,
    type CourseLevel,
    type CourseStatus,
} from '@/types/curso-schema';
import { createCursoAction } from '@/server/actions/cursos/create-curso-action';
import { updateCursoAction } from '@/server/actions/cursos/update-curso-action';
import { getCursoAction } from '@/server/actions/cursos/get-curso-action';
import { publishCursoAction } from '@/server/actions/cursos/publish-curso-action';
import { draftCursoAction } from '@/server/actions/cursos/draft-curso-action';
import { archiveCursoAction } from '@/server/actions/cursos/archive-curso-action';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import {
    LEVEL_LABELS,
    normalizeCursoItem,
    type CatalogRef,
    type CursoItem,
} from '../../_ui/curso-helpers';

const emptyDefaults: CreateCursoSchema = {
    title: '',
    description: '',
    url: '',
    imageUrl: '',
    durationMinutes: '',
    instructor: '',
    level: '',
    categoryIds: [],
    technologyIds: [],
    prerequisiteIds: [],
};

function IdChipGroup({
    options,
    selected,
    onChange,
    label,
}: {
    options: Array<{ id: number; name: string }>;
    selected: number[];
    onChange: (ids: number[]) => void;
    label: string;
}) {
    const toggle = (id: number) => {
        if (selected.includes(id)) {
            onChange(selected.filter((x) => x !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {label}
            </span>
            <div className="flex flex-wrap gap-2">
                {options.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                        No hay opciones disponibles.
                    </p>
                ) : (
                    options.map((opt) => {
                        const active = selected.includes(opt.id);
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => toggle(opt.id)}
                                className={cn(
                                    'inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.98]',
                                    active
                                        ? 'border-purple-500/50 bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                                        : 'border-border/70 bg-background/50 text-muted-foreground hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-foreground'
                                )}
                            >
                                <span className="truncate">{opt.name}</span>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

interface FormNewCursoProps {
    categories: CatalogRef[];
    technologies: CatalogRef[];
    courses: CursoItem[];
    levels: CourseLevel[];
}

export default function FormNewCurso({
    categories,
    technologies,
    courses,
    levels,
}: FormNewCursoProps) {
    const router = useRouter();
    const params = useSearchParams();
    const editIdRaw = params.get('id');
    const editId = editIdRaw ? Number(editIdRaw) : null;
    const isEdit = editId != null && !Number.isNaN(editId);
    const [loadingCourse, setLoadingCourse] = useState(isEdit);
    const [statusPending, startStatusTransition] = useTransition();

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors },
    } = useForm<CreateCursoSchema>({
        resolver: zodResolver(createCursoSchema),
        defaultValues: emptyDefaults,
        mode: 'onChange',
    });

    useEffect(() => {
        if (!isEdit || editId == null) {
            reset(emptyDefaults);
            setLoadingCourse(false);
            return;
        }

        let cancelled = false;
        (async () => {
            setLoadingCourse(true);
            const result = await getCursoAction(editId);
            if (cancelled) return;
            setLoadingCourse(false);

            if (!result.ok || !result.data) {
                toast.add({
                    title: 'Error al obtener el curso',
                    description: result.msg || `No se encontró el curso ${editId}.`,
                    type: 'error',
                });
                router.push('/admin/cursos');
                return;
            }

            const course = normalizeCursoItem(result.data);
            reset({
                id: course.id,
                title: course.title,
                description: course.description ?? '',
                url: course.url ?? '',
                imageUrl: course.imageUrl ?? '',
                durationMinutes:
                    course.durationMinutes != null
                        ? String(course.durationMinutes)
                        : '',
                instructor: course.instructor ?? '',
                level: course.level ?? '',
                categoryIds: course.categories.map((c) => c.id),
                technologyIds: course.technologies.map((t) => t.id),
                prerequisiteIds: course.prerequisiteIds,
            });
        })();

        return () => {
            cancelled = true;
        };
    }, [isEdit, editId, reset, router]);

    const titleValue = watch('title') || '';
    const prerequisiteOptions = useMemo(
        () =>
            courses
                .filter((c) => !isEdit || c.id !== editId)
                .map((c) => ({ id: c.id, name: c.title })),
        [courses, isEdit, editId]
    );

    const { execute: executeCreate, status: createStatus } = useAction(
        createCursoAction,
        {
            onSuccess: ({ data }) => {
                if (data?.ok) {
                    toast.add({
                        title: 'Curso creado',
                        description: data.msg,
                        type: 'success',
                    });
                    router.push('/admin/cursos');
                    router.refresh();
                } else {
                    toast.add({
                        title: 'Error al crear el curso',
                        description: data?.msg || 'No se pudo crear el curso.',
                        type: 'error',
                    });
                }
            },
            onError: ({ error }) => {
                toast.add({
                    title: 'Error del servidor',
                    description:
                        error.serverError ||
                        'No se pudo conectar con el servidor.',
                    type: 'error',
                });
            },
        }
    );

    const { execute: executeUpdate, status: updateStatus } = useAction(
        updateCursoAction,
        {
            onSuccess: ({ data }) => {
                if (data?.ok) {
                    toast.add({
                        title: 'Curso actualizado',
                        description: data.msg,
                        type: 'success',
                    });
                    router.push('/admin/cursos');
                    router.refresh();
                } else {
                    toast.add({
                        title: 'Error al actualizar el curso',
                        description:
                            data?.msg || 'No se pudo actualizar el curso.',
                        type: 'error',
                    });
                }
            },
            onError: ({ error }) => {
                toast.add({
                    title: 'Error del servidor',
                    description:
                        error.serverError ||
                        'No se pudo conectar con el servidor.',
                    type: 'error',
                });
            },
        }
    );

    const isSaving =
        createStatus === 'executing' || updateStatus === 'executing';

    const onSubmit = (data: CreateCursoSchema) => {
        if (isEdit && editId != null) {
            executeUpdate({ ...data, id: editId });
            return;
        }
        executeCreate(data);
    };

    const runStatusAction = (
        next: CourseStatus,
        action: (id: number) => Promise<{ ok: boolean; msg: string }>
    ) => {
        if (!isEdit || editId == null) {
            toast.add({
                title: 'Guarda el curso primero',
                description:
                    'Las acciones de estado requieren un curso existente.',
                type: 'error',
            });
            return;
        }
        const labels: Record<CourseStatus, string> = {
            published: 'Publicar',
            draft: 'Pasar a borrador',
            archived: 'Archivar',
        };
        startStatusTransition(async () => {
            const result = await action(editId);
            if (!result.ok) {
                toast.add({
                    title: `Error al ${labels[next].toLowerCase()}`,
                    description: result.msg,
                    type: 'error',
                });
                return;
            }
            toast.add({
                title: labels[next],
                description: result.msg,
                type: 'success',
            });
            router.refresh();
        });
    };

    const fieldClass = (hasError?: boolean) =>
        cn(
            'h-11 w-full rounded-xl border bg-background/50 px-3.5 text-sm font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground/50',
            'focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-500',
            hasError
                ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                : 'border-border hover:border-foreground/30'
        );

    if (loadingCourse) {
        return (
            <div className="p-8 text-center text-xs text-muted-foreground">
                Cargando curso...
            </div>
        );
    }

    return (
        <div
            data-lenis-prevent
            className="mx-auto h-[calc(100dvh-7.5rem)] min-h-0 w-full min-w-0 max-w-3xl space-y-0 overflow-y-auto overscroll-y-contain py-2 sm:py-6"
        >
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex min-w-0 flex-col gap-2"
            >
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/cursos"
                        className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-accent hover:text-foreground active:scale-[0.98]"
                        title="Volver a Cursos"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft02Icon}
                            strokeWidth={2}
                            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                        />
                        <span>Cursos</span>
                    </Link>
                    <span className="text-xs text-muted-foreground/40">/</span>
                    <span className="text-xs font-semibold text-foreground">
                        {isEdit ? 'Editar curso' : 'Nuevo curso'}
                    </span>
                </div>

                <div className="mt-2 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {isEdit ? 'Editar curso' : 'Crear nuevo curso'}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isEdit
                                ? 'Actualiza los datos del curso del catálogo.'
                                : 'Completa los campos del catálogo. Solo título es obligatorio. Se crea como borrador.'}
                        </p>
                    </div>

                    <div className="hidden size-11 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 shadow-xs sm:flex dark:text-purple-400">
                        <HugeiconsIcon
                            icon={BookOpen01Icon}
                            strokeWidth={2}
                            className="size-5"
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="relative min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-xs sm:p-6 md:p-8 dark:border-white/10 dark:bg-zinc-950/60 dark:shadow-2xl"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="course-title"
                                className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                            >
                                Título{' '}
                                <span className="text-purple-600 dark:text-purple-400">
                                    *
                                </span>
                            </label>
                            <span className="text-[11px] tabular-nums text-muted-foreground">
                                {titleValue.length}/200
                            </span>
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                <HugeiconsIcon
                                    icon={Tag01Icon}
                                    strokeWidth={2}
                                    className="size-4"
                                />
                            </div>
                            <input
                                id="course-title"
                                type="text"
                                placeholder="Ej. NestJS: Zero to Hero"
                                autoComplete="off"
                                aria-invalid={!!errors.title}
                                className={cn(fieldClass(!!errors.title), 'pl-10')}
                                {...register('title')}
                            />
                        </div>
                        <AnimatePresence mode="wait">
                            {errors.title ? (
                                <motion.p
                                    role="alert"
                                    initial={{ opacity: 0, y: -4, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -4, height: 0 }}
                                    className="pt-1 text-xs font-medium text-destructive"
                                >
                                    {errors.title.message}
                                </motion.p>
                            ) : (
                                <p className="text-xs leading-relaxed text-muted-foreground/80">
                                    Nombre público del curso en el catálogo Devtalles.
                                </p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="course-description"
                            className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                        >
                            Descripción
                        </label>
                        <textarea
                            id="course-description"
                            rows={4}
                            placeholder="Resumen del contenido del curso..."
                            className={cn(
                                fieldClass(!!errors.description),
                                'h-auto min-h-[96px] resize-y py-3'
                            )}
                            {...register('description')}
                        />
                        {errors.description && (
                            <p className="text-xs font-medium text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label
                                htmlFor="course-url"
                                className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                            >
                                URL del curso
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                    <HugeiconsIcon
                                        icon={Link01Icon}
                                        strokeWidth={2}
                                        className="size-4"
                                    />
                                </div>
                                <input
                                    id="course-url"
                                    type="url"
                                    placeholder="https://cursos.devtalles.com/..."
                                    className={cn(fieldClass(!!errors.url), 'pl-10')}
                                    {...register('url')}
                                />
                            </div>
                            {errors.url && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.url.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="course-image"
                                className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                            >
                                URL de imagen
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                    <HugeiconsIcon
                                        icon={Image01Icon}
                                        strokeWidth={2}
                                        className="size-4"
                                    />
                                </div>
                                <input
                                    id="course-image"
                                    type="url"
                                    placeholder="https://..."
                                    className={cn(
                                        fieldClass(!!errors.imageUrl),
                                        'pl-10'
                                    )}
                                    {...register('imageUrl')}
                                />
                            </div>
                            {errors.imageUrl && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.imageUrl.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="space-y-2">
                            <label
                                htmlFor="course-duration"
                                className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                            >
                                Duración (min)
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                    <HugeiconsIcon
                                        icon={Clock01Icon}
                                        strokeWidth={2}
                                        className="size-4"
                                    />
                                </div>
                                <input
                                    id="course-duration"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="120"
                                    className={cn(
                                        fieldClass(!!errors.durationMinutes),
                                        'pl-10'
                                    )}
                                    {...register('durationMinutes')}
                                />
                            </div>
                            {errors.durationMinutes && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.durationMinutes.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="course-instructor"
                                className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                            >
                                Instructor
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                    <HugeiconsIcon
                                        icon={UserIcon}
                                        strokeWidth={2}
                                        className="size-4"
                                    />
                                </div>
                                <input
                                    id="course-instructor"
                                    type="text"
                                    placeholder="Fernando Herrera"
                                    className={cn(
                                        fieldClass(!!errors.instructor),
                                        'pl-10'
                                    )}
                                    {...register('instructor')}
                                />
                            </div>
                            {errors.instructor && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.instructor.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="course-level"
                                className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                            >
                                Nivel
                            </label>
                            <select
                                id="course-level"
                                className={cn(
                                    fieldClass(!!errors.level),
                                    'appearance-none'
                                )}
                                {...register('level')}
                            >
                                <option value="">Sin nivel</option>
                                {levels.map((level) => (
                                    <option key={level} value={level}>
                                        {LEVEL_LABELS[level]}
                                    </option>
                                ))}
                            </select>
                            {errors.level && (
                                <p className="text-xs font-medium text-destructive">
                                    {errors.level.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <Controller
                        name="categoryIds"
                        control={control}
                        render={({ field }) => (
                            <IdChipGroup
                                label="Categorías"
                                options={categories}
                                selected={field.value ?? []}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <Controller
                        name="technologyIds"
                        control={control}
                        render={({ field }) => (
                            <IdChipGroup
                                label="Tecnologías"
                                options={technologies}
                                selected={field.value ?? []}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <Controller
                        name="prerequisiteIds"
                        control={control}
                        render={({ field }) => (
                            <IdChipGroup
                                label="Prerrequisitos"
                                options={prerequisiteOptions}
                                selected={field.value ?? []}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    {isEdit && (
                        <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Acciones de estado
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    disabled={statusPending}
                                    onClick={() =>
                                        runStatusAction(
                                            'published',
                                            publishCursoAction
                                        )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-700 transition-all hover:opacity-100 active:scale-[0.98] disabled:opacity-50 dark:text-emerald-400"
                                >
                                    <HugeiconsIcon
                                        icon={CheckmarkCircle02Icon}
                                        strokeWidth={2}
                                        className="size-3.5"
                                    />
                                    Publicar
                                </button>
                                <button
                                    type="button"
                                    disabled={statusPending}
                                    onClick={() =>
                                        runStatusAction('draft', draftCursoAction)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-700 transition-all hover:opacity-100 active:scale-[0.98] disabled:opacity-50 dark:text-amber-400"
                                >
                                    <HugeiconsIcon
                                        icon={FileEditIcon}
                                        strokeWidth={2}
                                        className="size-3.5"
                                    />
                                    Borrador
                                </button>
                                <button
                                    type="button"
                                    disabled={statusPending}
                                    onClick={() =>
                                        runStatusAction(
                                            'archived',
                                            archiveCursoAction
                                        )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-500/30 bg-zinc-500/10 px-3.5 py-2 text-xs font-medium text-zinc-600 transition-all hover:opacity-100 active:scale-[0.98] disabled:opacity-50 dark:text-zinc-400"
                                >
                                    <HugeiconsIcon
                                        icon={Archive02Icon}
                                        strokeWidth={2}
                                        className="size-3.5"
                                    />
                                    Archivar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:items-center sm:justify-end">
                        <Link
                            href="/admin/cursos"
                            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border/80 bg-background/50 px-5 text-sm font-medium text-foreground transition-all hover:border-border hover:bg-muted active:scale-[0.98] sm:w-auto"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="group relative inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white shadow-sm outline-none transition-all hover:bg-purple-700 hover:shadow-purple-500/25 active:scale-[0.98] disabled:opacity-60 sm:w-auto dark:bg-purple-600 dark:hover:bg-purple-500"
                        >
                            <HugeiconsIcon
                                icon={CheckmarkCircle02Icon}
                                strokeWidth={2}
                                className="size-4 transition-transform group-hover:scale-110"
                            />
                            <span>
                                {isSaving
                                    ? 'Guardando...'
                                    : isEdit
                                      ? 'Guardar cambios'
                                      : 'Guardar curso'}
                            </span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
