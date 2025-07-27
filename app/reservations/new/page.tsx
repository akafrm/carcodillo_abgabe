"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock, MapPin, CreditCard } from "lucide-react"
import { billingEngine } from "@/lib/billing-engine"
import type { Vehicle } from "@/types"
import { TARIFFS, PAYMENT_METHODS, TIME_SLOTS } from "@/lib/constants"

// Reservation creation page. Lets users book a new vehicle reservation with all required details.

export default function NewReservationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get("vehicleId")
  const { data: session, status } = useSession()
  const { toast } = useToast()

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)

  const pickupLocationParam = searchParams.get("pickupLocation")
  const startDateParam = searchParams.get("startDate")
  const endDateParam = searchParams.get("endDate")
  const startTimeParam = searchParams.get("startTime")
  const endTimeParam = searchParams.get("endTime")

  const [pickupLocation, setPickupLocation] = useState(pickupLocationParam || "")
  const [returnLocation, setReturnLocation] = useState(pickupLocationParam || "")
  const [startDate, setStartDate] = useState<Date | undefined>(startDateParam ? new Date(startDateParam) : undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(endDateParam ? new Date(endDateParam) : undefined)
  const [startTime, setStartTime] = useState<string>(startTimeParam || "09:00")
  const [endTime, setEndTime] = useState<string>(endTimeParam || "18:00")
  const [tariff, setTariff] = useState("BASIC")
  const [paymentMethod, setPaymentMethod] = useState("PAYPAL")
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Authentication check and vehicle data loading.
   * 
   * - Ensures the user is logged in and has the right role
   * - Redirects to login if not authenticated
   * - Fetches vehicle details from the API
   * - Sets default pickup/return locations based on vehicle location
   */
  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login?callbackUrl=/reservations/new" + (vehicleId ? `?vehicleId=${vehicleId}` : ""))
      return
    }

    if (session.user.role !== "MEMBER") {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only members can make reservations.",
      })
      router.push("/vehicles")
      return
    }

    if (!vehicleId) {
      router.push("/vehicles")
      return
    }

    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`)

        if (!response.ok) {
          throw new Error("Vehicle not found")
        }

        const data = await response.json()
        setVehicle(data)
        setPickupLocation(data.location)
        setReturnLocation(data.location)
      } catch (error) {
        console.error("Error fetching vehicle:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load vehicle details. Please try again.",
        })
        router.push("/vehicles")
      } finally {
        setLoading(false)
      }
    }

    fetchVehicle()
  }, [session, status, vehicleId, router, toast])

  /**
   * Calculates the total price for the reservation
   * based on selected dates, vehicle price, and tariff option.
   * 
   * @returns number - The calculated total price
   */
  const calculateTotalPrice = () => {
    if (!vehicle || !startDate || !endDate) return 0

    const calculation = billingEngine.calculatePrice(vehicle.pricePerDay, startDate, endDate, tariff)

    return calculation.totalPrice
  }

  /**
   * Handles form submission to create a new reservation.
   * Performs validation checks before sending data to the API.
   * 
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation checks
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

    if (!pickupLocation || !returnLocation) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select pickup and return locations.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const totalPrice = calculateTotalPrice()

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create reservation")
      }

      toast({
        title: "Reservation Created",
        description: "Your reservation has been created successfully.",
      })

      router.push("/reservations")
    } catch (error) {
      console.error("Error creating reservation:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create reservation. Please try again.",
      })
      setIsSubmitting(false)
    }
  }

  // Loading and not-found fallback states
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <p>Loading...</p>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <p>Vehicle not found</p>
      </div>
    )
  }

  const totalPrice = calculateTotalPrice()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">New Reservation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Info */}
        <Card>
          <CardHeader>
            <CardTitle>{vehicle.name}</CardTitle>
            <CardDescription>
              {vehicle.type} • {vehicle.category}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>{vehicle.description}</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{vehicle.location}</span>
              </div>
              <div className="text-lg font-semibold">€{vehicle.pricePerDay}/Day</div>
              <div className="flex flex-wrap gap-1">
                {vehicle.features.map((feature, index) => (
                  <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Reservation Details</CardTitle>
              <CardDescription>Configure your rental details</CardDescription>
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
                  <div className="w-full border rounded px-2 py-1 bg-gray-100">{pickupLocation}</div>
                </div>
                <div className="space-y-2">
                  <Label>Return Location</Label>
                  <div className="w-full border rounded px-2 py-1 bg-gray-100">{returnLocation}</div>
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
                  <h3 className="font-semibold mb-2">Price Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>
                        Base Price ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days)
                      </span>
                      <span>
                        €
                        {(
                          Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) *
                          vehicle.pricePerDay
                        ).toFixed(2)}
                      </span>
                    </div>
                    {tariff !== "BASIC" && (
                      <div className="flex justify-between">
                        <span>Tariff Adjustment</span>
                        <span>
                          {TARIFFS.find((t) => t.id === tariff)?.discount! > 0 ? "-" : "+"}
                          {Math.abs(TARIFFS.find((t) => t.id === tariff)?.discount! * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting || !startDate || !endDate}>
                {isSubmitting ? "Creating Reservation..." : `Reserve for €${totalPrice.toFixed(2)}`}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
