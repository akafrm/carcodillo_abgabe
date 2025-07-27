"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import type { Vehicle } from "@/types"

// Admin vehicles management page. Allows admins to view, add, edit, and remove vehicles from the fleet.

export default function AdminVehiclesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  /**
   * Access control and vehicle fetch.
   *
   * - Redirects non-admin/non-employee users to home.
   * - Loads vehicle list on first render.
   */
  useEffect(() => {
    if (status === "loading") return

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
      router.push("/")
      return
    }

    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch vehicles")
        }

        setVehicles(data)
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
  }, [session, status, router, toast])

  /**
   * Deletes a vehicle via API and updates local state.
   *
   * @param id ID of the vehicle to delete
   */
  const handleDeleteVehicle = async (id: string) => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete vehicle")
      }

      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id))

      toast({
        title: "Vehicle deleted",
        description: "The vehicle has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete vehicle. Please try again.",
      })
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Manage Vehicles</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Vehicles</CardTitle>
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Vehicles</h1>
        <Button asChild>
          <Link href="/admin/vehicles/new">Add Vehicle</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No vehicles found</h2>
              <p className="text-muted-foreground mb-6">There are currently no vehicles in the system.</p>
              <Button asChild>
                <Link href="/admin/vehicles/new">Add Vehicle</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>{vehicle.type}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.available ? "default" : "secondary"}>
                        {vehicle.available ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/vehicles/${vehicle.id}`}>Edit</Link>
                        </Button>
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
                                This action cannot be undone. This will permanently delete the vehicle and all
                                associated reservations.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteVehicle(vehicle.id)}>
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
