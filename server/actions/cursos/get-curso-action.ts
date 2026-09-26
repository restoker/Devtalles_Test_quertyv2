'use server';

import { auth } from "@/server/auth";
import type { CursoItem } from "@/types/curso-schema";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const getCursoAction = async (id: number) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/admin/courses/${id}`, {
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
                msg: nestMsg(body, "Error al obtener el curso"),
            };
        }

        if (!body.data) {
            return { ok: false as const, msg: "Error al obtener el curso" };
        }

        return {
            ok: true as const,
            data: body.data as CursoItem,
            msg: "Curso obtenido exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al obtener el curso" };
    }
};
