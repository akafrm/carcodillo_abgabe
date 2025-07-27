/**
 * Single Reservation API
 * 
 * Handles operations on individual reservations:
 * - Fetching reservation details with access control
 * - Updating reservation data
 * - Cancelling reservations
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/prisma"
import { authOptions, hasRequiredRole } from "@/lib/auth"

/**
 * Fetches a single reservation by ID
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            pricePerDay: true,
            location: true,
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
            paymentMethod: true,
            paymentStatus: true,
          },
        },
      },
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    if (session.user.role === "MEMBER" && reservation.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json(reservation)

  } catch (error) {
    console.error("Error fetching reservation:", error)
    return NextResponse.json({ 
      error: "Failed to fetch reservation",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 })
  }
}

/**
 * Updates a reservation
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      startDate,
      endDate,
      startTime,
      endTime,
      pickupLocation,
      returnLocation,
      tariff,
      totalPrice,
      paymentMethod,
      status, 
    } = body

    const existingReservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingReservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    const isAdmin = hasRequiredRole(session, ["ADMIN", "EMPLOYEE"])
    const isOwner = session.user.id === existingReservation.userId

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
    if (!isAdmin && !["PENDING", "CONFIRMED"].includes(existingReservation.status)) {
      return NextResponse.json({ 
        error: "Cannot edit reservation with status: " + existingReservation.status 
      }, { status: 400 })
    }

    let updateData: any = {}

    if (isAdmin && status) {
      updateData.status = status
    }

    if (startDate) updateData.startDate = new Date(startDate)
    if (endDate) updateData.endDate = new Date(endDate)
    if (startTime) updateData.startTime = startTime
    if (endTime) updateData.endTime = endTime
    if (pickupLocation) updateData.pickupLocation = pickupLocation
    if (returnLocation) updateData.returnLocation = returnLocation
    if (tariff) updateData.tariff = tariff
    if (totalPrice) updateData.totalPrice = totalPrice

    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: updateData,
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            pricePerDay: true,
            location: true,
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
            paymentMethod: true,
            paymentStatus: true,
          },
        },
      },
    })

    if (paymentMethod && existingReservation.payment) {
      await prisma.payment.updateMany({
        where: { reservationId: params.id },
        data: { paymentMethod }
      })
    }

    return NextResponse.json(updatedReservation)

  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 })
  }
}

/**
 * Deletes/Cancels a reservation
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingReservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingReservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    const isAdmin = hasRequiredRole(session, ["ADMIN", "EMPLOYEE"])
    const isOwner = session.user.id === existingReservation.userId

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (!["PENDING", "CONFIRMED"].includes(existingReservation.status)) {
      return NextResponse.json({ 
        error: "Cannot cancel reservation with status: " + existingReservation.status 
      }, { status: 400 })
    }


    await prisma.payment.updateMany({
      where: { reservationId: params.id },
      data: { paymentStatus: "REFUNDED" }
    })

    return NextResponse.json({ message: "Reservation cancelled successfully, payment refunded!" })

  } catch (error) {
    console.error("Error cancelling reservation:", error)
    return NextResponse.json({ error: "Failed to cancel reservation" }, { status: 500 })
  }
}