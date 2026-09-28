'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { useAction } from 'next-safe-action/hooks';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    ArrowLeft02Icon,
    Book02Icon,
    Image01Icon,
    Link01Icon,
    User02Icon,
    CrownIcon,
    SparklesIcon,
    CheckmarkCircle02Icon,
    Cancel01Icon,
    Folder01Icon,
    SourceCodeIcon,
    Loading03Icon,
    Alert02Icon,
    Layers01Icon,
    InformationCircleIcon,
} from '@hugeicons/core-free-icons';

import { crearCursoSchema, type CrearCursoSchema } from '@/types/crear-cursos-schema';
import { createCursoAction } from '@/server/actions/cursos/create-curso-action';
import MultipleSelector, { type Option } from '@/components/ui/multi-select';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export interface CategoryOptionItem {
    id: string | number;
    name: string;
}

export interface TechnologyOptionItem {
    id: string | number;
    name: string;
}

export interface CourseOptionItem {
    id: number;
    title: string;
}

interface FormnewCourseProps {
    initialCategories?: CategoryOptionItem[];
    initialTechnologies?: TechnologyOptionItem[];
    initialCourses?: CourseOptionItem[];
    initialData?: Partial<CrearCursoSchema>;
}

const LEVEL_CONFIG = [
    {
        value: 'beginner' as const,
        label: 'Principiante',
        description: 'Fundamentos desde cero, sin requisitos previos',
        color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        activeRing: 'ring-emerald-500/30 border-emerald-500',
        icon: SparklesIcon,
    },
    {
        value: 'intermediate' as const,
        label: 'Intermedio',
        description: 'Bases sólidas, buenas prácticas y arquitectura',
        color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
        badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        activeRing: 'ring-purple-500/30 border-purple-500',
        icon: Layers01Icon,
    },
    {
        value: 'advanced' as const,
        label: 'Avanzado',
        description: 'Optimización de alto rendimiento, micro-frontends y escala',
        color: 'from-rose-500/20 to-amber-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
        badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        activeRing: 'ring-rose-500/30 border-rose-500',
        icon: CrownIcon,
    },
];

