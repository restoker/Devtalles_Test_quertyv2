'use server';

import { auth } from "@/server/auth";
import type { RoadmapView } from "@/types/roadmap-schema";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const getRoadmapAction = async (id: number) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/roadmaps/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.tokenAuth}`,
            },
        });
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al obtener el roadmap"),
            };
        }

        return {
            ok: true as const,
            data: body as RoadmapView,
            msg: "Roadmap obtenido exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al obtener el roadmap" };
    }
};
