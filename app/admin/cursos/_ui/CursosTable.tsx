'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type RowSelectionState,
    type FilterFn,
} from '@tanstack/react-table';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Search01Icon,
    PlusSignIcon,
    PencilEdit02Icon,
    ArrowUpDownIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Cancel01Icon,
    BookOpen01Icon,
    CheckmarkCircle02Icon,
    FileEditIcon,
    Archive02Icon,
    Layers01Icon,
    Alert02Icon,
} from '@hugeicons/core-free-icons';

import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import type { CourseLevel, CourseStatus } from '@/types/curso-schema';
import { publishCursoAction } from '@/server/actions/cursos/publish-curso-action';
import { draftCursoAction } from '@/server/actions/cursos/draft-curso-action';
import { archiveCursoAction } from '@/server/actions/cursos/archive-curso-action';
import StatusBadge from './StatusBadge';
import LevelFilterStrip from './LevelFilterStrip';
import {
    LEVEL_LABELS,
    formatDuration,
    normalizeCursoItem,
    type CursoItem,
} from './curso-helpers';

function columnLayoutClass(columnId: string) {
    switch (columnId) {
        case 'select':
            return 'w-[5%] 2xl:w-[4%]';
        case 'title':
            return 'w-[25%] max-w-0 overflow-hidden 2xl:w-[22%]';
        case 'instructor':
            return 'w-[14%] max-w-0 overflow-hidden 2xl:w-[13%]';
        case 'level':
            return 'w-[11%] 2xl:w-[10%]';
        case 'duration':
            return 'hidden 2xl:table-cell 2xl:w-[8%]';
        case 'status':
            return 'w-[11%] 2xl:w-[10%]';
        case 'categories':
            return 'w-[14%] whitespace-normal 2xl:w-[13%]';
        case 'actions':
            return 'w-[20%] whitespace-normal 2xl:w-[20%]';
        default:
            return undefined;
    }
}

const globalSearchFilter: FilterFn<CursoItem> = (row, _columnId, filterValue) => {
    const q = String(filterValue ?? '')
        .toLowerCase()
        .trim();
    if (!q) return true;
    const course = row.original;
    const haystack = [
        course.title,
        course.instructor ?? '',
        course.level ? LEVEL_LABELS[course.level] : '',
        ...course.categories.map((c) => c.name),
    ]
        .join(' ')
        .toLowerCase();
    return haystack.includes(q);
};

interface CursosTableProps {
    initialCourses: CursoItem[];
    errorMessage?: string;
}

