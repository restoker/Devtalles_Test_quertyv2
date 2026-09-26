'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    ArrowLeft02Icon,
    UserCircleIcon,
    CheckmarkCircle02Icon,
    Loading03Icon,
    Mail01Icon,
    Key01Icon,
} from '@hugeicons/core-free-icons';

import {
    updateUserAdminSchema,
    type UpdateUserAdminSchema,
    type AdminUser,
    type AdminUserClient,
    ROLE_LABELS,
    clientDisplayName,
} from '@/types/user-admin-schema';
import { updateUserAction } from '@/server/actions/users/update-user-action';
import { toast } from '@/components/ui/toast';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import ChangePasswordDialog from '../../_ui/ChangePasswordDialog';

const fieldClass = (invalid?: boolean) =>
    cn(
        'h-11 w-full rounded-xl border bg-background/50 px-3.5 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/50',
        'focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid
            ? 'border-destructive text-destructive focus:border-destructive focus:ring-destructive/20'
            : 'border-border hover:border-foreground/30'
    );

interface FormEditUserProps {
    user: AdminUser;
    clients: AdminUserClient[];
}

export default function FormEditUser({ user, clients }: FormEditUserProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<UpdateUserAdminSchema>({
        resolver: zodResolver(updateUserAdminSchema),
        defaultValues: {
            email: user.email,
            password: '',
            first_name: user.firstName,
            last_name: user.lastName ?? '',
            address: user.address ?? '',
            role: user.role,
            client_id: user.client?.id ?? '',
            isActive: user.isActive,
        },
        mode: 'onChange',
    });

    const onSubmit = async (data: UpdateUserAdminSchema) => {
        setIsPending(true);
        try {
            const res = await updateUserAction(user.id, data);
            toast.add({
                title: res.ok ? 'Usuario actualizado' : 'Error',
                description: res.msg,
                type: res.ok ? 'success' : 'error',
            });
            if (res.ok) {
                router.push('/admin/users');
                router.refresh();
            }
        } finally {
            setIsPending(false);
        }
    };

    const displayName = `${user.firstName} ${user.lastName ?? ''}`.trim();

    return (
        <div
            data-lenis-prevent
            className="mx-auto h-[calc(100dvh-7.5rem)] min-h-0 w-full max-w-2xl overflow-y-auto overscroll-y-contain py-2 sm:py-6"
        >
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex flex-col gap-2"
            >
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/users"
                        className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-accent hover:text-foreground active:scale-[0.98]"
                        title="Volver a Usuarios"
                    >
                        <HugeiconsIcon
                            icon={ArrowLeft02Icon}
                            strokeWidth={2}
                            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                        />
                        <span>Usuarios</span>
                    </Link>
                    <span className="text-xs text-muted-foreground/40">/</span>
                    <span className="truncate text-xs font-semibold text-foreground">
                        {displayName}
                    </span>
                </div>

                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Detalle y edición
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Revisa el perfil y actualiza los datos del usuario. La contraseña se
                            cambia por separado.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setPasswordOpen(true)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3.5 py-2 text-xs font-medium transition-all hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-600 active:scale-[0.98] dark:hover:text-purple-400"
                    >
                        <HugeiconsIcon icon={Key01Icon} strokeWidth={2} className="size-3.5" />
                        Cambiar contraseña
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.04 }}
                className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4"
            >
                <div className="flex size-12 items-center justify-center rounded-2xl border border-purple-500/25 bg-purple-500/10 text-sm font-bold text-purple-600 dark:text-purple-400">
                    {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                    <span className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-purple-700 dark:text-purple-300">
                        {ROLE_LABELS[user.role]}
                    </span>
                    <span className="rounded-lg border border-border/70 bg-background/60 px-2 py-0.5 text-muted-foreground">
                        {clientDisplayName(user.client)}
                    </span>
                    <span
                        className={cn(
                            'rounded-lg border px-2 py-0.5',
                            user.isActive
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'border-border/70 bg-muted/40 text-muted-foreground'
                        )}
                    >
                        {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-zinc-950/60 dark:shadow-2xl"
            >
                <div className="mb-5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} className="size-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-mono">ID: {user.id}</span>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="first_name" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                Nombre <span className="text-purple-600 dark:text-purple-400">*</span>
                            </label>
                            <input
                                id="first_name"
                                disabled={isPending}
                                className={fieldClass(!!errors.first_name)}
                                {...register('first_name')}
                            />
                            <FieldError message={errors.first_name?.message} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="last_name" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                Apellido <span className="text-purple-600 dark:text-purple-400">*</span>
                            </label>
                            <input
                                id="last_name"
                                disabled={isPending}
                                className={fieldClass(!!errors.last_name)}
                                {...register('last_name')}
                            />
                            <FieldError message={errors.last_name?.message} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                            Email <span className="text-purple-600 dark:text-purple-400">*</span>
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-4" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                disabled={isPending}
                                className={cn(fieldClass(!!errors.email), 'pl-10')}
                                {...register('email')}
                            />
                        </div>
                        <FieldError message={errors.email?.message} />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                            Dirección <span className="text-purple-600 dark:text-purple-400">*</span>
                        </label>
                        <input
                            id="address"
                            disabled={isPending}
                            className={fieldClass(!!errors.address)}
                            {...register('address')}
                        />
                        <FieldError message={errors.address?.message} />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                Rol <span className="text-purple-600 dark:text-purple-400">*</span>
                            </label>
                            <select
                                id="role"
                                disabled={isPending}
                                className={fieldClass(!!errors.role)}
                                {...register('role')}
                            >
                                <option value="user">Usuario</option>
                                <option value="client">Cliente</option>
                                <option value="admin">Admin</option>
                            </select>
                            <FieldError message={errors.role?.message} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="client_id" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                Cliente (opcional)
                            </label>
                            <select
                                id="client_id"
                                disabled={isPending}
                                className={fieldClass(!!errors.client_id)}
                                {...register('client_id')}
                            >
                                <option value="">Sin cliente</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {clientDisplayName(c)}
                                    </option>
                                ))}
                            </select>
                            <FieldError message={errors.client_id?.message} />
                        </div>
                    </div>

                    <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(v) => field.onChange(!!v)}
                                    disabled={isPending}
                                    aria-label="Usuario activo"
                                />
                                <div>
                                    <span className="text-sm font-medium text-foreground">Usuario activo</span>
                                    <p className="text-[11px] text-muted-foreground">
                                        Si se desactiva, la cuenta no podrá iniciar sesión.
                                    </p>
                                </div>
                            </label>
                        )}
                    />

                    <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:items-center sm:justify-end">
                        <Link
                            href="/admin/users"
                            className={cn(
                                'inline-flex h-11 items-center justify-center rounded-xl border border-border/80 bg-background/50 px-5 text-sm font-medium text-foreground transition-all hover:border-border hover:bg-muted active:scale-[0.98]',
                                isPending && 'pointer-events-none opacity-50'
                            )}
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 hover:shadow-purple-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isPending ? (
                                <>
                                    <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <HugeiconsIcon
                                        icon={CheckmarkCircle02Icon}
                                        strokeWidth={2}
                                        className="size-4 transition-transform group-hover:scale-110"
                                    />
                                    <span>Guardar cambios</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            <ChangePasswordDialog
                open={passwordOpen}
                userId={user.id}
                userName={displayName}
                userEmail={user.email}
                onClose={() => setPasswordOpen(false)}
            />
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    return (
        <AnimatePresence mode="wait">
            {message ? (
                <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-1.5 pt-1 text-xs font-medium text-destructive"
                >
                    <span className="size-1 rounded-full bg-destructive" />
                    {message}
                </motion.p>
            ) : null}
        </AnimatePresence>
    );
}
