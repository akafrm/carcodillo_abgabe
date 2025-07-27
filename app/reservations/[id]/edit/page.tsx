"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock, MapPin, CreditCard, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { billingEngine } from "@/lib/billing-engine"
import type { Reservation } from "@/types"
import { TARIFFS, PAYMENT_METHODS, TIME_SLOTS } from "@/lib/constants"

// Edit page for an existing reservation.
// Loads reservation, verifies user, and allows update of key fields.

export default function EditReservationPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  // Form state variables
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("18:00")
  const [pickupLocation, setPickupLocation] = useState("")
  const [returnLocation, setReturnLocation] = useState("")
  const [tariff, setTariff] = useState("BASIC")
  const [paymentMethod, setPaymentMethod] = useState("PAYPAL")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reservationId = params.id as string

  /**
   * Loads reservation from API and verifies that:
   * - session is active and user is logged in
   * - user has role MEMBER
   * - reservation exists and belongs to current user
   * - reservation is editable (PENDING or CONFIRMED)
   */
  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login?callbackUrl=/reservations")
      return
    }

    if (session.user.role !== "MEMBER") {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only members can edit reservations.",
      })
      router.push("/reservations")
      return
    }

    const fetchReservation = async () => {
      try {
        const response = await fetch(`/api/reservations/${reservationId}`)

        if (!response.ok) {
          throw new Error("Reservation not found")
        }

        const data = await response.json()

        if (data.user.id !== session.user.id) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You can only edit your own reservations.",
          })
          router.push("/reservations")
          return
        }

        if (data.status !== "PENDING" && data.status !== "CONFIRMED") {
          toast({
            variant: "destructive",
            title: "Cannot Edit",
            description: "This reservation cannot be edited anymore.",
          })
          router.push("/reservations")
          return
        }

        // Defaults to make it easier to work with for the user
        setReservation(data)
        setStartDate(new Date(data.startDate))
        setEndDate(new Date(data.endDate))
        setStartTime(data.startTime)
        setEndTime(data.endTime)
        setPickupLocation(data.pickupLocation)
        setReturnLocation(data.returnLocation)
        setTariff(data.tariff)
        setPaymentMethod(data.payment?.paymentMethod || "CREDIT_CARD")
      } catch (error) {
        console.error("Error fetching reservation:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load reservation details. Please try again.",
        })
        router.push("/reservations")
      } finally {
        setLoading(false)
      }
    }

    fetchReservation()
  }, [session, status, reservationId, router, toast])

  /**
   * Calculates the updated total price
   * based on the selected dates and tariff.
   *
   * @returns number
   */
  const calculateTotalPrice = () => {
    if (!reservation || !startDate || !endDate) return 0

    const calculation = billingEngine.calculatePrice(reservation.vehicle.pricePerDay, startDate, endDate, tariff)

    return calculation.totalPrice
  }

  /**
   * Submits the updated reservation data to the backend.
   * Validates dates before sending.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both start and end dates.",
      })
      return
    }

    if (startDate > endDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "End date must be after start date.",
      })
      return
    }

    if (startDate < new Date()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Start date must be in the future.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const totalPrice = calculateTotalPrice()

      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          startTime,
          endTime,
          pickupLocation,
          returnLocation,
          tariff,
          totalPrice,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update reservation")
      }

      toast({
        title: "Reservation Updated",
        description: "Your reservation has been updated successfully.",
      })

      router.push("/reservations")
    } catch (error) {
      console.error("Error updating reservation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update reservation. Please try again.",
      })
      setIsSubmitting(false)
    }
  }

  // Loading and not-found fallback
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <p>Loading...</p>
      </div>
    )
  }

  if (!reservation) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <p>Reservation not found</p>
      </div>
    )
  }

  const totalPrice = calculateTotalPrice()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/reservations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Reservation</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{reservation.vehicle.name}</CardTitle>
            <CardDescription>
              {reservation.vehicle.type} • {reservation.vehicle.category}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{reservation.vehicle.location}</span>
              </div>
              <div className="text-lg font-semibold">€{reservation.vehicle.pricePerDay}/Day</div>
              <div className="text-sm text-muted-foreground">
                Current Status: <span className="font-medium">{reservation.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Update Reservation Details</CardTitle>
              <CardDescription>Modify your rental details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="flex-1">
                        <input type="date" className="w-full border rounded px-2 py-1" value={startDate ? format(startDate, 'yyyy-MM-dd') : ''} onChange={e => setStartDate(e.target.value ? new Date(e.target.value) : null)} />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                       <div className="flex-1">
                        <input type="date" className="w-full border rounded px-2 py-1" value={endDate ? format(endDate, 'yyyy-MM-dd') : ''} onChange={e => setEndDate(e.target.value ? new Date(e.target.value) : null)} />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pickup Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Return Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger>
                      <Clock className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Pickup Location</Label>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{pickupLocation}</span>
                    <span className="text-xs text-muted-foreground ml-auto">Cannot be changed</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Return Location</Label>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{returnLocation}</span>
                    <span className="text-xs text-muted-foreground ml-auto">Cannot be changed</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tariff</Label>
                <Select value={tariff} onValueChange={setTariff}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARIFFS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex flex-col">
                          <span>{t.name}</span>
                          <span className="text-xs text-muted-foreground">{t.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.icon} {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {startDate && endDate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Updated Price Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Original Price</span>
                      <span>€{reservation.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        New Price ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days)
                      </span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Price Difference</span>
                      <span className={totalPrice > reservation.totalPrice ? "text-red-600" : "text-green-600"}>
                        {totalPrice > reservation.totalPrice ? "+" : ""}€
                        {(totalPrice - reservation.totalPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" asChild>
                <Link href="/reservations">Cancel</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting || !startDate || !endDate}>
                {isSubmitting ? "Updating..." : `Update Reservation`}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
