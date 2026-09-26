'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
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
} from '@tanstack/react-table';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Route01Icon,
    Search01Icon,
    Sparkles,
    PlusSignIcon,
    PencilEdit02Icon,
    ArrowUpDownIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Cancel01Icon,
    Layers01Icon,
    Folder01Icon,
    Alert02Icon,
} from '@hugeicons/core-free-icons';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
    ROADMAP_SCOPE_LABELS,
    type RoadmapView,
} from '@/types/roadmap-schema';
import AddToMyRoadmapsButton from './AddToMyRoadmapsButton';

interface RoadmapsTableProps {
    initialRoadmaps: RoadmapView[];
    errorMessage?: string;
    title?: string;
    description?: string;
    detailBasePath?: string;
    createHref?: string | null;
    /** Sends the student to questionnaires so AI builds a personal route. */
    personalizeHref?: string | null;
    /** When set, each global row can be copied into the student's personal list. */
    saveToMine?: {
        mineBasePath: string;
        savedByGlobalId: Record<number, number>;
    };
}

export default function RoadmapsTable({
    initialRoadmaps,
    errorMessage,
    title = 'Roadmaps',
    description = 'Roadmaps globales del catálogo. Cada alumno guarda el suyo como personal; aquí ves los que aplican a todos.',
    detailBasePath = '/admin/roadmaps',
    createHref = '/admin/roadmaps/new',
    personalizeHref = null,
    saveToMine,
}: RoadmapsTableProps) {
    const [roadmaps, setRoadmaps] = useState<RoadmapView[]>(initialRoadmaps);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'title', desc: false }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        setRoadmaps(initialRoadmaps);
    }, [initialRoadmaps]);

    const columns = useMemo<ColumnDef<RoadmapView>[]>(
        () => [
            {
                accessorKey: 'title',
                header: ({ column }) => {
                    const isSorted = column.getIsSorted();
                    return (
                        <button
                            type="button"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
                            <HugeiconsIcon icon={Route01Icon} strokeWidth={2} className="size-4.5" />
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <Link
                                href={`${detailBasePath}/${row.original.id}`}
                                className="truncate text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-purple-600 dark:hover:text-purple-400"
                            >
                                {row.original.title}
                            </Link>
                            <span className="text-[11px] font-mono text-muted-foreground/75">
                                #{row.original.id}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'scope',
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Alcance
                    </div>
                ),
                cell: ({ row }) => {
                    const global = row.original.scope === 'global';
                    return (
                        <span
                            className={cn(
                                'inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold',
                                global
                                    ? 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                                    : 'border-border/60 bg-muted/40 text-foreground'
                            )}
                        >
                            {ROADMAP_SCOPE_LABELS[row.original.scope] ?? row.original.scope}
                        </span>
                    );
                },
            },
            {
                id: 'courseCount',
                accessorFn: (row) => row.courses.length,
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Cursos
                    </div>
                ),
                cell: ({ row }) => (
                    <span className="inline-flex items-center rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-semibold tabular-nums text-foreground">
                        {row.original.courses.length}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => (
                    <div className="pr-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Acciones
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2 pr-2">
                        {saveToMine && row.original.scope === 'global' && (
                            <AddToMyRoadmapsButton
                                globalId={row.original.id}
                                savedRoadmapId={saveToMine.savedByGlobalId[row.original.id]}
                                mineBasePath={saveToMine.mineBasePath}
                                compact
                            />
                        )}
                        <Link
                            href={`${detailBasePath}/${row.original.id}`}
                            className="group inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.97] dark:hover:text-purple-400"
                        >
                            <HugeiconsIcon
                                icon={PencilEdit02Icon}
                                strokeWidth={2}
                                className="size-3.5 transition-transform group-hover:scale-110"
                            />
                            <span>Ver detalle</span>
                        </Link>
                    </div>
                ),
                enableSorting: false,
            },
        ],
        [detailBasePath, saveToMine]
    );

    const table = useReactTable({
        data: roadmaps,
        columns,
        state: { sorting, columnFilters, pagination },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableSortingRemoval: false,
    });

    const searchFilterValue = (table.getColumn('title')?.getFilterValue() as string) ?? '';

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 py-2 sm:py-6">
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
            >
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        {title}
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {description}
                    </p>
                </div>

                {createHref && (
                    <Link
                        href={createHref}
                        className="group relative inline-flex shrink-0 items-center justify-between gap-3.5 rounded-full bg-purple-600 py-2.5 pr-2.5 pl-6 text-sm font-semibold text-white shadow-xl shadow-purple-600/25 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-purple-500 hover:shadow-purple-500/40 active:scale-[0.98]"
                    >
                        <span>Nuevo roadmap</span>
                        <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5">
                            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                        </span>
                    </Link>
                )}
            </motion.div>

            {personalizeHref && (
                <Link
                    href={personalizeHref}
                    className="group flex flex-col gap-4 rounded-[1.6rem] border border-purple-500/30 bg-purple-500/10 p-5 transition-all hover:border-purple-500/50 hover:bg-purple-500/15 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white">
                            <HugeiconsIcon icon={Sparkles} strokeWidth={2} className="size-5" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                ¿Quieres una ruta a tu medida?
                            </p>
                            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                                Responde un cuestionario y armamos tu roadmap con IA.
                            </p>
                        </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-purple-500">
                        Ir a cuestionarios
                    </span>
                </Link>
            )}

            {errorMessage && (
                <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="mt-0.5 size-4 shrink-0" />
                    <p>{errorMessage}</p>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
                className="relative rounded-[2rem] bg-black/[0.02] p-1.5 shadow-2xl shadow-purple-950/5 ring-1 ring-black/[0.06] sm:p-2.5 dark:bg-white/[0.02] dark:ring-white/10"
            >
                <div className="relative flex flex-col overflow-hidden rounded-[calc(2rem-0.625rem)] border border-border/60 bg-card/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/80">
                    <div className="flex flex-col gap-4 border-b border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                        <div className="relative flex-1 sm:max-w-md">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/70">
                                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-4" />
                            </div>
                            <input
                                type="text"
                                value={searchFilterValue}
                                onChange={(e) => table.getColumn('title')?.setFilterValue(e.target.value)}
                                placeholder="Filtrar por título de roadmap..."
                                className="h-10 w-full rounded-xl border border-border/70 bg-background/50 pr-9 pl-10 text-xs font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 hover:border-foreground/30 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500"
                            />
                            {searchFilterValue && (
                                <button
                                    type="button"
                                    onClick={() => table.getColumn('title')?.setFilterValue('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
                                </button>
                            )}
                        </div>

                        <div className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 text-xs font-semibold text-muted-foreground">
                            <HugeiconsIcon
                                icon={Layers01Icon}
                                strokeWidth={2}
                                className="size-3.5 text-purple-600 dark:text-purple-400"
                            />
                            <span>{table.getFilteredRowModel().rows.length} roadmaps</span>
                        </div>
                    </div>

                    <div className="relative w-full overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow
                                        key={headerGroup.id}
                                        className="border-b border-border/50 bg-muted/30 hover:bg-muted/30"
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="h-11 px-4 text-xs select-none">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
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
                                            className="group border-b border-border/40 transition-colors duration-150 hover:bg-purple-500/[0.03] dark:hover:bg-purple-500/[0.05]"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="px-4 py-3 text-sm">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3 py-10">
                                                <div className="flex size-14 items-center justify-center rounded-2xl border border-border/80 bg-muted/40 text-muted-foreground">
                                                    <HugeiconsIcon icon={Folder01Icon} strokeWidth={1.5} className="size-7" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-base font-semibold text-foreground">
                                                        {searchFilterValue
                                                            ? 'No se encontraron resultados'
                                                            : 'No hay roadmaps registrados'}
                                                    </h3>
                                                    <p className="max-w-sm text-xs text-muted-foreground">
                                                        {searchFilterValue
                                                            ? `Ningún roadmap coincide con "${searchFilterValue}".`
                                                            : createHref && personalizeHref
                                                              ? 'Crea una ruta eligiendo los cursos, o responde un cuestionario y la armamos con IA.'
                                                              : createHref
                                                                ? 'Crea el primer roadmap para organizar una ruta de cursos.'
                                                                : personalizeHref
                                                                  ? 'Responde un cuestionario y armamos tu primera ruta con IA.'
                                                                  : 'Cuando haya rutas en esta sección, aparecerán aquí.'}
                                                    </p>
                                                </div>
                                                {!searchFilterValue && createHref && (
                                                    <Link
                                                        href={createHref}
                                                        className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-[0.98]"
                                                    >
                                                        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3.5" />
                                                        <span>Crear primer roadmap</span>
                                                    </Link>
                                                )}
                                                {!searchFilterValue && !createHref && personalizeHref && (
                                                    <Link
                                                        href={personalizeHref}
                                                        className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-[0.98]"
                                                    >
                                                        <HugeiconsIcon icon={Sparkles} strokeWidth={2} className="size-3.5" />
                                                        <span>Ir a cuestionarios</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 px-4 py-3.5 sm:flex-row sm:px-6">
                        <div className="text-xs text-muted-foreground">
                            {table.getFilteredRowModel().rows.length > 0 ? (
                                <>
                                    Mostrando{' '}
                                    <span className="font-semibold text-foreground">
                                        {pagination.pageIndex * pagination.pageSize + 1}
                                    </span>{' '}
                                    a{' '}
                                    <span className="font-semibold text-foreground">
                                        {Math.min(
                                            (pagination.pageIndex + 1) * pagination.pageSize,
                                            table.getFilteredRowModel().rows.length
                                        )}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-semibold text-foreground">
                                        {table.getFilteredRowModel().rows.length}
                                    </span>{' '}
                                    roadmaps
                                </>
                            ) : (
                                '0 roadmaps'
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="inline-flex size-8 items-center justify-center rounded-lg border border-border/70 bg-background/50 text-foreground transition-all hover:bg-muted active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
                            >
                                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
                            </button>
                            <div className="px-2 text-xs font-medium text-muted-foreground">
                                Página{' '}
                                <span className="font-semibold text-foreground">
                                    {table.getPageCount() === 0 ? 0 : pagination.pageIndex + 1}
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
                                className="inline-flex size-8 items-center justify-center rounded-lg border border-border/70 bg-background/50 text-foreground transition-all hover:bg-muted active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
                            >
                                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
