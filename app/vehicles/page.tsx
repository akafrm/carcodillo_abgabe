"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Filter, MapPin, Users, Fuel, Settings } from "lucide-react"
import { format } from "date-fns"
import type { Vehicle, Location} from "@/types"
import { VEHICLE_CATEGORY_LABELS, TIME_SLOTS } from "@/lib/constants"


// Vehicle listing and filtering page. Lets users browse, filter, and check availability of vehicles.

const categories = [
  { value: "ALL", label: "All Categories" },
  ...Object.entries(VEHICLE_CATEGORY_LABELS).map(([key, label]) => ({
    value: key,
    label
  }))
]

export default function VehiclesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [selectedStation, setSelectedStation] = useState<string>("ALL")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endTime, setEndTime] = useState<string>("18:00")
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
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

  // Fetches all vehicles from the API and sets local state.
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch vehicles")
        }

        setVehicles(data)
        setFilteredVehicles(data)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load vehicles. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [toast])

  useEffect(() => {
    let filtered = vehicles
    if (selectedStation && selectedStation !== "ALL") {
      filtered = filtered.filter((vehicle) => vehicle.location === selectedStation)
    }
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((vehicle) => vehicle.category === selectedCategory)
    }
    setFilteredVehicles(filtered)
  }, [selectedCategory, selectedStation, vehicles])

  // Checks vehicle availability for the selected date range by querying the API.
  useEffect(() => {
    const checkAvailability = async () => {
      
      if (!startDate || !endDate) {
        setAvailability({})
        return
      }
      
      const available: Record<string, boolean> = {}
      
      try {
        vehicles.forEach(vehicle => {
          available[vehicle.id] = true
        })

        const res = await fetch(`/api/reservations/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        if (!res.ok) throw new Error("Failed to fetch availability data")
        
        const bookedVehicleIds = await res.json()
        
        bookedVehicleIds.forEach((vehicleId: string) => {
          available[vehicleId] = false
        })
        
        setAvailability(available)
      } catch (error) {
        console.error("Error checking availability:", error)

        vehicles.forEach(vehicle => {
          available[vehicle.id] = true
        })
        setAvailability(available)
      }
    }
    
    checkAvailability()
  }, [vehicles, startDate, endDate])

  // Returns a color class for the given vehicle category.
  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      ECONOMY: "bg-green-500",
      COMPACT: "bg-blue-500",
      INTERMEDIATE: "bg-yellow-500",
      STANDARD: "bg-orange-500",
      FULLSIZE: "bg-purple-500",
      PREMIUM: "bg-indigo-500",
      LUXURY: "bg-pink-500",
      SUV: "bg-red-500",
      VAN: "bg-gray-500",
      TRUCK: "bg-stone-500",
      CONVERTIBLE: "bg-cyan-500",
      SPORTS: "bg-rose-500",
    }
    return colors[category] || "bg-gray-500"
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Available Vehicles</h1>
        {(session?.user?.role === "ADMIN" || session?.user?.role === "EMPLOYEE") && (
          <Button asChild>
            <Link href="/admin/vehicles/new">Add Vehicle</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:gap-4">
            <div className="flex-1">
              <Select value={selectedStation} onValueChange={val => setSelectedStation(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pickup location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Stations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.name}>
                      {loc.name} - {loc.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <input type="date" className="w-full border rounded px-2 py-1" value={startDate ? format(startDate, 'yyyy-MM-dd') : ''} onChange={e => setStartDate(e.target.value ? new Date(e.target.value) : null)} />
            </div>
            <div className="flex-1">
              <input type="date" className="w-full border rounded px-2 py-1" value={endDate ? format(endDate, 'yyyy-MM-dd') : ''} onChange={e => setEndDate(e.target.value ? new Date(e.target.value) : null)} />
            </div>
            <div className="flex-1">
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger><SelectValue placeholder="Pickup time" /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger><SelectValue placeholder="Return time" /></SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video w-full">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No vehicles found</h2>
          <p className="text-muted-foreground mb-6">
            {selectedCategory === "ALL"
              ? "There are currently no vehicles available for rent."
              : `No vehicles found in the ${categories.find((c) => c.value === selectedCategory)?.label} category.`}
          </p>
          {selectedCategory !== "ALL" && <Button onClick={() => setSelectedCategory("ALL")}>Show All Vehicles</Button>}
          {(session?.user?.role === "ADMIN" || session?.user?.role === "EMPLOYEE") && (
            <Button asChild className="ml-2">
              <Link href="/admin/vehicles/new">Add Vehicle</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles
            .filter(vehicle => {
              // Filter by location first
              if (selectedStation !== "ALL" && vehicle.location !== selectedStation) {
                return false;
              }
              
              // If no dates selected, show all vehicles that match location
              if (!startDate || !endDate) return true;
              
              // Only filter out vehicles we KNOW are unavailable
              return availability[vehicle.id] !== false;
            })
            .map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden flex flex-col">
                <div className="aspect-video w-full bg-muted relative">
                  {vehicle.imageUrl ? (
                    <Image
                      src={vehicle.imageUrl || "/placeholder.svg"}
                      alt={vehicle.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=400&width=600"
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getCategoryBadgeColor(vehicle.category)} text-white`}>{vehicle.category}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{vehicle.name}</span>
                    <span className="text-lg font-bold text-green-600">€{vehicle.pricePerDay}/day</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <p className="text-sm">{vehicle.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{vehicle.seats} seats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      <span>{vehicle.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      <span>{vehicle.transmission}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{vehicle.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                    {vehicle.features.length > 3 && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">+{vehicle.features.length - 3} more</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {session?.user?.role === "MEMBER" ? (
                    <Button asChild className="w-full" disabled={!availability[vehicle.id]}>
                      <Link href={`/reservations/new?vehicleId=${vehicle.id}&pickupLocation=${encodeURIComponent(selectedStation)}&startDate=${startDate?.toISOString() || ''}&endDate=${endDate?.toISOString() || ''}&startTime=${startTime}&endTime=${endTime}`}>
                        Reserve Now
                      </Link>
                    </Button>
                  ) : !session ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login?callbackUrl=/vehicles">Log in to Reserve</Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={`/admin/vehicles/${vehicle.id}`}>Manage Vehicle</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}