import { compare } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { User, Organization } from "@/models";
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

                // Find user by email with organization associations
                const user = await User.findOne({ email })
                    .select("+password")
                    .populate({
                        path: 'associatedWith.organisationId',
                        select: 'name',
                        match: { isActive: true }
                    });

                if (!user || !user.password) return null;

                const isValid = await compare((password as string), user.password);
                if (!isValid) return null;

                if (!user.emailVerified) {
                    throw new Error('Email not verified');
                }

                // Get user's organizations
                const organizations = user.associatedWith
                    .filter((assoc: any) => assoc.isActive && assoc.organisationId)
                    .map((assoc: any) => ({
                        id: assoc.organisationId._id.toString(),
                        name: assoc.organisationId.name,
                        role: assoc.role
                    }));

                // Auth.js expects a plain object (NOT mongoose document)
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    jobTitle: user.jobTitle,
                    currentOrganization: user.currentOrganization?.toString(),
                    organizations,
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
                token.currentOrganization = user.currentOrganization;
                token.organizations = user.organizations;
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role;
                session.user.department = token.department;
                session.user.jobTitle = token.jobTitle;
                session.user.currentOrganization = token.currentOrganization as string;
                session.user.organizations = token.organizations as Array<{
                    id: string;
                    name: string;
                    role: "admin" | "manager" | "employee";
                }>;
            }
            return session;
        },
    },

    pages: {
        signIn: "/auth/signin",
    },
});
