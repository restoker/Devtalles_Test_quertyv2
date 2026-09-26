'use server';

import { auth } from "@/server/auth";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const getLevelsAction = async () => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/levels`, {
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
                msg: nestMsg(body, "Error al obtener los niveles"),
            };
        }

        return {
            ok: true as const,
            data: (body.data ?? []) as string[],
            msg: "Niveles obtenidos exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al obtener los niveles" };
    }
};
