"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Edit, Trash2, MapPin, CreditCard } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Reservation } from "@/types"

// User reservations overview page. Shows all reservations for the logged-in user and allows management actions.

export default function ReservationsPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

   // Fetch user reservations once session is available
  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      window.location.href = "/login?callbackUrl=/reservations"
      return
    }

    const fetchReservations = async () => {
      try {
        const response = await fetch("/api/reservations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        setReservations(data)
      } catch (error) {
        console.error("Error fetching reservations:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load reservations: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [session, status, toast])

  // Handles reservation cancellation by user, including API call and UI update
  const handleCancelReservation = async (id: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to cancel reservation")
      }

      setReservations(reservations.map(reservation => 
        reservation.id === id 
          ? { ...reservation, status: "CANCELLED" as const }
          : reservation
      ))

      toast({
        title: "Reservation cancelled",
        description: "Your reservation has been cancelled successfully.",
      })
    } catch (error) {
      console.error("Error cancelling reservation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel reservation. Please try again.",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500"
      case "CONFIRMED":
        return "bg-green-500"
      case "CANCELLED":
        return "bg-red-500"
      case "COMPLETED":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTariffBadgeColor = (tariff: string) => {
    switch (tariff) {
      case "BASIC":
        return "bg-gray-500"
      case "DISCOUNTED":
        return "bg-green-500"
      case "EXCLUSIVE":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const canEditReservation = (reservation: Reservation) => {
    return reservation.status === "PENDING" || reservation.status === "CONFIRMED"
  }

  const canCancelReservation = (reservation: Reservation) => {
    return reservation.status === "PENDING" || reservation.status === "CONFIRMED"
  }

  if (status === "loading") {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
        <div className="text-center">Loading session...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
        <div className="text-center">
          <p>Please log in to view your reservations.</p>
          <Button asChild className="mt-4">
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
        <Button asChild>
          <Link href="/vehicles">Make New Reservation</Link>
        </Button>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No reservations found</h2>
          <p className="text-muted-foreground mb-6">You havent made any reservations yet.</p>
          <Button asChild>
            <Link href="/vehicles">Browse Vehicles</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{reservation.vehicle.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={`${getStatusColor(reservation.status)} text-white`}>
                      {reservation.status.charAt(0) + reservation.status.slice(1).toLowerCase()}
                    </Badge>
                    <Badge variant="outline" className={`${getTariffBadgeColor(reservation.tariff)} text-white`}>
                      {reservation.tariff}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {reservation.vehicle.type} • {reservation.vehicle.category}
                </p>
              </CardHeader>
              <CardContent className="pb-2 flex-1">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Start:</span>
                      <div>{format(new Date(reservation.startDate), "MMM d, yyyy")}</div>
                      <div className="text-muted-foreground">{reservation.startTime}</div>
                    </div>
                    <div>
                      <span className="font-medium">End:</span>
                      <div>{format(new Date(reservation.endDate), "MMM d, yyyy")}</div>
                      <div className="text-muted-foreground">{reservation.endTime}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span className="font-medium">Pickup:</span>
                      <span className="text-muted-foreground">{reservation.pickupLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span className="font-medium">Return:</span>
                      <span className="text-muted-foreground">{reservation.returnLocation}</span>
                    </div>
                  </div>

                  {reservation.payment && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-3 w-3" />
                      <span className="font-medium">Payment:</span>
                      <span className="text-muted-foreground">{reservation.payment.paymentMethod}</span>
                      <Badge variant="outline" size="sm">
                        {reservation.payment.paymentStatus}
                      </Badge>
                    </div>
                  )}

                  <div className="text-lg font-semibold text-green-600">€{reservation.totalPrice.toFixed(2)}</div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex gap-2 w-full">
                  {canEditReservation(reservation) && (
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/reservations/${reservation.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  )}
                  {canCancelReservation(reservation) ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex-1">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Reservation?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently cancel your reservation for{" "}
                            {reservation.vehicle.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancelReservation(reservation.id)}>
                            Cancel Reservation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      {reservation.status === "CANCELLED" ? "Cancelled" : "Completed"}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
