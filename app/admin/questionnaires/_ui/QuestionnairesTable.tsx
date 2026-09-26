"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  Search01Icon,
  PlusSignIcon,
  PencilEdit02Icon,
  ViewIcon,
  ArrowUpDownIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Layers01Icon,
  UnavailableIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Questionnaire } from "@/types/questionnaire-schema";
import { updateQuestionnaireAction } from "@/server/actions/questionnaires/update-questionnaire-action";

type StatusFilter = "all" | "active";

interface QuestionnairesTableProps {
  initialData?: Questionnaire[];
}

export default function QuestionnairesTable({
  initialData = [],
}: QuestionnairesTableProps) {
  const [items, setItems] = useState<Questionnaire[]>(initialData);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "title", desc: false }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  const filtered = useMemo(() => {
    let rows = items;
    if (statusFilter === "active") {
      rows = rows.filter((q) => q.isActive);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.description ?? "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [items, statusFilter, search]);

  const handleToggleActive = (item: Questionnaire) => {
    const next = !item.isActive;
    startTransition(async () => {
      const result = await updateQuestionnaireAction(item.id, { isActive: next });
      if (!result.ok) {
        toast.add({
          title: "No se pudo cambiar el estado",
          description: result.msg,
          type: "error",
        });
        return;
      }
      setItems((prev) =>
        prev.map((row) =>
          String(row.id) === String(item.id)
            ? { ...row, isActive: result.data.isActive }
            : row
        )
      );
      toast.add({
        title: next ? "Cuestionario activado" : "Cuestionario desactivado",
        description: `"${item.title}" ahora está ${next ? "activo" : "inactivo"}.`,
        type: "success",
      });
    });
  };

  const columns = useMemo<ColumnDef<Questionnaire>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="group -ml-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:scale-[0.98]"
            >
              <span>Título</span>
              <HugeiconsIcon
                icon={ArrowUpDownIcon}
                strokeWidth={2}
                className={cn(
                  "size-3.5 transition-colors",
                  isSorted
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-muted-foreground/60 group-hover:text-foreground"
                )}
              />
            </button>
          );
        },
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3.5 py-1.5">
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-500/15 via-purple-600/10 to-fuchsia-500/10 text-purple-600 shadow-xs dark:text-purple-400">
                <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-4.5" />
                <span
                  className={cn(
                    "absolute -top-1 -right-1 size-2 rounded-full ring-2 ring-background",
                    item.isActive ? "bg-emerald-500" : "bg-muted-foreground/50"
                  )}
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {item.title}
                </span>
                {item.description && (
                  <span className="line-clamp-1 text-[11px] text-muted-foreground/80">
                    {item.description}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: () => (
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Estado
          </div>
        ),
        cell: ({ row }) => {
          const active = row.original.isActive;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                active
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-border/70 bg-muted/40 text-muted-foreground"
              )}
            >
              <HugeiconsIcon
                icon={active ? CheckmarkCircle02Icon : UnavailableIcon}
                strokeWidth={2}
                className="size-3.5"
              />
              {active ? "Activo" : "Inactivo"}
            </span>
          );
        },
      },
      {
        id: "questionCount",
        accessorFn: (row) => row.questions?.length ?? 0,
        header: () => (
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Preguntas
          </div>
        ),
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-semibold text-foreground">
            {row.original.questions?.length ?? 0}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => (
          <div className="pr-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Acciones
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-wrap items-center justify-end gap-2 pr-2">
              <Link
                href={`/admin/questionnaires/${item.id}`}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.97] dark:hover:text-purple-400"
                title="Ver cuestionario"
              >
                <HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="size-3.5" />
                <span className="hidden lg:inline">Ver</span>
              </Link>
              <Link
                href={`/admin/questionnaires/${item.id}`}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.97] dark:hover:text-purple-400"
                title="Editar cuestionario"
              >
                <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} className="size-3.5" />
                <span className="hidden lg:inline">Editar</span>
              </Link>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleToggleActive(item)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-700 active:scale-[0.97] disabled:opacity-50 dark:hover:text-amber-400"
                title={item.isActive ? "Desactivar" : "Activar"}
              >
                <HugeiconsIcon
                  icon={item.isActive ? UnavailableIcon : CheckmarkCircle02Icon}
                  strokeWidth={2}
                  className="size-3.5"
                />
                <span className="hidden xl:inline">{item.isActive ? "Desactivar" : "Activar"}</span>
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
    data: filtered,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSortingRemoval: false,
  });

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
            Cuestionarios
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Diseña y organiza cuestionarios de evaluación para personalizar la ruta de
            aprendizaje.
          </p>
        </div>

        <Link
          href="/admin/questionnaires/new"
          className="group relative inline-flex shrink-0 items-center justify-between gap-3.5 rounded-full bg-purple-600 py-2.5 pr-2.5 pl-6 text-sm font-semibold text-white shadow-xl shadow-purple-600/25 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-purple-500 hover:shadow-purple-500/40 active:scale-[0.98]"
        >
          <span>Nuevo cuestionario</span>
          <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-110">
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
          </span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
        className="relative rounded-[2rem] bg-black/[0.02] p-1.5 shadow-2xl shadow-purple-950/5 ring-1 ring-black/[0.06] sm:p-2.5 dark:bg-white/[0.02] dark:ring-white/10"
      >
        <div className="relative flex flex-col overflow-hidden rounded-[calc(2rem-0.625rem)] border border-border/60 bg-card/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/80">
          <div className="flex flex-col gap-4 border-b border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
              <div className="inline-flex h-10 items-center rounded-xl border border-border/60 bg-muted/30 p-1">
                {(
                  [
                    { id: "all", label: "Todos" },
                    { id: "active", label: "Activos" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setPagination((p) => ({ ...p, pageIndex: 0 }));
                    }}
                    className={cn(
                      "h-8 rounded-lg px-3.5 text-xs font-semibold transition-all active:scale-[0.98]",
                      statusFilter === tab.id
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-0 flex-1 lg:max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/70">
                  <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                  }}
                  placeholder="Filtrar por título..."
                  className="h-10 w-full rounded-xl border border-border/70 bg-background/50 pr-9 pl-10 text-xs font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 hover:border-foreground/30 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 text-xs font-semibold text-muted-foreground">
              <HugeiconsIcon
                icon={Layers01Icon}
                strokeWidth={2}
                className="size-3.5 text-purple-600 dark:text-purple-400"
              />
              <span>{filtered.length} cuestionarios</span>
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
                          <HugeiconsIcon icon={File01Icon} strokeWidth={1.5} className="size-7" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-semibold text-foreground">
                            {search || statusFilter === "active"
                              ? "No se encontraron resultados"
                              : "No hay cuestionarios"}
                          </h3>
                          <p className="max-w-sm text-xs text-muted-foreground">
                            {search
                              ? `Ningún cuestionario coincide con "${search}".`
                              : statusFilter === "active"
                                ? "No hay cuestionarios activos en este momento."
                                : "Crea el primer cuestionario para comenzar."}
                          </p>
                        </div>
                        {!search && statusFilter === "all" && (
                          <Link
                            href="/admin/questionnaires/new"
                            className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-all hover:bg-purple-500 active:scale-[0.98]"
                          >
                            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3.5" />
                            <span>Crear cuestionario</span>
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
              {filtered.length > 0 ? (
                <>
                  Mostrando{" "}
                  <span className="font-semibold text-foreground">
                    {pagination.pageIndex * pagination.pageSize + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(
                      (pagination.pageIndex + 1) * pagination.pageSize,
                      filtered.length
                    )}
                  </span>{" "}
                  de <span className="font-semibold text-foreground">{filtered.length}</span>
                </>
              ) : (
                "0 cuestionarios"
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
                Página{" "}
                <span className="font-semibold text-foreground">
                  {table.getPageCount() === 0 ? 0 : pagination.pageIndex + 1}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-foreground">{table.getPageCount() || 1}</span>
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
