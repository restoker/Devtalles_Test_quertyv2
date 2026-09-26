import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import gitHub from 'next-auth/providers/github';
import discord from 'next-auth/providers/discord';
import { loginSchema } from "@/types/login-schema";
import { ExtendUser } from "@/next-auth";

type ApiAccount = {
    id?: string;
    email?: string;
    role?: string | null;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    lastname?: string | null;
    image?: string | null;
};

function applyAccount(
    token: { sub?: string; name?: string | null; email?: string | null; role?: string | null; lastname?: string | null; image?: string | null; tokenAuth?: string },
    account: ApiAccount,
    accessToken?: string,
) {
    if (account.id) token.sub = account.id;
    if (account.email) token.email = account.email;
    if (account.role) token.role = account.role;
    const name = account.name || account.firstName;
    const lastname = account.lastname || account.lastName;
    if (name) token.name = name;
    if (lastname) token.lastname = lastname;
    if (account.image) token.image = account.image;
    if (accessToken) token.tokenAuth = accessToken;
    return token;
}

async function refreshAccount(token: { sub?: string; name?: string | null; email?: string | null; role?: string | null; lastname?: string | null; image?: string | null; tokenAuth?: string }) {
    if (!token.tokenAuth) return token;

    try {
        const response = await fetch(`${process.env.ADDRESS_SERVER}/api/auth/renovated`, {
            headers: { Authorization: `Bearer ${token.tokenAuth}` },
            cache: "no-store",
        });
        if (!response.ok) return token;

        const body = await response.json();
        const account = body?.data?.user as ApiAccount | undefined;
        if (!account) return token;

        applyAccount(token, account, body.data.token);
    } catch {
        return token;
    }

    return token;
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // console.log({ token });
            // console.log({ account });
            // console.log({ user });
            const usuario = user as ExtendUser;
            // if (token) {
            //     token.name = user.name;-
            //     token.email = user.email;
            //     token.role = user.role;
            //     token.image = user.image;
            //     return token;
            // }
            if (user) {
                applyAccount(token, usuario, usuario.tokenAuth);
            }

            if (account && account.provider === 'discord') {
                console.log('Hay account :D');
                // token: 
                //   {
                //     name: 'restoker12',
                //     email: 'milthon.doom@gmail.com',
                //     picture: 'https://cdn.discordapp.com/embed/avatars/3.png',
                //     sub: '00081720-79fd-4a78-b6c5-3e617b5dd4de'
                //   }
                // acccount: 
                //   {
                //     token_type: 'bearer',
                //     access_token: 'MTQxNzY2Njc1ODA0NjY0NjMxNA.H95iEmVESVwEuejqp6SDoRp9bSXbZN',
                //     expires_in: 604800,
                //     refresh_token: 'flrF2JUh5tSWXr24klxC1el2EFweDq',
                //     scope: 'identify email',
                //     expires_at: 1758754551,
                //     provider: 'discord',
                //     type: 'oauth',
                //     providerAccountId: '450025853502488588'
                //   }


                // const existsAccount = await fetch(`${process.env.ADDRESS_SERVER}/api/auth/discord/custom-user/${account.providerAccountId}`, {
                //     method: "GET",
                //     headers: {
                //         "Content-Type": "application/json",
                //     },
                // });
                // if (existsAccount.ok) {
                //     const existsAccountJson = await existsAccount.json();
                //     // token.isOauth = true;
                //     token.name = existsAccountJson.user.name;
                //     token.email = existsAccountJson.user.email;
                //     token.role = existsAccountJson.user.role;
                //     token.image = existsAccountJson.user.image;
                //     return token;
                // }
                //    si no existe el usuario crear usuario en la base de datos
                const newAccount = await fetch(`${process.env.ADDRESS_SERVER}/api/auth/discord/custom-login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: token,
                        account: account,
                    }),
                });
                if (!newAccount.ok) return token;
                const newAccountJson = await newAccount.json();
                // console.log({ newAccountJson });
                // token.isOauth = true;
                if (!newAccountJson.ok) return token;
                token.name = newAccountJson.data.user.name;
                token.email = newAccountJson.data.user.email;
                token.role = newAccountJson.data.user.role;
                token.image = newAccountJson.data.user.image;
                token.tokenAuth = newAccountJson.data.access_token;
                return token;
            }


            if (user || !token.role || !token.name) {
                return refreshAccount(token);
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub ?? "";
                session.user.role = token.role ?? null;
                session.user.name = token.name ?? "";
                session.user.lastname = token.lastname ?? "";
                session.user.email = token.email ?? "";
                session.user.image = (token.image as string | null) ?? null;
                session.user.tokenAuth = token.tokenAuth ?? "";
            }
            return session;
        },
    },
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                discordTicket: { label: "Discord ticket", type: "text" },
            },
            authorize: async (credentials) => {
                const discordTicket = credentials?.discordTicket;
                if (typeof discordTicket === 'string' && discordTicket.length > 0) {
                    const exchanged = await fetch(`${process.env.ADDRESS_SERVER}/api/auth/discord/exchange`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code: discordTicket }),
                    });
                    const exchangedJson = await exchanged.json();
                    const session = exchangedJson.data;
                    if (!session?.accessToken || !session?.user) return null;

                    return {
                        id: session.user.id,
                        name: session.user.firstName,
                        lastname: session.user.lastName ?? '',
                        email: session.user.email,
                        role: session.user.role,
                        image: null,
                        tokenAuth: session.accessToken,
                    };
                }

                const validatedFields = loginSchema.safeParse(credentials);
                if (validatedFields.success) {

                    const { email, password, } = validatedFields.data;

                    const user = await fetch(`${process.env.ADDRESS_SERVER}/api/auth/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email,
                            password,
                        }),
                    });

                    const userJson = await user.json();
                    // console.log(userJson.data);

                    const profile = userJson.data?.user as ApiAccount | undefined;
                    const accessToken = userJson.data?.accessToken as string | undefined;
                    if (!profile?.id || !accessToken) return null;

                    return {
                        id: String(profile.id),
                        name: profile.firstName ?? profile.name ?? "",
                        email: profile.email ?? "",
                        lastname: profile.lastName ?? profile.lastname ?? "",
                        role: profile.role ?? null,
                        image: profile.image ?? null,
                        tokenAuth: accessToken,
                    };
                    // }
                    // if (!passCorrect) return null;
                }
                return null;
            }
        }),
        gitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        discord({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
        }),
    ]
})