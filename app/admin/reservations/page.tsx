"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { RESERVATION_STATUS_COLORS, RESERVATION_STATUS_LABELS } from "@/lib/constants"

// Using local interface here, as there were problems with the index.ts file

// Admin reservations management page. Allows admins to view, filter, and manage all reservations in the system.

interface Reservation {
  id: string
  startDate: string
  endDate: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  vehicle: {
    id: string
    name: string
  }
  user: {
    id: string
    name: string
    email: string
  }
}

export default function AdminReservationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  /**
   * Enforces access control and fetches reservation data.
   *
   * Preconditions:
   * - User must be logged in and have ADMIN or EMPLOYEE role.
   *
   * Postconditions:
   * - Reservations state is populated on success.
   * - Error toast is shown and loading ends on failure.
   */
  useEffect(() => {
    if (status === "loading") return

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
      router.push("/")
      return
    }

    const fetchReservations = async () => {
      try {
        const response = await fetch("/api/reservations")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch reservations")
        }

        setReservations(data)
      } catch (error) {
        console.error("Error fetching reservations:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load reservations. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [session, status, router, toast])

  /**
   * Sends a status update for a reservation to the backend,
   * and updates local state to reflect the new status.
   *
   * @param reservationId ID of the reservation to update
   * @param newStatus New status to set
   */
  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update reservation status")
      }

      setReservations(
        reservations.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: newStatus as Reservation["status"] }
            : reservation,
        ),
      )

      toast({
        title: "Status updated",
        description: `Reservation status has been updated to ${newStatus.toLowerCase()}.`,
      })
    } catch (error) {
      console.error("Error updating reservation status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update reservation status. Please try again.",
      })
    }
  }

  /**
   * Deletes a reservation from the backend,
   * then removes it from the local state list.
   *
   * @param reservationId ID of the reservation to delete
   */
  const handleDeleteReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete reservation")
      }

      setReservations(reservations.filter((r) => r.id !== reservationId))

      toast({
        title: "Reservation deleted",
        description: "The reservation has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting reservation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete reservation. Please try again.",
      })
    }
  }

  /**
   * Returns a Tailwind background color class based on status value.
   *
   * @param status Reservation status
   * @return Tailwind class string
   */
  const getStatusColor = (status: string) => {
    return RESERVATION_STATUS_COLORS[status as keyof typeof RESERVATION_STATUS_COLORS] || "bg-gray-500"
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Manage Reservations</h1>
        <Card>
          <CardHeader>
            <CardTitle>Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Manage Reservations</h1>

      <Card>
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No reservations found</h2>
              <p className="text-muted-foreground">There are currently no reservations in the system.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div className="font-medium">{reservation.user.name}</div>
                      <div className="text-sm text-muted-foreground">{reservation.user.email}</div>
                    </TableCell>
                    <TableCell>{reservation.vehicle.name}</TableCell>
                    <TableCell>
                      <div>{format(new Date(reservation.startDate), "MMM d, yyyy")}</div>
                      <div className="text-sm text-muted-foreground">
                        to {format(new Date(reservation.endDate), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(reservation.status)} text-white`}>
                        {RESERVATION_STATUS_LABELS[reservation.status as keyof typeof RESERVATION_STATUS_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Select
                          defaultValue={reservation.status}
                          onValueChange={(value) => handleStatusChange(reservation.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Change status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">{RESERVATION_STATUS_LABELS.PENDING}</SelectItem>
                            <SelectItem value="CONFIRMED">{RESERVATION_STATUS_LABELS.CONFIRMED}</SelectItem>
                            <SelectItem value="CANCELLED">{RESERVATION_STATUS_LABELS.CANCELLED}</SelectItem>
                            <SelectItem value="COMPLETED">{RESERVATION_STATUS_LABELS.COMPLETED}</SelectItem>
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the reservation.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteReservation(reservation.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
