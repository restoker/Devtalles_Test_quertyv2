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
    UserMultipleIcon,
    CheckmarkCircle02Icon,
    Loading03Icon,
    Mail01Icon,
    SquareLock02Icon,
} from '@hugeicons/core-free-icons';

import {
    createUserAdminSchema,
    type CreateUserAdminSchema,
    clientDisplayName,
} from '@/types/user-admin-schema';
import type { AdminUserClient } from '@/types/user-admin-schema';
import { createUserAction } from '@/server/actions/users/create-user-action';
import { toast } from '@/components/ui/toast';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const fieldClass = (invalid?: boolean) =>
    cn(
        'h-11 w-full rounded-xl border bg-background/50 px-3.5 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/50',
        'focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid
            ? 'border-destructive text-destructive focus:border-destructive focus:ring-destructive/20'
            : 'border-border hover:border-foreground/30'
    );

interface FormNewUserProps {
    clients: AdminUserClient[];
}

export default function FormNewUser({ clients }: FormNewUserProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreateUserAdminSchema>({
        resolver: zodResolver(createUserAdminSchema),
        defaultValues: {
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            address: '',
            role: 'user',
            client_id: '',
            isActive: true,
        },
        mode: 'onChange',
    });

    const onSubmit = async (data: CreateUserAdminSchema) => {
        setIsPending(true);
        try {
            const res = await createUserAction(data);
            toast.add({
                title: res.ok ? 'Usuario creado' : 'Error',
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
                    <span className="text-xs font-semibold text-foreground">Nuevo usuario</span>
                </div>

                <div className="mt-2 flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Crear nuevo usuario
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Define email, credenciales, rol y vínculo opcional a un cliente.
                        </p>
                    </div>
                    <div className="hidden size-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 shadow-xs sm:flex dark:text-purple-400">
                        <HugeiconsIcon icon={UserMultipleIcon} strokeWidth={2} className="size-5" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-zinc-950/60 dark:shadow-2xl"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="first_name" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                Nombre <span className="text-purple-600 dark:text-purple-400">*</span>
                            </label>
                            <input
                                id="first_name"
                                disabled={isPending}
                                placeholder="Ej. Ana"
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
                                placeholder="Ej. López"
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
                                placeholder="usuario@ejemplo.com"
                                className={cn(fieldClass(!!errors.email), 'pl-10')}
                                {...register('email')}
                            />
                        </div>
                        <FieldError message={errors.email?.message} />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                            Contraseña <span className="text-purple-600 dark:text-purple-400">*</span>
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                                <HugeiconsIcon icon={SquareLock02Icon} strokeWidth={2} className="size-4" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                disabled={isPending}
                                placeholder="Mín. 8 caracteres"
                                className={cn(fieldClass(!!errors.password), 'pl-10')}
                                {...register('password')}
                            />
                        </div>
                        {errors.password ? (
                            <FieldError message={errors.password.message} />
                        ) : (
                            <p className="text-[11px] text-muted-foreground">
                                Mayúscula, minúscula y un número o carácter especial.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                            Dirección <span className="text-purple-600 dark:text-purple-400">*</span>
                        </label>
                        <input
                            id="address"
                            disabled={isPending}
                            placeholder="Dirección o ubicación del usuario"
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
                                    <span>Guardar usuario</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
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
