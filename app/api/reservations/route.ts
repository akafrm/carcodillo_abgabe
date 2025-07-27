/**
 * Reservations API
 * 
 * Handles core reservation operations:
 * - Listing reservations with appropriate access control per role
 * - Creating new reservations with availability checking
 * - Integrated payment record creation
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions, hasRequiredRole } from "@/lib/auth"
import type { Reservation, TariffType, PaymentMethod, ReservationStatus, PaymentStatus } from "@/types"

export const dynamic = 'force-dynamic'

/**
 * Fetches reservations with role-based access control
 * - Members: Can only view their own reservations
 * - Staff: Can view all reservations or filter by user
 */
export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = hasRequiredRole(session, ["ADMIN", "EMPLOYEE"])

    const reservations: Reservation[] = await prisma.reservation.findMany({
      where: isAdmin ? {} : { userId: session.user.id },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            pricePerDay: true,
            location: true,
            imageUrl: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payment: {
          select: {
            id: true,
            paymentMethod: true,
            paymentStatus: true,
            amount: true,
            currency: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}

/**
 * Creates a new reservation with payment record
 * Includes validation for:
 * - Vehicle availability
 * - Date range conflicts
 * - User permissions
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasRequiredRole(session, ["MEMBER", "EMPLOYEE", "ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      vehicleId,
      startDate,
      endDate,
      startTime,
      endTime,
      pickupLocation,
      returnLocation,
      tariff,
      totalPrice,
      paymentMethod,
    }: {
      vehicleId: string
      startDate: string
      endDate: string
      startTime: string
      endTime: string
      pickupLocation: string
      returnLocation: string
      tariff: TariffType 
      totalPrice: number
      paymentMethod: PaymentMethod 
    } = body

    if (!vehicleId || !startDate || !endDate || !startTime || !endTime || 
        !pickupLocation || !returnLocation || !tariff || !totalPrice || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    if (start < now) {
      return NextResponse.json({ error: "Start date cannot be in the past" }, { status: 400 })
    }

    if (end <= start) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
    }

    const actualUserId = session.user.id

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: actualUserId },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
      select: {
        id: true,
        name: true,
        available: true,
        location: true,
        pricePerDay: true
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 400 })
    }

    if (!vehicle.available) {
      return NextResponse.json({ error: "Vehicle not available" }, { status: 400 })
    }

    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        vehicleId,
        status: { in: ["PENDING", "CONFIRMED"] as ReservationStatus[] }, 
        OR: [
          {
            startDate: { lte: start },
            endDate: { gte: start },
          },
          {
            startDate: { lte: end },
            endDate: { gte: end },
          },
          {
            startDate: { gte: start },
            endDate: { lte: end },
          },
        ],
      },
    })

    if (overlappingReservations.length > 0) {
      return NextResponse.json({ 
        error: "Vehicle already reserved for this time period",
        conflictingReservations: overlappingReservations.map((r: any) => ({
          id: r.id,
          startDate: r.startDate,
          endDate: r.endDate
        }))
      }, { status: 400 })
    }

    const validTariffs: TariffType[] = ["BASIC", "DISCOUNTED", "EXCLUSIVE"]
    const validPaymentMethods: PaymentMethod[] = ["CREDIT_CARD", "PAYPAL", "BANK_TRANSFER"]

    if (!validTariffs.includes(tariff)) {
      return NextResponse.json({ error: "Invalid tariff" }, { status: 400 })
    }

    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          startDate: start,
          endDate: end,
          startTime,
          endTime,
          pickupLocation,
          returnLocation,
          status: "PENDING" as ReservationStatus,
          tariff,
          totalPrice,
          userId: actualUserId,
          vehicleId,
        },
      })

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          amount: totalPrice,
          currency: "EUR",
          paymentMethod,
          paymentStatus: "PENDING" as PaymentStatus, 
          userId: actualUserId,
          reservationId: reservation.id,
        },
      })

      return { reservation, payment }
    })

    const completeReservation: Reservation = await prisma.reservation.findUnique({
      where: { id: result.reservation.id },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            pricePerDay: true,
            location: true,
            imageUrl: true,
            fuelType: true,
            transmission: true,
            seats: true,
            features: true
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: {
          select: {
            id: true,
            paymentMethod: true,
            paymentStatus: true,
            amount: true,
            currency: true,
            transactionId: true,
            createdAt: true
          },
        },
      },
    }) as Reservation 



    return NextResponse.json(completeReservation, { status: 201 })
  } catch (error) {
    console.error("Error creating reservation:", error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Error creating reservation",
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Error creating reservation" }, { status: 500 })
  }
}