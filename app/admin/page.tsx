"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, Calendar, Users } from "lucide-react"

// Admin dashboard. Entry point for managing vehicles, reservations, and users.
// Redirects non-admins and non-employees away from the admin dashboard.

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  /**
   * Blocks access for users without admin or employee roles.
   * Triggers redirect after session is loaded.
   */
  useEffect(() => {
    if (status === "loading") return

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
      router.push("/")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <p>Loading...</p>
      </div>
    )
  }

  // Block rendering for unauthorized users after redirect fallback.
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EMPLOYEE")) {
    return null
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Vehicles</div>
            <p className="text-xs text-muted-foreground">Add, edit, and remove vehicles from the system</p>
            <Button asChild className="w-full mt-4">
              <Link href="/admin/vehicles">View Vehicles</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Reservations</div>
            <p className="text-xs text-muted-foreground">View and manage all user reservations</p>
            <Button asChild className="w-full mt-4">
              <Link href="/admin/reservations">View Reservations</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Users</div>
            <p className="text-xs text-muted-foreground">View and manage user accounts</p>
            <Button asChild className="w-full mt-4">
              <Link href="/admin/users">View Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
