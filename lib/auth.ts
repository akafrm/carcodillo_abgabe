/**
 * Authentication Configuration
 * 
 * Configures NextAuth.js for credential-based authentication with:
 * - JWT session strategy
 * - Email/password credential validation
 * - User role management
 * - Custom login page routing
 */
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Validates user credentials against database records
       * Performs password verification using bcrypt
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (isPasswordValid) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
     //Enhances the JWT token with user data
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        }
      }
      return token
    },
    // Adds user data to the session object
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        },
      }
    },
  },
  pages: {
    signIn: "/login",
  },
}

/**
 * Checks if user has one of the allowed roles
 * 
 * @param session - User session object
 * @param allowedRoles - Array of role names that are permitted
 * @returns Boolean indicating if user has required access
 */
export function hasRequiredRole(session: any, allowedRoles: string[]) {
  return session?.user?.role && allowedRoles.includes(session.user.role as string)
}