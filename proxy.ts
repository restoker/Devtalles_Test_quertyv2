import { auth } from "@/server/auth";
import { NextResponse } from "next/server";

function panelDestination(pathname: string) {
    if (pathname === "/panel" || pathname === "/panel/") return "/admin";
    if (pathname === "/panel/roadmaps" || pathname === "/panel/roadmaps/") {
        return "/admin/roadmaps/mios";
    }
    if (pathname.startsWith("/panel/roadmaps/globales")) {
        return "/admin/roadmaps/globales";
    }
    if (pathname.startsWith("/panel/cuestionarios")) {
        return pathname.replace("/panel/cuestionarios", "/admin/assessments");
    }
    const owned = pathname.match(/^\/panel\/roadmaps\/(\d+)\/?$/);
    if (owned) return `/admin/roadmaps/${owned[1]}`;
    return "/admin";
}

function userCanOpenAdminPath(pathname: string) {
    if (pathname === "/admin") return true;
    if (pathname === "/admin/profile" || pathname.startsWith("/admin/profile/")) return true;
    if (pathname.startsWith("/admin/roadmaps")) return true;
    if (pathname.startsWith("/admin/assessments")) return true;
    return false;
}

export default auth((req) => {
    const { pathname } = req.nextUrl;

    if (pathname === "/panel" || pathname.startsWith("/panel/")) {
        return NextResponse.redirect(new URL(panelDestination(pathname), req.nextUrl.origin));
    }

    const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
    if (!isAdminPath) return NextResponse.next();

    const role = req.auth?.user?.role?.toLowerCase();
    if (role === "admin") return NextResponse.next();

    if (!req.auth) {
        const login = new URL("/login", req.nextUrl.origin);
        login.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(login);
    }

    if (userCanOpenAdminPath(pathname)) return NextResponse.next();

    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
});

export const config = {
    matcher: ["/admin", "/admin/:path*", "/panel", "/panel/:path*"],
};
