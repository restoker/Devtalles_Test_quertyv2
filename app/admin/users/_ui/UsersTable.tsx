'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
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
    type FilterFn,
} from '@tanstack/react-table';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    UserMultipleIcon,
    Search01Icon,
    PlusSignIcon,
    PencilEdit02Icon,
    ViewIcon,
    Delete02Icon,
    Key01Icon,
    ArrowUpDownIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Cancel01Icon,
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
import ChangePasswordDialog from './ChangePasswordDialog';
import {
    ROLE_LABELS,
    clientDisplayName,
    clientsFromUsers,
    type AdminUser,
} from './mock-users';
import { deleteUserAction } from '@/server/actions/users/delete-user-action';
import { getAllUsersAction } from '@/server/actions/users/get-all-users-action';
import { searchUsersAction } from '@/server/actions/users/search-users-action';

const globalSearchFilter: FilterFn<AdminUser> = (row, _columnId, filterValue) => {
    const q = String(filterValue ?? '').toLowerCase().trim();
    if (!q) return true;
    const u = row.original;
    const haystack = [
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        ROLE_LABELS[u.role],
        clientDisplayName(u.client),
    ]
        .join(' ')
        .toLowerCase();
    return haystack.includes(q);
};

interface UsersTableProps {
    initialUsers: AdminUser[];
    errorMessage?: string;
}

