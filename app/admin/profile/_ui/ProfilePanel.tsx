import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type ProfileDetail = {
    label: string;
    value: string;
};

export type ProfilePanelProps = {
    fullName: string;
    initials: string;
    email: string;
    image?: string | null;
    details: ProfileDetail[];
    error?: string | null;
};

export default function ProfilePanel({
    fullName,
    initials,
    email,
    image,
    details,
    error,
}: ProfilePanelProps) {
    return (
        <div className="mx-auto w-full max-w-3xl space-y-8 py-2 sm:py-6">
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Tu cuenta
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    Mi perfil
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Datos de la sesión con la que iniciaste sesión.
                </p>
            </div>

            {error ? (
                <div className="rounded-2xl border border-destructive/25 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                    {error}
                </div>
            ) : null}

            <section className="rounded-[1.6rem] border border-border/60 bg-card/95 p-6 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/10">
                <div className="flex items-center gap-4">
                    <Avatar className="size-14 ring-2 ring-purple-600/20">
                        {image ? <AvatarImage src={image} alt={fullName} /> : null}
                        <AvatarFallback className="bg-purple-600/15 text-sm font-semibold text-purple-700 dark:bg-purple-900/50 dark:text-purple-200">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-foreground">{fullName}</h2>
                        <p className="truncate text-sm text-muted-foreground">{email}</p>
                    </div>
                </div>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    {details.map((item) => (
                        <div key={item.label}>
                            <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
                            <dd className="mt-1 text-sm font-medium text-foreground">{item.value}</dd>
                        </div>
                    ))}
                </dl>
            </section>
        </div>
    );
}
