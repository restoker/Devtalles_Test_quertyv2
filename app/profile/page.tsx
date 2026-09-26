import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/app/(home)/_ui/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/server/auth";
import { getUserAction } from "@/server/actions/users/get-user-action";
import { ROLE_LABELS, type UserRole } from "@/types/user-admin-schema";

function roleLabel(role?: string | null) {
    const key = role?.toLowerCase() as UserRole | undefined;
    if (key && key in ROLE_LABELS) return ROLE_LABELS[key];
    return role || "Usuario";
}

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login?callbackUrl=/profile");
    }

    const user = session.user;
    const fetched = user.id ? await getUserAction(user.id) : null;
    const account = fetched?.ok ? fetched.data : null;

    const fullName = account
        ? [account.firstName, account.lastName].filter(Boolean).join(" ")
        : [user.name, user.lastname].filter(Boolean).join(" ") || user.email || "Usuario";
    const initials = (
        account
            ? (account.firstName?.[0] || "") + (account.lastName?.[0] || "")
            : (user.name?.[0] || "") + (user.lastname?.[0] || user.name?.[1] || "")
    ).toUpperCase() || "U";
    const email = account?.email ?? user.email;
    const role = roleLabel(account?.role ?? user.role);

    const details = [
        { label: "Correo", value: email || "—" },
        { label: "Rol", value: role },
        ...(account
            ? [
                  { label: "Dirección", value: account.address || "—" },
                  { label: "Estado", value: account.isActive ? "Activo" : "Inactivo" },
                  { label: "Discord", value: account.discordId ? "Conectado" : "No conectado" },
              ]
            : []),
    ];

    return (
        <div className="min-h-dvh bg-white dark:bg-gray-900">
            <Navbar />
            <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
                <p className="text-sm font-medium text-purple-600">Tu cuenta</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                    Mi perfil
                </h1>
                <p className="mt-3 text-neutral-600 dark:text-neutral-400">
                    Datos de la sesión con la que iniciaste sesión.
                </p>

                <section className="mt-10 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-14 ring-2 ring-purple-600/20">
                            {user.image ? <AvatarImage src={user.image} alt={fullName} /> : null}
                            <AvatarFallback className="text-sm font-semibold bg-purple-600/15 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-semibold text-neutral-950 dark:text-white">
                                {fullName}
                            </h2>
                            <p className="truncate text-sm text-neutral-500">{email}</p>
                        </div>
                    </div>

                    <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                        {details.map((item) => (
                            <div key={item.label}>
                                <dt className="text-xs font-medium text-neutral-500">{item.label}</dt>
                                <dd className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {item.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <div className="mt-10 flex flex-wrap gap-4 text-sm font-medium">
                    <Link href="/" className="text-purple-600 hover:text-purple-700">
                        Volver al inicio
                    </Link>
                    <Link
                        href="/admin"
                        className="text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                    >
                        Ir al panel
                    </Link>
                </div>
            </main>
        </div>
    );
}
