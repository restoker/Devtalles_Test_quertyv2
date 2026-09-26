"use server";

import { auth } from "@/server/auth";
import type { AdminUser } from "@/types/user-admin-schema";
import { nestMsg } from "./_nest-msg";

export const searchUsersAction = async (key: string) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/user/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.tokenAuth}`,
            },
            body: JSON.stringify({ key }),
        });
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al buscar usuarios"),
            };
        }

        return {
            ok: true as const,
            data: (body.data ?? []) as AdminUser[],
            msg: "Búsqueda completada",
        };
    } catch {
        return { ok: false as const, msg: "Error al buscar usuarios" };
    }
};
