'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import Link from 'next/link';
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
} from '@tanstack/react-table';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Tag01Icon,
    Search01Icon,
    PlusSignIcon,
    PencilEdit02Icon,
    Copy01Icon,
    CheckmarkCircle02Icon,
    ArrowUpDownIcon,
    ReloadIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Cancel01Icon,
    Layers01Icon,
    Tick02Icon,
    Alert02Icon,
    Folder01Icon,
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
import { getAllCategoriesAction } from '@/server/actions/categorias/get-all-categorias-action';

export interface CategoriaItem {
    id: string;
    name: string;
}

interface CategoriasTableProps {
    initialCategories: CategoriaItem[];
    errorMessage?: string;
}

// Función para transformar el nombre en slug amigable (mismo algoritmo que en FormNewCategoria)
function createCategorySlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export default function CategoriasTable({
    initialCategories,
    errorMessage,
}: CategoriasTableProps) {
    const [categories, setCategories] = useState<CategoriaItem[]>(initialCategories);
    const [isPending, startTransition] = useTransition();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // TanStack Table states
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'name', desc: false },
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Mantener sincronizado si initialCategories cambia
    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    // Función para copiar texto al portapapeles con feedback háptico
    const handleCopy = async (text: string, label: string = 'Texto', idFeedback?: string) => {
        try {
            await navigator.clipboard.writeText(text);
            if (idFeedback) {
                setCopiedId(idFeedback);
                setTimeout(() => setCopiedId(null), 2000);
            }
            toast.add({
                title: 'Copiado al portapapeles',
                description: `${label} copiado exitosamente.`,
                type: 'success',
            });
        } catch {
            toast.add({
                title: 'Error al copiar',
                description: 'No se pudo copiar al portapapeles.',
                type: 'error',
            });
        }
    };

    // Función de recarga manual desde el servidor
    const handleRefresh = () => {
        setIsRefreshing(true);
        startTransition(async () => {
            try {
                const res = await getAllCategoriesAction();
                if (res.ok && res.data) {
                    setCategories(res.data);
                    toast.add({
                        title: 'Categorías sincronizadas',
                        description: `Se han actualizado ${res.data.length} categorías con éxito.`,
                        type: 'success',
                    });
                } else {
                    toast.add({
                        title: 'Error al sincronizar',
                        description: res.msg || 'No se pudieron cargar las categorías del servidor.',
                        type: 'error',
                    });
                }
            } catch {
                toast.add({
                    title: 'Error de conexión',
                    description: 'No se pudo comunicar con el servidor.',
                    type: 'error',
                });
            } finally {
                setIsRefreshing(false);
            }
        });
    };

    // Definición de Columnas de la Tabla TanStack
    const columns = useMemo<ColumnDef<CategoriaItem>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center justify-center pl-2">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                            aria-label="Seleccionar todas las categorías visibles"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center pl-2">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label={`Seleccionar categoría ${row.original.name}`}
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 44,
            },
            {
                accessorKey: 'name',
                header: ({ column }) => {
                    const isSorted = column.getIsSorted();
                    return (
                        <button
                            type="button"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                            className="group -ml-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-[0.98]"
                        >
                            <span>Categoría</span>
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
                cell: ({ row }) => {
                    const name = row.getValue('name') as string;
                    const slug = createCategorySlug(name);
                    return (
                        <div className="flex items-center gap-3.5 py-1.5">
                            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-500/15 via-purple-600/10 to-fuchsia-500/10 text-purple-600 shadow-xs dark:text-purple-400">
                                <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} className="size-4.5" />
                                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-purple-500/80 ring-2 ring-background" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-purple-600 dark:hover:text-purple-400">
                                    {name}
                                </span>
                                <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground/75">
                                    <span>/cursos/</span>
                                    <span className="truncate font-medium text-purple-600/90 dark:text-purple-400/90">
                                        {slug}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'id',
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Identificador (ID)
                    </div>
                ),
                cell: ({ row }) => {
                    const id = row.getValue('id') as string;
                    const isCurrentCopied = copiedId === id;

                    return (
                        <button
                            type="button"
                            onClick={() => handleCopy(id, 'ID de categoría', id)}
                            title="Haz clic para copiar el ID"
                            className={cn(
                                'group inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-mono transition-all active:scale-[0.98]',
                                isCurrentCopied
                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'border-border/60 bg-muted/40 text-muted-foreground hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-foreground'
                            )}
                        >
                            <span className="max-w-[140px] truncate sm:max-w-none">{id}</span>
                            <HugeiconsIcon
                                icon={isCurrentCopied ? Tick02Icon : Copy01Icon}
                                strokeWidth={2}
                                className={cn(
                                    'size-3.5 shrink-0 transition-transform group-hover:scale-110',
                                    isCurrentCopied
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-muted-foreground/60 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                                )}
                            />
                        </button>
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
                    const category = row.original;
                    return (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            <Link
                                href={`/admin/categorias/new?id=${category.id}`}
                                className="group inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.97] dark:hover:text-purple-400"
                                title="Editar esta categoría"
                            >
                                <HugeiconsIcon
                                    icon={PencilEdit02Icon}
                                    strokeWidth={2}
                                    className="size-3.5 transition-transform group-hover:scale-110"
                                />
                                <span>Editar</span>
                            </Link>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [copiedId]
    );

    // Instancia de TanStack Table
    const table = useReactTable({
        data: categories,
        columns,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableSortingRemoval: false,
    });

    const searchFilterValue =
        (table.getColumn('name')?.getFilterValue() as string) ?? '';

    const selectedCount = Object.keys(rowSelection).filter(
        (key) => rowSelection[key]
    ).length;

    const handleCopySelectedIds = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) return;
        const ids = selectedRows.map((r) => r.original.id).join('\n');
        handleCopy(ids, `${selectedRows.length} IDs de categorías`);
    };

    return (
        <div
            data-lenis-prevent
            className="mx-auto h-[calc(100dvh-7.5rem)] min-h-0 w-full max-w-7xl space-y-8 overflow-y-auto overscroll-y-contain py-2 sm:py-6"
        >
            {/* ENCABEZADO PRINCIPAL EDITORIAL & ISLAND CTA */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
            >
                <div className="space-y-2">
                    {/* Eyebrow Tag con micro-pulsación */}
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Categorías
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Organiza el ecosistema educativo. Crea, consulta y edita las categorías
                        que estructuran los cursos y contenidos formativos de Devtalles.
                    </p>
                </div>

                {/* ISLAND BUTTON CON ARQUITECTURA BUTTON-IN-BUTTON */}
                <div className="flex shrink-0 items-center gap-3">
                    <Link
                        href="/admin/categorias/new"
                        className="group relative inline-flex items-center justify-between gap-3.5 rounded-full bg-purple-600 py-2.5 pr-2.5 pl-6 text-sm font-semibold text-white shadow-xl shadow-purple-600/25 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-purple-500 hover:shadow-purple-500/40 active:scale-[0.98]"
                    >
                        <span>Nueva Categoría</span>
                        <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:translate-x-0.5">
                            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                        </span>
                    </Link>
                </div>
            </motion.div>

            {/* ALERTA DE ERROR EN CASO DE FALLO DEL SERVIDOR */}
            {errorMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-destructive"
                >
                    <div className="flex items-center gap-3">
                        <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-5 shrink-0" />
                        <span className="text-xs font-medium sm:text-sm">{errorMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/25"
                    >
                        <HugeiconsIcon icon={ReloadIcon} strokeWidth={2} className="size-3.5" />
                        <span>Reintentar</span>
                    </button>
                </motion.div>
            )}

            {/* CONTENEDOR PRINCIPAL DE TABLA CON DOUBLE-BEZEL (DOPPELRAND) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
                className="relative rounded-[2rem] bg-black/[0.02] p-1.5 shadow-2xl shadow-purple-950/5 ring-1 ring-black/[0.06] sm:p-2.5 dark:bg-white/[0.02] dark:ring-white/10"
            >
                {/* Núcleo Interior (Inner Core) */}
                <div className="relative flex flex-col overflow-hidden rounded-[calc(2rem-0.625rem)] border border-border/60 bg-card/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/80">

                    {/* TOOLBAR SUPERIOR: FILTROS & ACCIONES */}
                    <div className="flex flex-col gap-4 border-b border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                        {/* Buscador reactivo por Nombre de Categoría */}
                        <div className="relative flex-1 sm:max-w-md">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/70">
                                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-4" />
                            </div>
                            <input
                                type="text"
                                value={searchFilterValue}
                                onChange={(e) =>
                                    table.getColumn('name')?.setFilterValue(e.target.value)
                                }
                                placeholder="Filtrar por nombre de categoría..."
                                className="h-10 w-full rounded-xl border border-border/70 bg-background/50 pr-9 pl-10 text-xs font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 hover:border-foreground/30 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500"
                            />
                            {searchFilterValue && (
                                <button
                                    type="button"
                                    onClick={() => table.getColumn('name')?.setFilterValue('')}
                                    title="Limpiar búsqueda"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
                                </button>
                            )}
                        </div>

                        {/* Botones de acción del Toolbar */}
                        <div className="flex items-center gap-2">
                            {/* Botón de Sincronización Manual */}
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={isRefreshing || isPending}
                                title="Actualizar datos desde el servidor"
                                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-background/50 px-3.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground active:scale-[0.98] disabled:opacity-50"
                            >
                                <HugeiconsIcon
                                    icon={ReloadIcon}
                                    strokeWidth={2}
                                    className={cn('size-3.5', (isRefreshing || isPending) && 'animate-spin text-purple-600')}
                                />
                                <span className="hidden sm:inline">Actualizar</span>
                            </button>

                            {/* Badge contador total */}
                            <div className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 text-xs font-semibold text-muted-foreground">
                                <HugeiconsIcon icon={Layers01Icon} strokeWidth={2} className="size-3.5 text-purple-600 dark:text-purple-400" />
                                <span>{table.getFilteredRowModel().rows.length} categorías</span>
                            </div>
                        </div>
                    </div>

                    {/* BARRA FLOTANTE DE ACCIONES EN LOTE CUANDO HAY ELEMENTOS SELECCIONADOS */}
                    <AnimatePresence>
                        {selectedCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center justify-between border-b border-purple-500/20 bg-purple-500/10 px-4 py-2.5 sm:px-6"
                            >
                                <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300">
                                    <span className="flex size-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                                        {selectedCount}
                                    </span>
                                    <span>categoría(s) seleccionada(s)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCopySelectedIds}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-accent active:scale-[0.98]"
                                    >
                                        <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-3" />
                                        <span>Copiar IDs</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => table.resetRowSelection()}
                                        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                                    >
                                        Deseleccionar
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* TABLA PRINCIPAL ESTILIZADA */}
                    <div className="relative w-full overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow
                                        key={headerGroup.id}
                                        className="border-b border-border/50 bg-muted/30 hover:bg-muted/30"
                                    >
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="h-11 px-4 text-xs select-none"
                                                style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
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
                                            data-state={row.getIsSelected() && 'selected'}
                                            className={cn(
                                                'group border-b border-border/40 transition-colors duration-150',
                                                'hover:bg-purple-500/[0.03] dark:hover:bg-purple-500/[0.05]',
                                                row.getIsSelected() && 'bg-purple-500/10 hover:bg-purple-500/15'
                                            )}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="px-4 py-3 text-sm">
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
                                            <div className="flex flex-col items-center justify-center gap-3 py-10">
                                                <div className="flex size-14 items-center justify-center rounded-2xl border border-border/80 bg-muted/40 text-muted-foreground">
                                                    <HugeiconsIcon
                                                        icon={Folder01Icon}
                                                        strokeWidth={1.5}
                                                        className="size-7"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-base font-semibold text-foreground">
                                                        {searchFilterValue
                                                            ? 'No se encontraron resultados'
                                                            : 'No hay categorías registradas'}
                                                    </h3>
                                                    <p className="max-w-sm text-xs text-muted-foreground">
                                                        {searchFilterValue
                                                            ? `No existe ninguna categoría que coincida con "${searchFilterValue}". Intenta con otro término.`
                                                            : 'Comienza creando la primera categoría para organizar los cursos de la plataforma.'}
                                                    </p>
                                                </div>
                                                {searchFilterValue ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => table.getColumn('name')?.setFilterValue('')}
                                                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/80 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
                                                    >
                                                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
                                                        <span>Limpiar búsqueda</span>
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href="/admin/categorias/new"
                                                        className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-[0.98]"
                                                    >
                                                        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3.5" />
                                                        <span>Crear primera categoría</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PIE DE PÁGINA: PAGINACIÓN Y RESUMEN */}
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
                                    categorías
                                </>
                            ) : (
                                '0 categorías'
                            )}
                        </div>

                        {/* Controles de Paginación */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="inline-flex size-8 items-center justify-center rounded-lg border border-border/70 bg-background/50 text-foreground transition-all hover:bg-muted active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
                                title="Página anterior"
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
                                title="Página siguiente"
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
