import { DefaultSession } from "next-auth";

export type ExtendUser = DefaultSession['user'] & {
    id: string;
    name: string;
    lastname: string;
    email: string;
    image: string | null;
    role: string | null;
    tokenAuth: string;
}

declare module 'next-auth' {
    interface Session {
        user: ExtendUser
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: string | null
        lastname?: string | null
        tokenAuth?: string
    }
}