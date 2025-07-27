/**
 * User Profile API
 * 
 * Provides endpoints for profile management operations:
 * - GET: Retrieve the authenticated user's profile data
 * - PUT: Update user profile information
 * - DELETE: Remove user account (self-service for members only)
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import type { User } from "@/types"

export const dynamic = 'force-dynamic'

/**
 * Retrieves the current user's profile information
 */
export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user: User | null = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
/**
 * Updates user profile information
 * Allows changing personal details but not sensitive fields
 */
export async function PUT(req: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, phone, address, city, country, birthDate } = await req.json()

    const user: User = await prisma.user.update({
      where: {
        id: session.user.id as string,
      },
      data: {
        name,
        phone,
        address,
        city,
        country,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      },
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
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Error updating profile" }, { status: 500 })
  }
}


/**
 * Deletes user account
 * Only available to MEMBER users 
 */
export async function DELETE(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow members to delete their own accounts
    if (session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Only members can delete their accounts" }, { status: 403 })
    }

    await prisma.user.delete({
      where: { id: session.user.id }
    })

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}