/**
 * NextAuth API Route Handler
 * 
 * Configures NextAuth.js API endpoints for authentication.
 * Uses the centralized auth options from lib/auth.ts.
 * Exports both GET and POST handlers required by NextAuth.
 */
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }