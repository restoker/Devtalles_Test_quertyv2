'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Cancel01Icon,
    LockPasswordIcon,
    CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

import {
    changePasswordSchema,
    type ChangePasswordSchema,
} from '@/types/user-admin-schema';
import { changePasswordAction } from '@/server/actions/auth/change-password-action';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface ChangePasswordDialogProps {
    open: boolean;
    userId: string;
    userName: string;
    userEmail: string;
    onClose: () => void;
}

export default function ChangePasswordDialog({
    open,
    userId,
    userName,
    userEmail,
    onClose,
}: ChangePasswordDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ChangePasswordSchema>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
        mode: 'onChange',
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (data: ChangePasswordSchema) => {
        const res = await changePasswordAction({
            password: data.password,
            userId: userId || undefined,
        });
        toast.add({
            title: res.ok ? 'Contraseña actualizada' : 'Error',
            description: res.msg,
            type: res.ok ? 'success' : 'error',
        });
        if (res.ok) handleClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    <button
                        type="button"
                        aria-label="Cerrar diálogo"
                        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                        onClick={handleClose}
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="change-password-title"
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-950"
                    >
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <HugeiconsIcon icon={LockPasswordIcon} strokeWidth={2} className="size-4.5" />
                                </div>
                                <div className="min-w-0">
                                    <h2
                                        id="change-password-title"
                                        className="text-base font-semibold tracking-tight text-foreground"
                                    >
                                        Cambiar contraseña
                                    </h2>
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                        {userName} · {userEmail}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="new-password"
                                    className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                                >
                                    Nueva contraseña <span className="text-purple-600 dark:text-purple-400">*</span>
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={isSubmitting}
                                    placeholder="Mín. 8 caracteres"
                                    aria-invalid={!!errors.password}
                                    className={cn(
                                        'h-11 w-full rounded-xl border bg-background/50 px-3.5 text-sm font-medium outline-none transition-all',
                                        'focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500',
                                        errors.password
                                            ? 'border-destructive text-destructive'
                                            : 'border-border hover:border-foreground/30'
                                    )}
                                    {...register('password')}
                                />
                                {errors.password ? (
                                    <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
                                ) : (
                                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                                        Mayúscula, minúscula y un número o carácter especial.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="confirm-password"
                                    className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
                                >
                                    Confirmar contraseña <span className="text-purple-600 dark:text-purple-400">*</span>
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={isSubmitting}
                                    placeholder="Repite la contraseña"
                                    aria-invalid={!!errors.confirmPassword}
                                    className={cn(
                                        'h-11 w-full rounded-xl border bg-background/50 px-3.5 text-sm font-medium outline-none transition-all',
                                        'focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500',
                                        errors.confirmPassword
                                            ? 'border-destructive text-destructive'
                                            : 'border-border hover:border-foreground/30'
                                    )}
                                    {...register('confirmPassword')}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-xs font-medium text-destructive">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border/80 bg-background/50 px-4 text-sm font-medium transition-all hover:bg-muted active:scale-[0.98]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-500 active:scale-[0.98] disabled:opacity-60"
                                >
                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
                                    Guardar contraseña
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
