'use server';

import { actionClient } from "@/lib/action-client";
import { signIn } from "@/server/auth";
import { loginSchema } from "@/types/login-schema";

const LOGIN_ERROR = "No se pudo iniciar sesión. Intenta de nuevo.";

export const loginAction = actionClient
    .inputSchema(loginSchema)
    .action(async ({ parsedInput: { email, password } }) => {
        try {
            const sanitizedEmail = email.trim().toLowerCase();
            const url = process.env.ADDRESS_SERVER;
            const user = await fetch(`${url}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: sanitizedEmail, password })
            });
            const data = await user.json();
            if (!user.ok || !data?.data) {
                return {
                    ok: false as const,
                    msg: LOGIN_ERROR,
                }
            }

            const session = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (!session || (typeof session === "object" && "error" in session && session.error)) {
                return {
                    ok: false as const,
                    msg: LOGIN_ERROR,
                }
            }

            return {
                ok: true as const,
                msg: 'Bienvenido de nuevo',
            }
        } catch {
            return {
                ok: false as const,
                msg: LOGIN_ERROR,
            }
        }
    })