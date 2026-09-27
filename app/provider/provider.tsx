"use client";

import React from "react";
import { ReactLenis } from "lenis/react";
import { Toaster } from "@/components/ui/toast";
import { SessionProvider } from "next-auth/react";

const Provider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider refetchOnWindowFocus={false}>
            {/* <ReactLenis root> */}
            <Toaster timeout={2000} limit={3} />
            {children}
            {/* </ReactLenis> */}
        </SessionProvider>
    );
};

export default Provider;