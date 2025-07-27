/**
 * Vehicle Availability API
 * 
 * Provides an endpoint to check which vehicles are available for reservation
 * during a specified date range. Used by the reservation system to filter out
 * vehicles that are already booked.
 */
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

/**
 * Checks vehicle availability for a given date range
 * Returns the IDs of vehicles that are already booked in that period
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 })
    }
    
    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            startDate: { lte: new Date(startDate) },
            endDate: { gte: new Date(startDate) },
          },
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(endDate) },
          },
          {
            startDate: { gte: new Date(startDate) },
            endDate: { lte: new Date(endDate) },
          },
        ],
      },
      select: {
        vehicleId: true
      }
    })
    
    const bookedVehicleIds = overlappingReservations.map(res => res.vehicleId)
    
    return NextResponse.json(bookedVehicleIds)
  } catch (error) {
    console.error("Error checking availability:", error)
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 })
  }
}