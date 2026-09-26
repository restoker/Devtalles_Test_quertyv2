import DiscordCallback from "./_ui/discord-callback";

export default async function DiscordAuthPage({
    searchParams,
}: {
    searchParams: Promise<{ code?: string; error?: string }>;
}) {
    const { code, error } = await searchParams;

    return <DiscordCallback code={code} error={error} />;
}
