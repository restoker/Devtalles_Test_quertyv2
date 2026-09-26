'use server';

import { actionClient } from "@/lib/action-client";
import { registerSchema } from "@/types/register-schema";

export interface RegisterResponse {
    ok: boolean;
    msg: string;
}

type RegisterErrorBody = {
    message?: string | string[];
    errors?: string[];
};

function registerErrorMessage(body: RegisterErrorBody | null): string {
    const errors = body?.errors?.filter(Boolean) ?? [];
    if (errors.length > 0) return errors.join(". ");

    const message = Array.isArray(body?.message) ? body.message.join(". ") : body?.message;
    if (message === "Unable to create the account") {
        return "Ese correo ya tiene una cuenta. Si entraste con Discord, inicia sesión con Discord.";
    }
    if (typeof message === "string" && message.trim() && message !== "Validation failed") {
        return message;
    }
    return "No se pudo crear la cuenta";
}

export const registerAction = actionClient
    .inputSchema(registerSchema)
    .action(async ({ parsedInput: { firstName, lastName, email, password } }) => {
        const sanitizedEmail = email.trim().toLowerCase();
        const url = process.env.ADDRESS_SERVER;

        try {
            const response = await fetch(`${url}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName.trim().toLowerCase(),
                    last_name: lastName.trim().toLowerCase(),
                    email: sanitizedEmail,
                    password,
                }),
            });
            const data = (await response.json().catch(() => null)) as
                | (RegisterErrorBody & { data?: unknown })
                | null;

            if (!response.ok || !data?.data) {
                return {
                    ok: false,
                    msg: registerErrorMessage(data),
                }
            }

            return {
                ok: true,
                msg: 'Cuenta creada. Ya puedes iniciar sesión.',
            }
        } catch {
            return {
                ok: false,
                msg: 'No se pudo conectar con el servidor',
            }
        }
    });
