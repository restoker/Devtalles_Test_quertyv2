'use client';

import { useTransition } from 'react';
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
    Loading03Icon,
} from '@hugeicons/core-free-icons';

import {
    createRoadmapSchema,
    type CreateRoadmapSchema,
    type PublishedCourseOption,
} from '@/types/roadmap-schema';
import { createRoadmapAction } from '@/server/actions/roadmaps/create-roadmap-action';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import CourseOrderPicker from '../../_ui/CourseOrderPicker';

interface FormNewRoadmapProps {
    catalog: PublishedCourseOption[];
    returnHref?: string;
}

export default function FormNewRoadmap({
    catalog,
    returnHref = '/admin/roadmaps',
}: FormNewRoadmapProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<CreateRoadmapSchema>({
        resolver: zodResolver(createRoadmapSchema),
        defaultValues: { title: '', courseIds: [] },
        mode: 'onChange',
    });

    const titleValue = watch('title') || '';

    const onSubmit = (data: CreateRoadmapSchema) => {
        startTransition(async () => {
            const result = await createRoadmapAction({
                title: data.title,
                courseIds: data.courseIds.map(Number),
            });
            if (!result.ok) {
                toast.add({
                    title: 'Error al crear el roadmap',
                    description: result.msg,
                    type: 'error',
                });
                return;
            }
            toast.add({
                title: 'Roadmap creado',
                description: result.msg,
                type: 'success',
            });
            router.push(returnHref);
            router.refresh();
        });
    };

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
                        href={returnHref}
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
                    <span className="text-xs font-semibold text-foreground">Nuevo roadmap</span>
                </div>

                <div className="mt-2 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Crear nuevo roadmap
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Define un título y ordena los cursos de la ruta de aprendizaje.
                        </p>
                    </div>
                    <div className="hidden size-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 shadow-xs sm:flex dark:text-purple-400">
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
                                htmlFor="roadmap-title"
                                className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                            >
                                Título <span className="text-purple-600 dark:text-purple-400">*</span>
                            </label>
                            <span className="text-[11px] tabular-nums text-muted-foreground">
                                {titleValue.length}/200
                            </span>
                        </div>
                        <input
                            id="roadmap-title"
                            type="text"
                            placeholder="Ej. Ruta Frontend moderna..."
                            autoComplete="off"
                            aria-invalid={!!errors.title}
                            disabled={isPending}
                            className={cn(
                                'h-12 w-full rounded-xl border bg-background/50 px-4 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/50',
                                'focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500',
                                errors.title
                                    ? 'border-destructive text-destructive focus:border-destructive focus:ring-destructive/20'
                                    : 'border-border hover:border-foreground/30'
                            )}
                            {...register('title')}
                        />
                        <AnimatePresence mode="wait">
                            {errors.title ? (
                                <motion.p
                                    role="alert"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    className="flex items-center gap-1.5 pt-1 text-xs font-medium text-destructive"
                                >
                                    <span className="size-1 rounded-full bg-destructive" />
                                    {errors.title.message}
                                </motion.p>
                            ) : (
                                <p className="text-xs leading-relaxed text-muted-foreground/80">
                                    Título visible de la ruta (1–200 caracteres).
                                </p>
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
                                onChange={field.onChange}
                                error={errors.courseIds?.message}
                            />
                        )}
                    />

                    <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:items-center sm:justify-end">
                        <Link
                            href={returnHref}
                            className="inline-flex h-11 items-center justify-center rounded-xl border border-border/80 bg-background/50 px-5 text-sm font-medium text-foreground transition-all hover:border-border hover:bg-muted active:scale-[0.98]"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 hover:shadow-purple-500/25 active:scale-[0.98] disabled:opacity-60 dark:hover:bg-purple-500"
                        >
                            <HugeiconsIcon
                                icon={isPending ? Loading03Icon : CheckmarkCircle02Icon}
                                strokeWidth={2}
                                className={cn('size-4', isPending && 'animate-spin')}
                            />
                            <span>{isPending ? 'Guardando…' : 'Guardar roadmap'}</span>
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
