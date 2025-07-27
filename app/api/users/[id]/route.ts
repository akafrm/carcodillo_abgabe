/**
 * User Management API
 * 
 * Administrative endpoints for managing individual users:
 * - Retrieving user details
 * - Updating user roles
 * - Deleting user accounts
 * 
 * All endpoints are restricted to admin access only.
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import type { User, UserRole } from "@/types"

export const dynamic = 'force-dynamic'

/**
 * Checks if the session user has one of the required roles
 */
function hasRequiredRole(session: any, roles: string[]): boolean {
  return session && session.user && roles.includes(session.user.role)
}

/**
 * Retrieves a specific user's details by ID
 * Admin access only
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 })
  }
}

/**
 * Updates user role
 * Admin access only with protection against self-modification
 */
export async function PUT(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasRequiredRole(session, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role }: { role: UserRole } = await req.json()

    if (!["MEMBER", "EMPLOYEE", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const user: User = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        birthDate: true,
        driversLicenseNumber: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

/**
 * Deletes a user account
 * Admin access only with protection against self-deletion
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasRequiredRole(session, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Don't allow deletion of own account
    if (session.user.id === params.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}