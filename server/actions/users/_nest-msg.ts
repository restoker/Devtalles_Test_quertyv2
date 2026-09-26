/** Nest error body: { message: string | string[], statusCode } */
export function nestMsg(
    body: { message?: string | string[] } | null | undefined,
    fallback: string
): string {
    const m = body?.message;
    if (Array.isArray(m)) return m.filter(Boolean).join(", ") || fallback;
    if (typeof m === "string" && m.trim()) return m;
    return fallback;
}
