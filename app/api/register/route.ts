/**
 * User Registration API
 * 
 * Handles new user account creation with:
 * - Email uniqueness validation
 * - Password hashing for secure storage
 * - Age verification (minimum 18 years)
 * - Driver's license validation
 */
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

/**
 * Processes new user registration requests
 */
export async function POST(req: Request) {
  try {
    const { name, email, password, birthDate, driversLicenseNumber } = await req.json()

    // Email validation
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Password validation
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }
    if (password.length < 5) {
      return NextResponse.json({ error: "Password must be at least 5 characters long" }, { status: 400 })
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const existingLicense = await prisma.user.findUnique({
      where: {
        driversLicenseNumber,
      },
    })
    if (existingLicense) {
      return NextResponse.json({ error: "Driver's license number already in use" }, { status: 400 })
    }

    if (!birthDate) {
      return NextResponse.json({ error: "Birth date is required" }, { status: 400 })
    }
    const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 18) {
      return NextResponse.json({ error: "You must be at least 18 years old" }, { status: 400 })
    }
    if (!driversLicenseNumber) {
      return NextResponse.json({ error: "Driver's license number is required" }, { status: 400 })
    }
    if (driversLicenseNumber.length < 5) {
      return NextResponse.json({ error: "Driver's license number must be at least 5 characters long" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "MEMBER",
        birthDate: new Date(birthDate),
        driversLicenseNumber,
      },
    })

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Error creating user" }, { status: 500 })
  }
}