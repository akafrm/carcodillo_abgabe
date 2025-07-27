/**
 * Locations API
 * 
 * Provides endpoints for location management:
 * - GET: Retrieve all active locations for pickup/return selection
 */
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { Location } from "@/types"

export const dynamic = 'force-dynamic'

/**
 * Retrieves all active locations
 * Public endpoint for location selection
 */
export async function GET(): Promise<Response> {
  try {
    const locations: Location[] = await prisma.location.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        city: "asc"
      }
    })

    return NextResponse.json(locations)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}