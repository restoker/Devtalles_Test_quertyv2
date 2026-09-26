import { auth } from "@/server/auth";
import { authenticatedHome } from "@/lib/auth-routes";
import AuthSectionTwo from "./_ui/auth-section-2";
import { redirect } from "next/navigation";

export default async function Register() {
    const session = await auth();
    if (session?.user) {
        redirect(authenticatedHome(session.user.role));
    }
    return (
        <div>
            <AuthSectionTwo />
        </div>
    );
}