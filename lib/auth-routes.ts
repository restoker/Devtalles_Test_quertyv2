export function authenticatedHome(role?: string | null) {
    return role?.toLowerCase() === "admin" ? "/admin/roadmaps" : "/";
}
