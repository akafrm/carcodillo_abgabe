/**
 * Individual Vehicle API
 * 
 * Provides endpoints for managing specific vehicle resources:
 * - GET: Retrieve detailed information about a specific vehicle
 * - PUT: Update vehicle details (staff only)
 * - DELETE: Remove vehicle from system (staff only)
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions, hasRequiredRole } from "@/lib/auth"
import type { Vehicle, VehicleFormData } from "@/types"

/**
 * Retrieves a specific vehicle by ID
 * Available to all users, authenticated or not
 */
export async function GET(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const vehicle: Vehicle | null = await prisma.vehicle.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        description: true,
        imageUrl: true,
        available: true,
        pricePerDay: true,
        location: true,
        features: true,
        fuelType: true,
        transmission: true,
        seats: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error("Error fetching vehicle:", error)
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 })
  }
}

/**
 * Updates vehicle information
 * Restricted to staff roles (ADMIN, EMPLOYEE)
 */
export async function PUT(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasRequiredRole(session, ["ADMIN", "EMPLOYEE"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data: Partial<VehicleFormData> = await req.json()

    const vehicle: Vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
        ...(data.category && { category: data.category }),
        ...(data.description && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.available !== undefined && { available: data.available }),
        ...(data.pricePerDay && { pricePerDay: data.pricePerDay }),
        ...(data.location && { location: data.location }),
        ...(data.features && { features: data.features }),
        ...(data.fuelType && { fuelType: data.fuelType }),
        ...(data.transmission && { transmission: data.transmission }),
        ...(data.seats && { seats: data.seats })
      }
    })

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error("Error updating vehicle:", error)
    return NextResponse.json({ error: "Error updating vehicle" }, { status: 500 })
  }
}

 // Removes a vehicle from the system
export async function DELETE(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasRequiredRole(session, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.vehicle.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
  }
}