/**
 * Vehicles API
 * 
 * Provides endpoints to manage the vehicle fleet:
 * - GET: Public endpoint to list all available vehicles
 * - POST: Protected endpoint for staff to create new vehicles
 * 
 * Vehicle data includes all specifications needed for the reservation system.
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions, hasRequiredRole } from "@/lib/auth"
import type { Vehicle, VehicleFormData, ApiResponse } from "@/types"

export const dynamic = 'force-dynamic'

 // Retrieves all vehicles in the system
export async function GET(): Promise<Response> {
  try {
    const vehicles: Vehicle[] = await prisma.vehicle.findMany({
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
      },
      orderBy: {
        name: "asc"
      }
    })
    
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

/**
 * Creates a new vehicle in the system
 * Restricted to staff roles (ADMIN, EMPLOYEE)
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasRequiredRole(session, ["ADMIN", "EMPLOYEE"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data: VehicleFormData = await req.json()

    const vehicle: Vehicle = await prisma.vehicle.create({
      data: {
        name: data.name,
        type: data.type,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl,
        available: data.available,
        pricePerDay: data.pricePerDay,
        location: data.location,
        features: data.features,
        fuelType: data.fuelType,
        transmission: data.transmission,
        seats: data.seats
      }
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
  }
}