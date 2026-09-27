'use server';

import { auth } from "@/server/auth";
import { unwrapList } from "@/lib/api-response";
import type { CursoItem } from "@/types/curso-schema";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const getCursosAction = async (opts?: {
    limit?: number;
    offset?: number;
    level?: string;
}) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const params = new URLSearchParams({
            limit: String(opts?.limit ?? 100),
            offset: String(opts?.offset ?? 0),
        });
        if (opts?.level) params.set("level", opts.level);

        const resp = await fetch(`${url}/api/admin/courses?${params}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.tokenAuth}`,
            },
            cache: "no-store",
        });
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al obtener los cursos"),
            };
        }

        return {
            ok: true as const,
            data: unwrapList<CursoItem>(body),
            msg: "Cursos obtenidos exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al obtener los cursos" };
    }
};
