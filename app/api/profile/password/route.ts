/**
 * Profile Password Change API
 * 
 * Provides an endpoint for authenticated users to change their account password.
 * Validates the current password before allowing changes.
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"


 // Handles password change requests via PUT method
export async function PUT(req: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract password data from request
    const { currentPassword, newPassword } = await req.json()

    // Retrieve user with password for verification
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id as string,
      },
      select: {
        id: true,
        password: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password is correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    
    // Validate new password
    if (!newPassword) {
      return NextResponse.json({ error: "New password is required" }, { status: 400 })
    }
    if (newPassword.length < 5) {
      return NextResponse.json({ error: "New password must be at least 5 characters long" }, { status: 400 })
    }

    // Hash new password for security
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in database
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Error changing password" }, { status: 500 })
  }
}