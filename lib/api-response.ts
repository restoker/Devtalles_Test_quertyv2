// The backend (NestJS) wraps every payload in an envelope:
//   single resource → { data: T }
//   collections     → { data: T[], meta: {...} }
// Older endpoints may still return the bare payload, so both shapes are accepted.
// Always prefer these helpers over `body as T` casts in server actions.

export function unwrap<T>(body: unknown): T | undefined {
    if (body !== null && typeof body === "object" && "data" in body) {
        return (body as { data: T }).data;
    }
    return body as T | undefined;
}

export function unwrapList<T>(body: unknown): T[] {
    const data = unwrap<T[] | T>(body);
    return Array.isArray(data) ? data : [];
}
