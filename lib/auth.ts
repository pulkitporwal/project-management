import { compare } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { User } from "@/models/User";
import connectDB from "./db";

// ⛔ IMPORTANT: Auth.js v5 uses "NextAuth" from next-auth BUT NOT OLD SYNTAX
export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt",
    },

    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", required: true },
                password: { label: "Password", type: "password", required: true },
            },

            // Auth.js v5 correct authorize signature
            async authorize({ email, password }) {
                await connectDB();

                if (!email || !password) return null;

                // Find user by email
                const user = await User.findOne({ email }).select("+passwordHash");

                if (!user || !user.passwordHash) return null;

                // Compare hashed password
                const isValid = await compare((password as string), user.passwordHash);
                if (!isValid) return null;

                // Auth.js expects a plain object (NOT mongoose document)
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    jobTitle: user.jobTitle,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.department = user.department;
                token.jobTitle = user.jobTitle;
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role;
                session.user.department = token.department;
                session.user.jobTitle = token.jobTitle;
            }
            return session;
        },
    },

    pages: {
        signIn: "/auth/signin",
    },
});
