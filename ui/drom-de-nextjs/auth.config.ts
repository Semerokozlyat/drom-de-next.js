import type { NextAuthConfig } from 'next-auth';

// Application auth config.
// The logic of "callbacks" section is required to protect your routes. This will prevent users from accessing the dashboard pages unless they are logged in.
// The "authorized" callback is used to verify if the request is authorized to access a page via Next.js Middleware.
export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;