export default function CursosTable({
    initialCourses,
    errorMessage,
}: CursosTableProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [courses, setCourses] = useState<CursoItem[]>(initialCourses);
    const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>('all');
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'title', desc: false },
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        setCourses(initialCourses);
    }, [initialCourses]);

    useEffect(() => {
        if (errorMessage) {
            toast.add({
                title: 'Error al cargar cursos',
                description: errorMessage,
                type: 'error',
            });
        }
    }, [errorMessage]);

    const runStatusAction = (
        course: CursoItem,
        next: CourseStatus,
        action: (id: number) => Promise<{
            ok: boolean;
            msg: string;
            data?: CursoItem;
        }>
    ) => {
        const labels: Record<CourseStatus, string> = {
            published: 'Publicar',
            draft: 'Pasar a borrador',
            archived: 'Archivar',
        };
        startTransition(async () => {
            const result = await action(course.id);
            if (!result.ok) {
                toast.add({
                    title: `Error al ${labels[next].toLowerCase()}`,
                    description: result.msg,
                    type: 'error',
                });
                return;
            }
            if (result.data) {
                const updated = normalizeCursoItem(result.data);
                setCourses((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c))
                );
            }
            toast.add({
                title: labels[next],
                description: result.msg || `"${course.title}" actualizado.`,
                type: 'success',
            });
            router.refresh();
        });
    };

    const levelCounts = useMemo(() => {
        const counts: Record<CourseLevel | 'all', number> = {
            all: courses.length,
            beginner: 0,
            intermediate: 0,
            advanced: 0,
        };
        for (const c of courses) {
            if (c.level) counts[c.level] += 1;
        }
        return counts;
    }, [courses]);

    const filteredByLevel = useMemo(() => {
        if (levelFilter === 'all') return courses;
        return courses.filter((c) => c.level === levelFilter);
    }, [courses, levelFilter]);

    const columns = useMemo<ColumnDef<CursoItem>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center justify-center pl-2">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(value) =>
                                table.toggleAllPageRowsSelected(!!value)
                            }
                            aria-label="Seleccionar todos los cursos visibles"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center pl-2">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label={`Seleccionar curso ${row.original.title}`}
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 44,
            },
            {
                accessorKey: 'title',
                header: ({ column }) => {
                    const isSorted = column.getIsSorted();
                    return (
                        <button
                            type="button"
                            onClick={() =>
                                column.toggleSorting(column.getIsSorted() === 'asc')
                            }
                            className="group -ml-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-[0.98]"
                        >
                            <span>Título</span>
                            <HugeiconsIcon
                                icon={ArrowUpDownIcon}
                                strokeWidth={2}
                                className={cn(
                                    'size-3.5 transition-colors',
                                    isSorted
                                        ? 'text-purple-600 dark:text-purple-400'
                                        : 'text-muted-foreground/60 group-hover:text-foreground'
                                )}
                            />
                        </button>
                    );
                },
                cell: ({ row }) => (
                    <div className="flex items-center gap-3.5 py-1.5">
                        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-500/15 via-purple-600/10 to-fuchsia-500/10 text-purple-600 shadow-xs dark:text-purple-400">
                            <HugeiconsIcon
                                icon={BookOpen01Icon}
                                strokeWidth={2}
                                className="size-4.5"
                            />
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                                {row.original.title}
                            </span>
                            <span className="truncate text-[11px] text-muted-foreground/75">
                                ID {row.original.id}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'instructor',
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Instructor
                    </div>
                ),
                cell: ({ row }) => (
                    <span className="block truncate text-sm text-foreground/90">
                        {row.original.instructor ?? '—'}
                    </span>
                ),
            },
            {
                accessorKey: 'level',
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Nivel
                    </div>
                ),
                cell: ({ row }) => {
                    const level = row.original.level;
                    if (!level) {
                        return (
                            <span className="text-xs text-muted-foreground">—</span>
                        );
                    }
                    return (
                        <span className="inline-flex rounded-lg border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground">
                            {LEVEL_LABELS[level]}
                        </span>
                    );
                },
            },
            {
                id: 'duration',
                accessorFn: (row) => row.durationMinutes ?? 0,
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Duración
                    </div>
                ),
                cell: ({ row }) => (
                    <span className="text-sm tabular-nums text-muted-foreground">
                        {formatDuration(row.original.durationMinutes)}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Estado
                    </div>
                ),
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                id: 'categories',
                accessorFn: (row) =>
                    row.categories.map((c) => c.name).join(', '),
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Categorías
                    </div>
                ),
                cell: ({ row }) => {
                    const cats = row.original.categories;
                    if (cats.length === 0) {
                        return (
                            <span className="text-xs text-muted-foreground">—</span>
                        );
                    }
                    return (
                        <div className="flex flex-wrap gap-1">
                            {cats.map((cat) => (
                                <span
                                    key={cat.id}
                                    className="rounded-md border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300"
                                >
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                header: () => (
                    <div className="pr-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Acciones
                    </div>
                ),
                cell: ({ row }) => {
                    const course = row.original;
                    return (
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <Link
                                href={`/admin/cursos/new?id=${course.id}`}
                                className="group inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.97] dark:hover:text-purple-400"
                                title="Editar este curso"
                            >
                                <HugeiconsIcon
                                    icon={PencilEdit02Icon}
                                    strokeWidth={2}
                                    className="size-3.5"
                                />
                                <span className="max-2xl:sr-only">Editar</span>
                            </Link>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                    runStatusAction(
                                        course,
                                        'published',
                                        publishCursoAction
                                    )
                                }
                                className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-500/15 active:scale-[0.97] disabled:opacity-50 dark:text-emerald-400"
                                title="Publicar"
                            >
                                <HugeiconsIcon
                                    icon={CheckmarkCircle02Icon}
                                    strokeWidth={2}
                                    className="size-3.5"
                                />
                                <span className="max-2xl:sr-only">Publicar</span>
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                    runStatusAction(
                                        course,
                                        'draft',
                                        draftCursoAction
                                    )
                                }
                                className="inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/5 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-all hover:bg-amber-500/15 active:scale-[0.97] disabled:opacity-50 dark:text-amber-400"
                                title="Pasar a borrador"
                            >
                                <HugeiconsIcon
                                    icon={FileEditIcon}
                                    strokeWidth={2}
                                    className="size-3.5"
                                />
                                <span className="max-2xl:sr-only">Borrador</span>
                            </button>
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={() =>
                                    runStatusAction(
                                        course,
                                        'archived',
                                        archiveCursoAction
                                    )
                                }
                                className="inline-flex items-center gap-1 rounded-xl border border-zinc-500/30 bg-zinc-500/5 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-500/15 active:scale-[0.97] disabled:opacity-50 dark:text-zinc-400"
                                title="Archivar"
                            >
                                <HugeiconsIcon
                                    icon={Archive02Icon}
                                    strokeWidth={2}
                                    className="size-3.5"
                                />
                                <span className="max-2xl:sr-only">Archivar</span>
                            </button>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [isPending]
    );

    const table = useReactTable({
        data: filteredByLevel,
        columns,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            pagination,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: globalSearchFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableSortingRemoval: false,
    });

    const selectedCount = Object.keys(rowSelection).filter(
        (key) => rowSelection[key]
    ).length;

    const handleLevelChange = (level: CourseLevel | 'all') => {
        setLevelFilter(level);
        setPagination((p) => ({ ...p, pageIndex: 0 }));
    };

    const emptyState = (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-border/80 bg-muted/40 text-muted-foreground">
                <HugeiconsIcon
                    icon={BookOpen01Icon}
                    strokeWidth={1.5}
                    className="size-7"
                />
            </div>
            <div className="space-y-1 text-center">
                <h3 className="text-base font-semibold text-foreground">
                    {globalFilter || levelFilter !== 'all'
                        ? 'No se encontraron resultados'
                        : 'No hay cursos registrados'}
                </h3>
                <p className="max-w-sm text-xs text-muted-foreground">
                    {globalFilter
                        ? `Ningún curso coincide con "${globalFilter}".`
                        : levelFilter !== 'all'
                          ? `No hay cursos con nivel ${LEVEL_LABELS[levelFilter]}.`
                          : 'Comienza creando el primer curso del catálogo.'}
                </p>
            </div>
            {globalFilter || levelFilter !== 'all' ? (
                <button
                    type="button"
                    onClick={() => {
                        setGlobalFilter('');
                        setLevelFilter('all');
                    }}
                    className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border/70 bg-background/80 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
                >
                    <HugeiconsIcon
                        icon={Cancel01Icon}
                        strokeWidth={2}
                        className="size-3.5"
                    />
                    <span>Limpiar filtros</span>
                </button>
            ) : (
                <Link
                    href="/admin/cursos/new"
                    className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-[0.98]"
                >
                    <HugeiconsIcon
                        icon={PlusSignIcon}
                        strokeWidth={2}
                        className="size-3.5"
                    />
                    <span>Crear primer curso</span>
                </Link>
            )}
        </div>
    );

    return (
        <div
            data-lenis-prevent
            className="mx-auto h-[calc(100dvh-7.5rem)] min-h-0 w-full min-w-0 max-w-7xl space-y-8 overflow-y-auto overscroll-y-contain py-2 sm:py-6"
        >
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="relative flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
            >
                <div className="min-w-0 space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Cursos
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Administra el catálogo formativo de Devtalles. Consulta,
                        filtra y edita cursos por nivel, estado y categoría.
                    </p>
                </div>

                <div className="flex w-full shrink-0 items-center gap-3 lg:w-auto">
                    <Link
                        href="/admin/cursos/new"
                        className="group relative inline-flex w-full items-center justify-between gap-3.5 rounded-full bg-purple-600 py-2.5 pr-2.5 pl-6 text-sm font-semibold text-white shadow-xl shadow-purple-600/25 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-purple-500 hover:shadow-purple-500/40 active:scale-[0.98] lg:w-auto"
                    >
                        <span>Nuevo curso</span>
                        <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:translate-x-0.5">
                            <HugeiconsIcon
                                icon={PlusSignIcon}
                                strokeWidth={2.5}
                                className="size-3.5"
                            />
                        </span>
                    </Link>
                </div>
            </motion.div>

            {errorMessage && (
                <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <HugeiconsIcon
                        icon={Alert02Icon}
                        strokeWidth={2}
                        className="mt-0.5 size-4 shrink-0"
                    />
                    <p>{errorMessage}</p>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
                className="relative min-w-0 rounded-[2rem] bg-black/[0.02] p-1.5 shadow-2xl shadow-purple-950/5 ring-1 ring-black/[0.06] sm:p-2.5 dark:bg-white/[0.02] dark:ring-white/10"
            >
                <div className="relative flex min-w-0 flex-col overflow-hidden rounded-[calc(2rem-0.625rem)] border border-border/60 bg-card/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/80">
                    <div className="flex min-w-0 flex-col gap-4 border-b border-border/50 p-4 sm:px-6 sm:py-5">
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="relative min-w-0 flex-1 sm:max-w-md">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/70">
                                    <HugeiconsIcon
                                        icon={Search01Icon}
                                        strokeWidth={2}
                                        className="size-4"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={globalFilter}
                                    onChange={(e) => {
                                        setGlobalFilter(e.target.value);
                                        setPagination((p) => ({
                                            ...p,
                                            pageIndex: 0,
                                        }));
                                    }}
                                    placeholder="Buscar por título, instructor o categoría..."
                                    className="h-10 w-full min-w-0 rounded-xl border border-border/70 bg-background/50 pr-9 pl-10 text-xs font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 hover:border-foreground/30 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500"
                                />
                                {globalFilter && (
                                    <button
                                        type="button"
                                        onClick={() => setGlobalFilter('')}
                                        title="Limpiar búsqueda"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <HugeiconsIcon
                                            icon={Cancel01Icon}
                                            strokeWidth={2}
                                            className="size-4"
                                        />
                                    </button>
                                )}
                            </div>

                            <div className="inline-flex h-10 w-fit shrink-0 items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 text-xs font-semibold text-muted-foreground">
                                <HugeiconsIcon
                                    icon={Layers01Icon}
                                    strokeWidth={2}
                                    className="size-3.5 text-purple-600 dark:text-purple-400"
                                />
                                <span>
                                    {table.getFilteredRowModel().rows.length} cursos
                                </span>
                            </div>
                        </div>

                        <LevelFilterStrip
                            value={levelFilter}
                            onChange={handleLevelChange}
                            counts={levelCounts}
                        />
                    </div>

                    <AnimatePresence>
                        {selectedCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-2 border-b border-purple-500/20 bg-purple-500/10 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                            >
                                <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300">
                                    <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                                        {selectedCount}
                                    </span>
                                    <span>curso(s) seleccionado(s)</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => table.resetRowSelection()}
                                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                                >
                                    Deseleccionar
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="xl:hidden">
                        {table.getRowModel().rows?.length ? (
                            <div className="space-y-3 p-4">
                                <div className="flex items-center gap-2 px-0.5 pb-1">
                                    <Checkbox
                                        checked={table.getIsAllPageRowsSelected()}
                                        onCheckedChange={(value) =>
                                            table.toggleAllPageRowsSelected(!!value)
                                        }
                                        aria-label="Seleccionar todos los cursos visibles"
                                    />
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Seleccionar página
                                    </span>
                                </div>
                                {table.getRowModel().rows.map((row) => {
                                    const course = row.original;
                                    return (
                                        <div
                                            key={row.id}
                                            className={cn(
                                                'rounded-2xl border border-border/60 bg-background/40 p-4 transition-colors',
                                                row.getIsSelected() &&
                                                    'border-purple-500/40 bg-purple-500/10'
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="pt-1">
                                                    <Checkbox
                                                        checked={row.getIsSelected()}
                                                        onCheckedChange={(value) =>
                                                            row.toggleSelected(!!value)
                                                        }
                                                        aria-label={`Seleccionar curso ${course.title}`}
                                                    />
                                                </div>
                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                    <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-500/15 via-purple-600/10 to-fuchsia-500/10 text-purple-600 shadow-xs dark:text-purple-400">
                                                        <HugeiconsIcon
                                                            icon={BookOpen01Icon}
                                                            strokeWidth={2}
                                                            className="size-4.5"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1 space-y-1">
                                                        <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                                                            {course.title}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground/75">
                                                            ID {course.id}
                                                            {course.instructor
                                                                ? ` · ${course.instructor}`
                                                                : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-2 pl-8">
                                                {course.level ? (
                                                    <span className="inline-flex rounded-lg border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground">
                                                        {LEVEL_LABELS[course.level]}
                                                    </span>
                                                ) : null}
                                                <StatusBadge status={course.status} />
                                                {course.categories.map((cat) => (
                                                    <span
                                                        key={cat.id}
                                                        className="rounded-md border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:text-purple-300"
                                                    >
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-8">
                                                <Link
                                                    href={`/admin/cursos/new?id=${course.id}`}
                                                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs font-medium text-foreground transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.97] dark:hover:text-purple-400"
                                                    title="Editar este curso"
                                                >
                                                    <HugeiconsIcon
                                                        icon={PencilEdit02Icon}
                                                        strokeWidth={2}
                                                        className="size-3.5"
                                                    />
                                                    <span>Editar</span>
                                                </Link>
                                                <button
                                                    type="button"
                                                    disabled={isPending}
                                                    onClick={() =>
                                                        runStatusAction(
                                                            course,
                                                            'published',
                                                            publishCursoAction
                                                        )
                                                    }
                                                    className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-500/15 active:scale-[0.97] disabled:opacity-50 dark:text-emerald-400"
                                                    title="Publicar"
                                                >
                                                    <HugeiconsIcon
                                                        icon={CheckmarkCircle02Icon}
                                                        strokeWidth={2}
                                                        className="size-3.5"
                                                    />
                                                    <span>Publicar</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isPending}
                                                    onClick={() =>
                                                        runStatusAction(
                                                            course,
                                                            'draft',
                                                            draftCursoAction
                                                        )
                                                    }
                                                    className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs font-medium text-amber-700 transition-all hover:bg-amber-500/15 active:scale-[0.97] disabled:opacity-50 dark:text-amber-400"
                                                    title="Pasar a borrador"
                                                >
                                                    <HugeiconsIcon
                                                        icon={FileEditIcon}
                                                        strokeWidth={2}
                                                        className="size-3.5"
                                                    />
                                                    <span>Borrador</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isPending}
                                                    onClick={() =>
                                                        runStatusAction(
                                                            course,
                                                            'archived',
                                                            archiveCursoAction
                                                        )
                                                    }
                                                    className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-zinc-500/30 bg-zinc-500/5 px-3 py-2 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-500/15 active:scale-[0.97] disabled:opacity-50 dark:text-zinc-400"
                                                    title="Archivar"
                                                >
                                                    <HugeiconsIcon
                                                        icon={Archive02Icon}
                                                        strokeWidth={2}
                                                        className="size-3.5"
                                                    />
                                                    <span>Archivar</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="px-4 py-6">{emptyState}</div>
                        )}
                    </div>

                    <div className="relative hidden w-full min-w-0 overflow-x-auto xl:block">
                        <Table className="w-full table-fixed">
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow
                                        key={headerGroup.id}
                                        className="border-b border-border/50 bg-muted/30 hover:bg-muted/30"
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className={cn(
                                                    'h-11 px-3 text-xs select-none',
                                                    columnLayoutClass(header.column.id)
                                                )}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef
                                                              .header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() && 'selected'
                                            }
                                            className={cn(
                                                'group border-b border-border/40 transition-colors duration-150',
                                                'hover:bg-purple-500/[0.03] dark:hover:bg-purple-500/[0.05]',
                                                row.getIsSelected() &&
                                                    'bg-purple-500/10 hover:bg-purple-500/15'
                                            )}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        'px-3 py-3 text-sm',
                                                        columnLayoutClass(cell.column.id)
                                                    )}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-64 text-center"
                                        >
                                            {emptyState}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 px-4 py-3.5 sm:flex-row sm:px-6">
                        <div className="text-center text-xs text-muted-foreground sm:text-left">
                            {table.getFilteredRowModel().rows.length > 0 ? (
                                <>
                                    Mostrando{' '}
                                    <span className="font-semibold text-foreground">
                                        {pagination.pageIndex * pagination.pageSize +
                                            1}
                                    </span>{' '}
                                    a{' '}
                                    <span className="font-semibold text-foreground">
                                        {Math.min(
                                            (pagination.pageIndex + 1) *
                                                pagination.pageSize,
                                            table.getFilteredRowModel().rows.length
                                        )}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-semibold text-foreground">
                                        {table.getFilteredRowModel().rows.length}
                                    </span>{' '}
                                    cursos
                                </>
                            ) : (
                                '0 cursos'
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="inline-flex size-11 items-center justify-center rounded-lg border border-border/70 bg-background/50 text-foreground transition-all hover:bg-muted active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 sm:size-8"
                                title="Página anterior"
                            >
                                <HugeiconsIcon
                                    icon={ArrowLeft01Icon}
                                    strokeWidth={2}
                                    className="size-4"
                                />
                            </button>

                            <div className="px-2 text-xs font-medium text-muted-foreground">
                                Página{' '}
                                <span className="font-semibold text-foreground">
                                    {table.getPageCount() === 0
                                        ? 0
                                        : pagination.pageIndex + 1}
                                </span>{' '}
                                de{' '}
                                <span className="font-semibold text-foreground">
                                    {table.getPageCount() || 1}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="inline-flex size-11 items-center justify-center rounded-lg border border-border/70 bg-background/50 text-foreground transition-all hover:bg-muted active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 sm:size-8"
                                title="Página siguiente"
                            >
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    strokeWidth={2}
                                    className="size-4"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