export default function UsersTable({ initialUsers, errorMessage }: UsersTableProps) {
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);
    const [baseUsers, setBaseUsers] = useState<AdminUser[]>(initialUsers);
    const [isPending, startTransition] = useTransition();
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'name', desc: false },
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [searchKey, setSearchKey] = useState('');
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);

    const clients = useMemo(() => clientsFromUsers(baseUsers), [baseUsers]);

    const clientFilterValue =
        (columnFilters.find((f) => f.id === 'client')?.value as string) ?? 'all';

    useEffect(() => {
        if (errorMessage) {
            toast.add({
                title: 'Error al cargar usuarios',
                description: errorMessage,
                type: 'error',
            });
        }
    }, [errorMessage]);

    const runSearch = (key: string) => {
        const trimmed = key.trim();
        startTransition(async () => {
            if (!trimmed) {
                const res = await getAllUsersAction();
                if (!res.ok) {
                    toast.add({
                        title: 'Error',
                        description: res.msg,
                        type: 'error',
                    });
                    return;
                }
                const data = res.data ?? [];
                setBaseUsers(data);
                setUsers(data);
                return;
            }

            const res = await searchUsersAction(trimmed);
            if (!res.ok) {
                toast.add({
                    title: 'Error al buscar',
                    description: res.msg,
                    type: 'error',
                });
                return;
            }
            setUsers(res.data ?? []);
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            const res = await deleteUserAction(id);
            setConfirmDeleteId(null);
            toast.add({
                title: res.ok ? 'Usuario desactivado' : 'Error',
                description: res.msg,
                type: res.ok ? 'success' : 'error',
            });
            if (!res.ok) return;

            setUsers((prev) =>
                prev.map((u) => (u.id === id ? { ...u, isActive: false } : u))
            );
            setBaseUsers((prev) =>
                prev.map((u) => (u.id === id ? { ...u, isActive: false } : u))
            );
        });
    };

    const columns = useMemo<ColumnDef<AdminUser>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center justify-center pl-2">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                            aria-label="Seleccionar todos los usuarios visibles"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center pl-2">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label={`Seleccionar usuario ${row.original.email}`}
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 44,
            },
            {
                id: 'name',
                accessorFn: (row) => `${row.firstName} ${row.lastName ?? ''}`,
                header: ({ column }) => {
                    const isSorted = column.getIsSorted();
                    return (
                        <button
                            type="button"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                            className="group -ml-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-[0.98]"
                        >
                            <span>Nombre</span>
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
                    const { firstName, lastName } = row.original;
                    const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
                    return (
                        <div className="flex items-center gap-3.5 py-1.5">
                            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-500/15 via-purple-600/10 to-fuchsia-500/10 text-xs font-bold text-purple-600 shadow-xs dark:text-purple-400">
                                {initials}
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                                    {firstName} {lastName}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'email',
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Email
                    </div>
                ),
                cell: ({ row }) => (
                    <span className="block max-w-[10rem] truncate text-sm text-muted-foreground sm:max-w-[14rem]">
                        {row.original.email}
                    </span>
                ),
            },
            {
                accessorKey: 'role',
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Rol
                    </div>
                ),
                cell: ({ row }) => {
                    const role = row.original.role;
                    return (
                        <span
                            className={cn(
                                'inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                                role === 'admin' &&
                                    'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300',
                                role === 'client' &&
                                    'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
                                role === 'user' &&
                                    'border-border/70 bg-muted/50 text-muted-foreground'
                            )}
                        >
                            {ROLE_LABELS[role]}
                        </span>
                    );
                },
            },
            {
                id: 'client',
                accessorFn: (row) => row.client?.id ?? '',
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Cliente
                    </div>
                ),
                filterFn: (row, _id, value) => {
                    if (!value || value === 'all') return true;
                    return row.original.client?.id === value;
                },
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {clientDisplayName(row.original.client)}
                    </span>
                ),
            },
            {
                accessorKey: 'isActive',
                header: () => (
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Activo
                    </div>
                ),
                cell: ({ row }) => {
                    const active = row.original.isActive;
                    return (
                        <span
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold',
                                active
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                    : 'border-border/70 bg-muted/40 text-muted-foreground'
                            )}
                        >
                            <span
                                className={cn(
                                    'size-1.5 rounded-full',
                                    active ? 'bg-emerald-500' : 'bg-muted-foreground/50'
                                )}
                            />
                            {active ? 'Activo' : 'Inactivo'}
                        </span>
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
                    const user = row.original;
                    const isConfirming = confirmDeleteId === user.id;

                    return (
                        <div className="flex flex-wrap items-center justify-end gap-1.5 pr-2">
                            {isConfirming ? (
                                <div className="flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-2 py-1">
                                    <span className="text-[10px] font-medium text-destructive">¿Eliminar?</span>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(user.id)}
                                        disabled={isPending}
                                        className="rounded-lg bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white disabled:opacity-60"
                                    >
                                        Sí
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="rounded-lg px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        No
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        className="inline-flex items-center gap-1 rounded-xl border border-border/70 bg-background/60 px-2.5 py-1.5 text-[11px] font-medium transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.97] dark:hover:text-purple-400"
                                        title="Ver detalle"
                                    >
                                        <HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="size-3.5" />
                                        <span className="hidden lg:inline">Ver</span>
                                    </Link>
                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        className="inline-flex items-center gap-1 rounded-xl border border-border/70 bg-background/60 px-2.5 py-1.5 text-[11px] font-medium transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.97] dark:hover:text-purple-400"
                                        title="Editar usuario"
                                    >
                                        <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} className="size-3.5" />
                                        <span className="hidden lg:inline">Editar</span>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setPasswordUser(user)}
                                        className="inline-flex items-center gap-1 rounded-xl border border-border/70 bg-background/60 px-2.5 py-1.5 text-[11px] font-medium transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.97] dark:hover:text-purple-400"
                                        title="Cambiar contraseña"
                                    >
                                        <HugeiconsIcon icon={Key01Icon} strokeWidth={2} className="size-3.5" />
                                        <span className="hidden xl:inline">Contraseña</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(user.id)}
                                        className="inline-flex items-center gap-1 rounded-xl border border-destructive/20 bg-background/60 px-2.5 py-1.5 text-[11px] font-medium text-destructive transition-all hover:border-destructive/40 hover:bg-destructive/10 active:scale-[0.97]"
                                        title="Eliminar usuario"
                                    >
                                        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                                        <span className="hidden lg:inline">Eliminar</span>
                                    </button>
                                </>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [confirmDeleteId, isPending]
    );

    const table = useReactTable({
        data: users,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            rowSelection,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        globalFilterFn: globalSearchFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableSortingRemoval: false,
    });

    const selectedCount = Object.keys(rowSelection).filter((key) => rowSelection[key]).length;

    return (
        <div
            data-lenis-prevent
            className="mx-auto h-[calc(100dvh-7.5rem)] min-h-0 w-full max-w-7xl space-y-8 overflow-y-auto overscroll-y-contain py-2 sm:py-6"
        >
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
            >
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Usuarios
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Administra cuentas de la plataforma. Consulta, filtra y gestiona roles,
                        clientes y estado de acceso.
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <Link
                        href="/admin/users/new"
                        className="group relative inline-flex items-center justify-between gap-3.5 rounded-full bg-purple-600 py-2.5 pr-2.5 pl-6 text-sm font-semibold text-white shadow-xl shadow-purple-600/25 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-purple-500 hover:shadow-purple-500/40 active:scale-[0.98]"
                    >
                        <span>Nuevo usuario</span>
                        <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:translate-x-0.5">
                            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                        </span>
                    </Link>
                </div>
            </motion.div>

            {errorMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 p-4 text-destructive"
                >
                    <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-5 shrink-0" />
                    <span className="text-xs font-medium sm:text-sm">{errorMessage}</span>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
                className="relative rounded-[2rem] bg-black/[0.02] p-1.5 shadow-2xl shadow-purple-950/5 ring-1 ring-black/[0.06] sm:p-2.5 dark:bg-white/[0.02] dark:ring-white/10"
            >
                <div className="relative flex flex-col overflow-hidden rounded-[calc(2rem-0.625rem)] border border-border/60 bg-card/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/80">
                    <div className="flex flex-col gap-4 border-b border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                        <form
                            className="relative flex-1 sm:max-w-md"
                            onSubmit={(e) => {
                                e.preventDefault();
                                runSearch(searchKey);
                            }}
                        >
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/70">
                                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-4" />
                            </div>
                            <input
                                type="text"
                                value={searchKey}
                                onChange={(e) => {
                                    setSearchKey(e.target.value);
                                    setGlobalFilter(e.target.value);
                                }}
                                placeholder="Buscar por nombre, email o rol..."
                                className="h-10 w-full rounded-xl border border-border/70 bg-background/50 pr-9 pl-10 text-xs font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 hover:border-foreground/30 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500"
                            />
                            {searchKey && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchKey('');
                                        setGlobalFilter('');
                                        runSearch('');
                                    }}
                                    title="Limpiar búsqueda"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
                                </button>
                            )}
                        </form>

                        <div className="flex flex-wrap items-center gap-2">
                            <label className="sr-only" htmlFor="filter-client">
                                Por cliente
                            </label>
                            <select
                                id="filter-client"
                                value={clientFilterValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    table
                                        .getColumn('client')
                                        ?.setFilterValue(value === 'all' ? undefined : value);
                                }}
                                className="h-10 w-full min-w-0 max-w-full rounded-xl border border-border/70 bg-background/50 px-3 text-xs font-medium text-foreground outline-none transition-all hover:border-foreground/30 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 sm:w-auto sm:max-w-[12rem] dark:focus:border-purple-500"
                            >
                                <option value="all">Por cliente: todos</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {clientDisplayName(c)}
                                    </option>
                                ))}
                            </select>

                            <div className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 text-xs font-semibold text-muted-foreground">
                                <HugeiconsIcon
                                    icon={Layers01Icon}
                                    strokeWidth={2}
                                    className="size-3.5 text-purple-600 dark:text-purple-400"
                                />
                                <span>{table.getFilteredRowModel().rows.length} usuarios</span>
                            </div>
                        </div>
                    </div>

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
                                    <span>usuario(s) seleccionado(s)</span>
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
                                                style={{
                                                    width:
                                                        header.getSize() !== 150
                                                            ? header.getSize()
                                                            : undefined,
                                                }}
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
                                                row.getIsSelected() &&
                                                    'bg-purple-500/10 hover:bg-purple-500/15'
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
                                        <TableCell colSpan={columns.length} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3 py-10">
                                                <div className="flex size-14 items-center justify-center rounded-2xl border border-border/80 bg-muted/40 text-muted-foreground">
                                                    <HugeiconsIcon
                                                        icon={UserMultipleIcon}
                                                        strokeWidth={1.5}
                                                        className="size-7"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-base font-semibold text-foreground">
                                                        {globalFilter || clientFilterValue !== 'all'
                                                            ? 'No se encontraron resultados'
                                                            : 'No hay usuarios registrados'}
                                                    </h3>
                                                    <p className="max-w-sm text-xs text-muted-foreground">
                                                        {globalFilter || clientFilterValue !== 'all'
                                                            ? 'Ajusta la búsqueda o el filtro por cliente e inténtalo de nuevo.'
                                                            : 'Comienza creando el primer usuario de la plataforma.'}
                                                    </p>
                                                </div>
                                                {globalFilter || clientFilterValue !== 'all' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSearchKey('');
                                                            setGlobalFilter('');
                                                            table.getColumn('client')?.setFilterValue(undefined);
                                                            runSearch('');
                                                        }}
                                                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/80 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98]"
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
                                                        href="/admin/users/new"
                                                        className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-[0.98]"
                                                    >
                                                        <HugeiconsIcon
                                                            icon={PlusSignIcon}
                                                            strokeWidth={2}
                                                            className="size-3.5"
                                                        />
                                                        <span>Crear primer usuario</span>
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
                                    usuarios
                                </>
                            ) : (
                                '0 usuarios'
                            )}
                        </div>

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

            <ChangePasswordDialog
                open={!!passwordUser}
                userId={passwordUser?.id ?? ''}
                userName={
                    passwordUser
                        ? `${passwordUser.firstName} ${passwordUser.lastName ?? ''}`.trim()
                        : ''
                }
                userEmail={passwordUser?.email ?? ''}
                onClose={() => setPasswordUser(null)}
            />
        </div>
    );
}
