"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Vehicle, Location, VehicleCategory, FuelType, TransmissionType } from "@/types"
import { VEHICLE_FEATURES, VEHICLE_CATEGORY_LABELS, FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/constants"


// Admin vehicle detail and edit page. Lets admins view and update details for a specific vehicle.


export default function EditVehiclePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [available, setAvailable] = useState(true)
  const [imageUrl, setImageUrl] = useState("")

  const [category, setCategory] = useState<VehicleCategory>("ECONOMY")
  const [pricePerDay, setPricePerDay] = useState("50.0")
  const [location, setLocation] = useState("Bremen Central Station")
  const [features, setFeatures] = useState<string[]>([])
  const [fuelType, setFuelType] = useState<FuelType>("Gasoline")
  const [transmission, setTransmission] = useState<TransmissionType>("Manual")
  const [seats, setSeats] = useState("5")

  const vehicleId = params.id as string
  const isNewVehicle = vehicleId === "new"

  const [locations, setLocations] = useState<Location[]>([])

      // Fetches all Locations from API
    useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/locations")
        if (response.ok) {
          const data = await response.json()
          setLocations(data)
        }
      } catch (error) {
        console.error("Error fetching locations:", error)
      }
    }
    fetchLocations()
  }, [])


  /**
   * Auth check and vehicle loading.
   *
   * - Blocks access for non-admins or employees.
   * - Fetches vehicle data if editing an existing one.
   */
  useEffect(() => {
    if (status === "loading") return

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
      router.push("/")
      return
    }

    if (!isNewVehicle) {
      const fetchVehicle = async () => {
        try {
          const response = await fetch(`/api/vehicles/${vehicleId}`)
          if (!response.ok) throw new Error("Vehicle not found")

          const data: Vehicle = await response.json() 

          setName(data.name)
          setType(data.type)
          setCategory(data.category || "ECONOMY")
          setDescription(data.description)
          setAvailable(data.available)
          setImageUrl(data.imageUrl || "")
          setPricePerDay(data.pricePerDay ? data.pricePerDay.toString() : "50.0")
          setLocation(data.location || "Bremen Central Station")
          setFeatures(data.features || [])
          setFuelType(data.fuelType || "Gasoline")
          setTransmission(data.transmission || "Manual")
          setSeats(data.seats ? data.seats.toString() : "5")
        } catch (error) {
          console.error("Error fetching vehicle:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load vehicle details. Please try again.",
          })
          router.push("/admin/vehicles")
        } finally {
          setLoading(false)
        }
      }

      fetchVehicle()
    } else {
      setLoading(false)
    }
  }, [session, status, vehicleId, isNewVehicle, router, toast])

  /**
   * Handles form submit for creating or updating a vehicle.
   * Sends data to API and redirects on success.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const vehicleData = {
        name,
        type,
        category,
        description,
        available,
        imageUrl: imageUrl || null,
        pricePerDay: parseFloat(pricePerDay),
        location,
        features,
        fuelType,
        transmission,
        seats: parseInt(seats),
      }

      const url = isNewVehicle ? "/api/vehicles" : `/api/vehicles/${vehicleId}`
      const method = isNewVehicle ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehicleData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save vehicle")
      }

      toast({
        title: isNewVehicle ? "Vehicle created" : "Vehicle updated",
        description: isNewVehicle
          ? "The vehicle has been created successfully."
          : "The vehicle has been updated successfully.",
      })

      router.push("/admin/vehicles")
    } catch (error) {
      console.error("Error saving vehicle:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save vehicle. Please try again.",
      })
      setIsSubmitting(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">{isNewVehicle ? "Add Vehicle" : "Edit Vehicle"}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{isNewVehicle ? "Add Vehicle" : "Edit Vehicle"}</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/vehicles">Back to Vehicles</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Toyota Corolla"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="Sedan" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ECONOMY">{VEHICLE_CATEGORY_LABELS.ECONOMY}</SelectItem>
                  <SelectItem value="COMPACT">{VEHICLE_CATEGORY_LABELS.COMPACT}</SelectItem>
                  <SelectItem value="INTERMEDIATE">{VEHICLE_CATEGORY_LABELS.INTERMEDIATE}</SelectItem>
                  <SelectItem value="STANDARD">{VEHICLE_CATEGORY_LABELS.STANDARD}</SelectItem>
                  <SelectItem value="FULLSIZE">{VEHICLE_CATEGORY_LABELS.FULLSIZE}</SelectItem>
                  <SelectItem value="PREMIUM">{VEHICLE_CATEGORY_LABELS.PREMIUM}</SelectItem>
                  <SelectItem value="LUXURY">{VEHICLE_CATEGORY_LABELS.LUXURY}</SelectItem>
                  <SelectItem value="SUV">{VEHICLE_CATEGORY_LABELS.SUV}</SelectItem>
                  <SelectItem value="VAN">{VEHICLE_CATEGORY_LABELS.VAN}</SelectItem>
                  <SelectItem value="TRUCK">{VEHICLE_CATEGORY_LABELS.TRUCK}</SelectItem>
                  <SelectItem value="CONVERTIBLE">{VEHICLE_CATEGORY_LABELS.CONVERTIBLE}</SelectItem>
                  <SelectItem value="SPORTS">{VEHICLE_CATEGORY_LABELS.SPORTS}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pricePerDay">Price Per Day (€)</Label>
              <Input 
                id="pricePerDay" 
                type="number" 
                step="0.01" 
                min="0" 
                value={pricePerDay} 
                onChange={(e) => setPricePerDay(e.target.value)} 
                placeholder="50.00" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={location}
                onValueChange={setLocation}
              >
                <SelectTrigger id="location">
                  <SelectValue>
                    {location && locations.find(loc => loc.name === location) ? 
                      `${location} - ${locations.find(loc => loc.name === location)?.city}` : 
                      "Select location"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.name}>
                      {loc.name} - {loc.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger id="fuelType">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gasoline">{FUEL_TYPE_LABELS.Gasoline}</SelectItem>
                  <SelectItem value="Diesel">{FUEL_TYPE_LABELS.Diesel}</SelectItem>
                  <SelectItem value="Electric">{FUEL_TYPE_LABELS.Electric}</SelectItem>
                  <SelectItem value="Hybrid">{FUEL_TYPE_LABELS.Hybrid}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transmission">Transmission</Label>
              <Select value={transmission} onValueChange={setTransmission}>
                <SelectTrigger id="transmission">
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">{TRANSMISSION_LABELS.Manual}</SelectItem>
                  <SelectItem value="Automatic">{TRANSMISSION_LABELS.Automatic}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats">Seats</Label>
              <Input 
                id="seats" 
                type="number" 
                min="1" 
                max="20"
                value={seats} 
                onChange={(e) => setSeats(e.target.value)} 
                placeholder="5" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="grid grid-cols-2 gap-2">
                {VEHICLE_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`feature-${feature}`}
                      checked={features.includes(feature)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFeatures([...features, feature])
                        } else {
                          setFeatures(features.filter(f => f !== feature))
                        }
                      }}
                    />
                    <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A reliable and fuel-efficient sedan for everyday use."
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {imageUrl && (
                <div className="mt-2 aspect-video w-full max-w-sm overflow-hidden rounded-md border">
                  <div className="relative h-full w-full">
                    <Image
                      src={imageUrl || "/placeholder.svg?height=400&width=600"}
                      alt="Vehicle preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=400&width=600"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="available" checked={available} onCheckedChange={setAvailable} />
              <Label htmlFor="available">Available for rent</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/vehicles")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Vehicle"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}