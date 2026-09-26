"use server";

import { auth } from "@/server/auth";
import type { AdminUser } from "@/types/user-admin-schema";
import { nestMsg } from "./_nest-msg";

export const getUserAction = async (id: string) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/user/${id}`, {
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
                msg: nestMsg(body, "Error al obtener el usuario"),
            };
        }

        return {
            ok: true as const,
            data: body.data as AdminUser,
            msg: "Usuario obtenido exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al obtener el usuario" };
    }
};
