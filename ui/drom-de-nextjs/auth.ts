import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';  // credentials provider allows users to log in with a username and a password.
import { z } from 'zod';
import {CustomerField, CustomersTableType, User} from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string) {
    try {
        // TODO: replace this with API request to a real backend API
        const usersResp = await fetch("http://localhost:8000/users",
            {method: "GET"},
        );
        const _ = await usersResp.json();
        return {id: "410544b2-4001-4271-9855-fec4b6a6442a", name: "User", email: "user@nextmail.com", password: "123456"};
    } catch (err) {
        console.error('Backend API Error:', err);
        throw new Error('Failed to fetch user by email.');
    }
}

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [Credentials({     // TODO: add different providers: OAuth, email, github, gmail, etc.
        async authorize(credentials) {
            const parsedCredentials = z
                .object({ email: z.string().email(), password: z.string().min(6) })
                .safeParse(credentials);
            if (parsedCredentials.success) {
                const { email, password } = parsedCredentials.data;
                const user = await getUser(email);
                if (!user) return null;
                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (passwordsMatch) return user;
            }

            console.log('Incorrect credentials.');
            return null;
        },
    })],
});