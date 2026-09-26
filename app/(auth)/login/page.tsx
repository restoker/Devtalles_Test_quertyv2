import { auth } from "@/server/auth";
import { authenticatedHome } from "@/lib/auth-routes";
import AuthSectionOne from "./_ui/auth-section-1";
import { redirect } from "next/navigation";

export default async function Login() {
    const session = await auth();
    if (session?.user) {
        redirect(authenticatedHome(session.user.role));
    }
    return (
        <div>
            <AuthSectionOne />
        </div>
    );
}