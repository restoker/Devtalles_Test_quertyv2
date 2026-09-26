'use server';

import { actionClient } from "@/lib/action-client";
import { signIn } from "@/server/auth";
import { redirect } from "next/navigation";
import z from "zod";

export interface DiscordAuthResponse {
    ok: boolean;
    msg: string;
}

export async function discordLoginAction() {
    const url = process.env.ADDRESS_SERVER?.replace(/\/$/, '');
    if (!url) {
        redirect('/login');
    }

    redirect(`${url}/api/auth/discord`);
}

const exchangeDiscordSchema = z.object({
    code: z.string().min(1),
});

export const exchangeDiscordAction = actionClient
    .inputSchema(exchangeDiscordSchema)
    .action(async ({ parsedInput: { code } }): Promise<DiscordAuthResponse> => {
        try {
            const session = await signIn('credentials', {
                discordTicket: code,
                redirect: false,
            });

            if (!session || session.error) {
                return {
                    ok: false,
                    msg: 'No se pudo completar el acceso con Discord',
                };
            }

            return {
                ok: true,
                msg: 'Sesión iniciada con Discord',
            };
        } catch {
            return {
                ok: false,
                msg: 'No se pudo completar el acceso con Discord',
            };
        }
    });