export default function FormnewCourse({
    initialCategories = [],
    initialTechnologies = [],
    initialCourses = [],
    initialData,
}: FormnewCourseProps) {
    const router = useRouter();
    const [imageLoadError, setImageLoadError] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        setError,
        formState: { errors },
    } = useForm<CrearCursoSchema>({
        resolver: zodResolver(crearCursoSchema),
        defaultValues: {
            id: initialData?.id,
            title: initialData?.title || '',
            description: initialData?.description || '',
            level: initialData?.level || 'beginner',
            imageUrl: initialData?.imageUrl || '',
            instructor: initialData?.instructor,
            url: initialData?.url || '',
            prerequisiteIds: initialData?.prerequisiteIds || [],
            categoryIds: initialData?.categoryIds || [],
            technologyIds: initialData?.technologyIds || [],
        },
        mode: 'onChange',
    });

    const watchedTitle = watch('title') || '';
    const watchedDesc = watch('description') || '';
    const watchedLevel = watch('level');
    const watchedImageUrl = watch('imageUrl') || '';
    const watchedPrereqIds = watch('prerequisiteIds') || [];
    const watchedCatIds = watch('categoryIds') || [];
    const watchedTechIds = watch('technologyIds') || [];
    const watchedCourseId = watch('id');
    const watchedInstructor = watch('instructor') || '';

    // 1. Mapeo de Categorías para MultipleSelector
    const categoryOptions: Option[] = useMemo(() => {
        return initialCategories.map(cat => ({
            value: String(cat.id),
            label: cat.name,
        }));
    }, [initialCategories]);

    // 2. Mapeo de Tecnologías para MultipleSelector
    const technologyOptions: Option[] = useMemo(() => {
        return initialTechnologies.map(tech => ({
            value: String(tech.id),
            label: tech.name,
        }));
    }, [initialTechnologies]);

    // 3. Mapeo y FILTRADO de Prerrequisitos:
    // REGLA FUNDAMENTAL: Un curso NO puede ser prerrequisito de sí mismo
    const availablePrerequisiteOptions: Option[] = useMemo(() => {
        const cleanTitle = watchedTitle.trim().toLowerCase();

        return initialCourses
            .filter(course => {
                // Si el curso tiene ID asignado (edición), se excluye a sí mismo
                if (watchedCourseId !== undefined && course.id === watchedCourseId) {
                    return false;
                }
                // Si el título coincide exactamente con uno ya existente, evitamos auto-referencia
                if (cleanTitle.length > 2 && course.title.trim().toLowerCase() === cleanTitle) {
                    return false;
                }
                return true;
            })
            .map(course => ({
                value: String(course.id),
                label: course.title,
            }));
    }, [initialCourses, watchedCourseId, watchedTitle]);

    // Safe action client para registrar curso
    const { execute, status } = useAction(createCursoAction, {
        onSuccess: ({ data }) => {
            if (data?.ok) {
                toast.add({
                    title: 'Curso registrado exitosamente',
                    description: data.msg || 'El curso ha sido publicado en el catálogo educativo.',
                    type: 'success',
                });
                router.push('/admin/cursos');
                router.refresh();
            } else {
                toast.add({
                    title: 'Error al registrar curso',
                    description: data?.msg || 'Ocurrió un problema al procesar la información del curso.',
                    type: 'error',
                });
            }
        },
        onError: ({ error }) => {
            toast.add({
                title: 'Error de comunicación',
                description: error.serverError || 'No se pudo conectar con el servidor para registrar el curso.',
                type: 'error',
            });
        },
    });

    const isPending = status === 'executing';

    // Validación y envío de formulario
    const onSubmit = (formData: CrearCursoSchema) => {
        // Doble validación en cliente: un curso no puede tener su propio id como requisito
        if (formData.id && formData.prerequisiteIds?.includes(formData.id)) {
            setError('prerequisiteIds', {
                type: 'manual',
                message: 'Un curso no puede ser prerrequisito de sí mismo.',
            });
            toast.add({
                title: 'Regla de validación infringida',
                description: 'El curso actual no puede seleccionarse como su propio prerrequisito.',
                type: 'error',
            });
            return;
        }

        execute({
            id: formData.id,
            title: formData.title,
            description: formData.description ?? '',
            level: formData.level,
            url: formData.url ?? '',
            imageUrl: formData.imageUrl ?? '',
            durationMinutes: formData.durationMinutes ?? '',
            instructor: formData.instructor ?? '',
            categoryIds: formData.categoryIds ?? [],
            technologyIds: formData.technologyIds ?? [],
            prerequisiteIds: formData.prerequisiteIds ?? [],
        });
    };

    // Cálculo de completitud para la tarjeta en vivo
    const completenessScore = useMemo(() => {
        let score = 0;
        if (watchedTitle.length >= 3) score += 30;
        if (watchedDesc.length >= 3) score += 20;
        if (watchedCatIds.length > 0) score += 20;
        if (watchedTechIds.length > 0) score += 20;
        if (watchedImageUrl.trim().length > 0) score += 10;
        return Math.min(score, 100);
    }, [watchedTitle, watchedDesc, watchedCatIds, watchedTechIds, watchedImageUrl]);

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            {/* Encabezado Principal y Migas de Pan */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="mb-8 flex flex-col gap-3"
            >
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/cursos"
                        className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md transition-all duration-300 hover:border-purple-500/40 hover:bg-purple-500/5 hover:text-foreground active:scale-[0.98]"
                        title="Volver al catálogo de cursos"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft02Icon}
                            strokeWidth={2}
                            className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
                        />
                        <span>Cursos</span>
                    </Link>
                    <span className="text-xs text-muted-foreground/40">/</span>
                    <span className="text-xs font-semibold text-foreground">Nuevo registro</span>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {/* <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400 uppercase">
                            <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3" />
                            <span>Catálogo Académico</span>
                        </div> */}
                        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Registrar Nuevo Curso
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                            Crea una experiencia educativa de primer nivel. Configura detalles pedagógicos, prerrequisitos, tecnologías y recursos.
                        </p>
                    </div>

                    <div className="hidden sm:flex size-14 items-center justify-center rounded-3xl border border-purple-500/25 bg-linear-to-br from-purple-500/15 to-indigo-500/5 text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/10">
                        <HugeiconsIcon icon={Book02Icon} strokeWidth={1.8} className="size-7" />
                    </div>
                </div>
            </motion.div>

            {/* Layout Asimétrico Bento: Formulario + Previsualización en Tiempo Real */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">

                    {/* COLUMNA IZQUIERDA: Formulario de Configuración (8 Columnas en Desktop) */}
                    <div className="space-y-8 lg:col-span-8">

                        {/* SECCIÓN 1: Información Esencial (Double-Bezel Architecture) */}
                        <div className="rounded-[2.25rem] border border-border/60 bg-muted/20 p-2 sm:p-2.5 ring-1 ring-black/4 dark:border-white/5 dark:bg-zinc-900/40 dark:ring-white/[0.04] shadow-sm">
                            <div className="rounded-[calc(2.25rem-0.625rem)] border border-border/80 bg-card p-6 sm:p-8 dark:border-white/10 dark:bg-zinc-950/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] space-y-6">

                                <div className="border-b border-border/60 pb-4">
                                    <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
                                        <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-4 text-purple-600 dark:text-purple-400" />
                                        <span>Información Esencial</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Define el título principal, la síntesis pedagógica y el enlace del curso.
                                    </p>
                                </div>

                                {/* Campo: Título */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="course-title"
                                            className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                                        >
                                            Título del curso <span className="text-purple-600 dark:text-purple-400">*</span>
                                        </label>
                                        <span className="text-[11px] tabular-nums font-mono text-muted-foreground">
                                            {watchedTitle.length}/100
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                            <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-4" />
                                        </div>
                                        <input
                                            id="course-title"
                                            type="text"
                                            disabled={isPending}
                                            maxLength={100}
                                            placeholder="Ej. React 19 y Next.js 16: De Cero a Experto con TypeScript"
                                            aria-invalid={!!errors.title}
                                            className={cn(
                                                'h-12 w-full rounded-xl border bg-background/50 pl-10 pr-4 text-sm font-medium text-foreground transition-all duration-200 outline-none placeholder:text-muted-foreground/50',
                                                'focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500',
                                                'disabled:cursor-not-allowed disabled:opacity-50',
                                                errors.title
                                                    ? 'border-destructive text-destructive focus:border-destructive focus:ring-destructive/20'
                                                    : 'border-border/80 hover:border-foreground/30'
                                            )}
                                            {...register('title')}
                                        />
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {errors.title && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4, height: 0 }}
                                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                exit={{ opacity: 0, y: -4, height: 0 }}
                                                className="flex items-center gap-1.5 text-xs font-medium text-destructive pt-1"
                                            >
                                                <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-3.5" />
                                                <span>{errors.title.message}</span>
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Campo: Descripción */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="course-description"
                                            className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                                        >
                                            Descripción del curso <span className="text-purple-600 dark:text-purple-400">*</span>
                                        </label>
                                        <span className="text-[11px] tabular-nums font-mono text-muted-foreground">
                                            {watchedDesc.length}/100
                                        </span>
                                    </div>
                                    <textarea
                                        id="course-description"
                                        disabled={isPending}
                                        maxLength={100}
                                        rows={3}
                                        placeholder="Describe de forma concisa qué aprenderán los estudiantes en este curso (máximo 100 caracteres)."
                                        aria-invalid={!!errors.description}
                                        className={cn(
                                            'w-full resize-none rounded-xl border bg-background/50 p-3.5 text-sm font-medium text-foreground transition-all duration-200 outline-none placeholder:text-muted-foreground/50',
                                            'focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500',
                                            'disabled:cursor-not-allowed disabled:opacity-50',
                                            errors.description
                                                ? 'border-destructive text-destructive focus:border-destructive focus:ring-destructive/20'
                                                : 'border-border/80 hover:border-foreground/30'
                                        )}
                                        {...register('description')}
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground/80">
                                        <span>Síntesis atractiva para el catálogo (3 a 100 caracteres).</span>
                                        {errors.description && (
                                            <span className="text-destructive font-medium">{errors.description.message}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Campo: URL del Curso / Landing */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="course-url"
                                        className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                                    >
                                        Enlace Externo o Landing <span className="text-xs font-normal lowercase text-muted-foreground">(opcional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                            <HugeiconsIcon icon={Link01Icon} strokeWidth={2} className="size-4" />
                                        </div>
                                        <input
                                            id="course-url"
                                            type="url"
                                            disabled={isPending}
                                            placeholder="https://devtalles.com/cursos/react-avanzado"
                                            className="h-12 w-full rounded-xl border border-border/80 bg-background/50 pl-10 pr-4 text-sm font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground/50 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 hover:border-foreground/30"
                                            {...register('url')}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* SECCIÓN 2: Nivel y Configuración Comercial (Double-Bezel Architecture) */}
                        <div className="rounded-[2.25rem] border border-border/60 bg-muted/20 p-2 sm:p-2.5 ring-1 ring-black/[0.04] dark:border-white/5 dark:bg-zinc-900/40 dark:ring-white/[0.04] shadow-sm">
                            <div className="rounded-[calc(2.25rem-0.625rem)] border border-border/80 bg-card p-6 sm:p-8 dark:border-white/10 dark:bg-zinc-950/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] space-y-6">

                                <div className="border-b border-border/60 pb-4">
                                    <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
                                        <HugeiconsIcon icon={CrownIcon} strokeWidth={2} className="size-4 text-purple-600 dark:text-purple-400" />
                                        <span>Nivel Pedagógico e Instructor</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Determina la complejidad técnica del curso y el docente a cargo.
                                    </p>
                                </div>

                                {/* Selector Interactivo de Nivel (Pills Cards) */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                        Nivel de dificultad <span className="text-purple-600 dark:text-purple-400">*</span>
                                    </label>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {LEVEL_CONFIG.map((lvl) => {
                                            const isSelected = watchedLevel === lvl.value;
                                            const LvlIcon = lvl.icon;
                                            return (
                                                <button
                                                    key={lvl.value}
                                                    type="button"
                                                    onClick={() => setValue('level', lvl.value, { shouldValidate: true })}
                                                    className={cn(
                                                        'group relative flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all duration-300 outline-none select-none active:scale-[0.98]',
                                                        isSelected
                                                            ? cn('bg-gradient-to-br ring-2 shadow-sm', lvl.color, lvl.activeRing)
                                                            : 'border-border/70 bg-background/50 hover:border-foreground/30 hover:bg-muted/40'
                                                    )}
                                                >
                                                    <div className="flex w-full items-center justify-between">
                                                        <div className={cn(
                                                            'flex size-8 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105',
                                                            lvl.badgeBg
                                                        )}>
                                                            <HugeiconsIcon icon={LvlIcon} strokeWidth={2} className="size-4" />
                                                        </div>
                                                        {isSelected && (
                                                            <div className="size-2 rounded-full bg-purple-600 dark:bg-purple-400 shadow-sm" />
                                                        )}
                                                    </div>

                                                    <div className="mt-3">
                                                        <span className="block text-sm font-bold text-foreground">
                                                            {lvl.label}
                                                        </span>
                                                        <span className="mt-1 block text-[11px] text-muted-foreground leading-snug">
                                                            {lvl.description}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Instructor / Docente (opcional, string) */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="course-instructor"
                                        className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                                    >
                                        Instructor <span className="text-xs font-normal lowercase text-muted-foreground">(opcional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                            <HugeiconsIcon icon={User02Icon} strokeWidth={2} className="size-4" />
                                        </div>
                                        <input
                                            id="course-instructor"
                                            type="text"
                                            disabled={isPending}
                                            placeholder="Ej. Fernando Herrera o ID de docente"
                                            className="h-12 w-full rounded-xl border border-border/80 bg-background/50 pl-10 pr-4 text-sm font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground/50 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 hover:border-foreground/30"
                                            {...register('instructor', {
                                                setValueAs: (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v?.trim()),
                                            })}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground/80">Nombre, usuario o ID del docente a cargo.</p>
                                </div>

                            </div>
                        </div>

                        {/* SECCIÓN 3: Taxonomías y Prerrequisitos (Selección Múltiple con MultipleSelector) */}
                        <div className="rounded-[2.25rem] border border-border/60 bg-muted/20 p-2 sm:p-2.5 ring-1 ring-black/[0.04] dark:border-white/5 dark:bg-zinc-900/40 dark:ring-white/[0.04] shadow-sm">
                            <div className="rounded-[calc(2.25rem-0.625rem)] border border-border/80 bg-card p-6 sm:p-8 dark:border-white/10 dark:bg-zinc-950/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] space-y-6">

                                <div className="border-b border-border/60 pb-4">
                                    <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
                                        <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} className="size-4 text-purple-600 dark:text-purple-400" />
                                        <span>Taxonomías y Prerrequisitos</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Asigna categorías, tecnologías clave y materias previas requeridas mediante selección múltiple.
                                    </p>
                                </div>

                                {/* Multiselect: Categorías */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                            Categorías temáticas
                                        </label>
                                        <span className="text-[11px] font-mono text-muted-foreground">
                                            {watchedCatIds.length} seleccionadas
                                        </span>
                                    </div>
                                    <Controller
                                        control={control}
                                        name="categoryIds"
                                        render={({ field }) => {
                                            const selectedOptions = categoryOptions.filter(opt =>
                                                field.value?.includes(Number(opt.value))
                                            );
                                            return (
                                                <MultipleSelector
                                                    options={categoryOptions}
                                                    value={selectedOptions}
                                                    onChange={(options: Option[]) => {
                                                        field.onChange(options.map(o => Number(o.value)));
                                                    }}
                                                    placeholder="Buscar y seleccionar categorías..."
                                                    emptyIndicator={
                                                        <p className="text-center text-xs text-muted-foreground py-2">
                                                            No se encontraron categorías disponibles
                                                        </p>
                                                    }
                                                    className="w-full rounded-xl border-border/80 bg-background/50 hover:border-purple-500/50 transition-colors"
                                                    badgeClassName="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                                                />
                                            );
                                        }}
                                    />
                                    <p className="text-[11px] text-muted-foreground/80">
                                        Clasifica el curso en una o varias áreas de conocimiento para el buscador.
                                    </p>
                                </div>

                                {/* Multiselect: Tecnologías */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                            Tecnologías y Herramientas
                                        </label>
                                        <span className="text-[11px] font-mono text-muted-foreground">
                                            {watchedTechIds.length} seleccionadas
                                        </span>
                                    </div>
                                    <Controller
                                        control={control}
                                        name="technologyIds"
                                        render={({ field }) => {
                                            const selectedOptions = technologyOptions.filter(opt =>
                                                field.value?.includes(Number(opt.value))
                                            );
                                            return (
                                                <MultipleSelector
                                                    options={technologyOptions}
                                                    value={selectedOptions}
                                                    onChange={(options: Option[]) => {
                                                        field.onChange(options.map(o => Number(o.value)));
                                                    }}
                                                    placeholder="Buscar y seleccionar tecnologías (ej. React, Next.js, Node)..."
                                                    emptyIndicator={
                                                        <p className="text-center text-xs text-muted-foreground py-2">
                                                            No se encontraron tecnologías disponibles
                                                        </p>
                                                    }
                                                    className="w-full rounded-xl border-border/80 bg-background/50 hover:border-purple-500/50 transition-colors"
                                                    badgeClassName="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20"
                                                />
                                            );
                                        }}
                                    />
                                    <p className="text-[11px] text-muted-foreground/80">
                                        Stacks, lenguajes o librerías que dominará el estudiante al completar el contenido.
                                    </p>
                                </div>

                                {/* Multiselect: Prerrequisitos (CON EXCLUSIÓN DEL MISMO CURSO) */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                            Prerrequisitos Académicos (Cursos Previos)
                                        </label>
                                        <span className="text-[11px] font-mono text-muted-foreground">
                                            {watchedPrereqIds.length} asignados
                                        </span>
                                    </div>

                                    {/* Callout de integridad pedagógica */}
                                    <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                                        <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4 shrink-0" />
                                        <span>
                                            <strong>Regla de integridad:</strong> Un curso no puede tenerse a sí mismo como requisito. Este curso se encuentra excluido automáticamente de las opciones disponibles.
                                        </span>
                                    </div>

                                    <Controller
                                        control={control}
                                        name="prerequisiteIds"
                                        render={({ field }) => {
                                            const selectedOptions = availablePrerequisiteOptions.filter(opt =>
                                                field.value?.includes(Number(opt.value))
                                            );
                                            return (
                                                <MultipleSelector
                                                    options={availablePrerequisiteOptions}
                                                    value={selectedOptions}
                                                    onChange={(options: Option[]) => {
                                                        field.onChange(options.map(o => Number(o.value)));
                                                    }}
                                                    placeholder="Selecciona los cursos que deben completarse previamente..."
                                                    emptyIndicator={
                                                        <p className="text-center text-xs text-muted-foreground py-2">
                                                            No hay cursos disponibles para seleccionar
                                                        </p>
                                                    }
                                                    className="w-full rounded-xl border-border/80 bg-background/50 hover:border-purple-500/50 transition-colors"
                                                    badgeClassName="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                                                />
                                            );
                                        }}
                                    />
                                    {errors.prerequisiteIds && (
                                        <p className="text-xs font-medium text-destructive pt-0.5">
                                            {errors.prerequisiteIds.message}
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* SECCIÓN 4: Multimedia e Imagen de Portada (Double-Bezel Architecture) */}
                        <div className="rounded-[2.25rem] border border-border/60 bg-muted/20 p-2 sm:p-2.5 ring-1 ring-black/[0.04] dark:border-white/5 dark:bg-zinc-900/40 dark:ring-white/[0.04] shadow-sm">
                            <div className="rounded-[calc(2.25rem-0.625rem)] border border-border/80 bg-card p-6 sm:p-8 dark:border-white/10 dark:bg-zinc-950/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] space-y-6">

                                <div className="border-b border-border/60 pb-4">
                                    <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
                                        <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="size-4 text-purple-600 dark:text-purple-400" />
                                        <span>Multimedia y Portada</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Proporciona la URL de la portada oficial del curso (relación de aspecto recomendada 16:9).
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="course-imageUrl"
                                        className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                                    >
                                        URL de la Imagen <span className="text-xs font-normal lowercase text-muted-foreground">(opcional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                            <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="size-4" />
                                        </div>
                                        <input
                                            id="course-imageUrl"
                                            type="url"
                                            disabled={isPending}
                                            placeholder="https://images.unsplash.com/photo-example... o URL de CDN"
                                            className="h-12 w-full rounded-xl border border-border/80 bg-background/50 pl-10 pr-4 text-sm font-medium text-foreground transition-all outline-none placeholder:text-muted-foreground/50 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 hover:border-foreground/30"
                                            {...register('imageUrl', {
                                                onChange: () => setImageLoadError(false),
                                            })}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground/80">
                                        Se mostrará como carátula destacada en el listado y la página de detalle del curso.
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* ACCIONES Y BOTONES (Estilo estricto FormNewCategoria) */}
                        <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:items-center sm:justify-end">
                            <Link
                                href="/admin/cursos"
                                className={cn(
                                    'inline-flex h-11 items-center justify-center rounded-xl border border-border/80 bg-background/50 px-5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-border active:scale-[0.98]',
                                    isPending && 'pointer-events-none opacity-50'
                                )}
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                disabled={isPending}
                                className={cn(
                                    'group relative inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-all outline-none select-none active:scale-[0.98]',
                                    'bg-purple-600 text-white shadow-sm hover:bg-purple-700 hover:shadow-purple-500/25 dark:bg-purple-600 dark:hover:bg-purple-500',
                                    'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-purple-600'
                                )}
                            >
                                {isPending ? (
                                    <>
                                        <HugeiconsIcon
                                            icon={Loading03Icon}
                                            strokeWidth={2}
                                            className="size-4 animate-spin text-white"
                                        />
                                        <span>Guardando curso...</span>
                                    </>
                                ) : (
                                    <>
                                        <HugeiconsIcon
                                            icon={CheckmarkCircle02Icon}
                                            strokeWidth={2}
                                            className="size-4 transition-transform group-hover:scale-110"
                                        />
                                        <span>Publicar nuevo curso</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </div>

                    {/* COLUMNA DERECHA: Tarjeta de Previsualización en Tiempo Real (Sticky 4 Cols) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-4">

                        {/* Indicador de Estado y Progreso */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                                    Vista Previa
                                </span>
                            </div>
                            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                                {completenessScore}% completo
                            </span>
                        </div>

                        {/* Barra de progreso sutil */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${completenessScore}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Tarjeta del Curso (Preview Card con estética High-End) */}
                        <div className="rounded-[2rem] border border-border/80 bg-card overflow-hidden shadow-xl dark:border-white/10 dark:bg-zinc-950/90 transition-all duration-300">

                            {/* Banner / Portada */}
                            <div className="relative aspect-video w-full overflow-hidden bg-muted/50 border-b border-border/60">
                                {watchedImageUrl && !imageLoadError ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={watchedImageUrl}
                                        alt={watchedTitle || 'Portada del curso'}
                                        onError={() => setImageLoadError(true)}
                                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-900/20 via-zinc-900/40 to-background p-4 text-center">
                                        <div className="flex size-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-500">
                                            <HugeiconsIcon icon={Book02Icon} strokeWidth={1.8} className="size-5" />
                                        </div>
                                        <span className="text-[11px] font-medium text-muted-foreground">
                                            {watchedImageUrl ? 'No se pudo cargar la imagen' : 'Sin imagen de portada'}
                                        </span>
                                    </div>
                                )}

                                {/* Badge de Nivel flotante */}
                                <div className="absolute top-3 left-3">
                                    {LEVEL_CONFIG.filter(l => l.value === watchedLevel).map(l => (
                                        <span
                                            key={l.value}
                                            className={cn(
                                                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm',
                                                l.badgeBg
                                            )}
                                        >
                                            {l.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Contenido de la Tarjeta */}
                            <div className="p-5 space-y-3.5">
                                <div>
                                    <h3 className="line-clamp-2 text-base font-bold text-foreground leading-snug">
                                        {watchedTitle.trim() || 'Título del curso aquí...'}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                                        {watchedDesc.trim() || 'La descripción del curso se visualizará en este espacio para los estudiantes.'}
                                    </p>
                                </div>

                                {/* Metadata Rápida: Instructor y Requisitos */}
                                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                                    {watchedInstructor ? (
                                        <span className="inline-flex items-center gap-1">
                                            <HugeiconsIcon icon={User02Icon} strokeWidth={2} className="size-3.5 text-indigo-500" />
                                            <span className="truncate max-w-[120px]">{watchedInstructor}</span>
                                        </span>
                                    ) : null}

                                    {watchedPrereqIds.length > 0 && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                                            {watchedPrereqIds.length} {watchedPrereqIds.length === 1 ? 'prerrequisito' : 'prerrequisitos'}
                                        </span>
                                    )}
                                </div>

                                {/* Categorías seleccionadas */}
                                {watchedCatIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                        {watchedCatIds.slice(0, 3).map(id => {
                                            const cat = initialCategories.find(c => Number(c.id) === id);
                                            if (!cat) return null;
                                            return (
                                                <span
                                                    key={id}
                                                    className="inline-flex items-center rounded-md border border-purple-500/20 bg-purple-500/5 px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400"
                                                >
                                                    {cat.name}
                                                </span>
                                            );
                                        })}
                                        {watchedCatIds.length > 3 && (
                                            <span className="text-[10px] text-muted-foreground self-center">
                                                +{watchedCatIds.length - 3} más
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Tecnologías seleccionadas */}
                                {watchedTechIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {watchedTechIds.slice(0, 4).map(id => {
                                            const tech = initialTechnologies.find(t => Number(t.id) === id);
                                            if (!tech) return null;
                                            return (
                                                <span
                                                    key={id}
                                                    className="inline-flex items-center rounded-md border border-indigo-500/20 bg-indigo-500/5 px-2 py-0.5 text-[10px] font-mono text-indigo-600 dark:text-indigo-400"
                                                >
                                                    {tech.name}
                                                </span>
                                            );
                                        })}
                                        {watchedTechIds.length > 4 && (
                                            <span className="text-[10px] text-muted-foreground self-center">
                                                +{watchedTechIds.length - 4} más
                                            </span>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Tarjeta de Resumen Informativo */}
                        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-xs text-muted-foreground space-y-2">
                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5 text-purple-500" />
                                <span>Garantía de Calidad Devtalles</span>
                            </div>
                            <p className="leading-relaxed text-[11px]">
                                Al publicar, el curso quedará indexado para los estudiantes con su ruta de aprendizaje, prerrequisitos enlazados y métricas de progreso.
                            </p>
                        </div>

                    </div>

                </div>
            </form>
        </div>
    );
}