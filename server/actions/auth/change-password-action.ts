"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth";

function nestMsg(
    body: { message?: string | string[] } | null | undefined,
    fallback: string
): string {
    const m = body?.message;
    if (Array.isArray(m)) return m.filter(Boolean).join(", ") || fallback;
    if (typeof m === "string" && m.trim()) return m;
    return fallback;
}

export const changePasswordAction = async (input: {
    password: string;
    userId?: string;
}) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const payload: { password: string; userId?: string } = {
            password: input.password,
        };
        if (input.userId) {
            payload.userId = input.userId;
        }

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/auth/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.tokenAuth}`,
            },
            body: JSON.stringify(payload),
        });
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al cambiar la contraseña"),
            };
        }

        revalidatePath("/admin/users");
        return {
            ok: true as const,
            data: body.data,
            msg: nestMsg(
                { message: body.data?.message ?? body.message },
                "Contraseña actualizada exitosamente"
            ),
        };
    } catch {
        return { ok: false as const, msg: "Error al cambiar la contraseña" };
    }
};
