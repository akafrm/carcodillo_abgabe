"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
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
import type { User, UserRole } from "@/types"

// Admin users management page. Lets admins view, search, and manage all user accounts in the system.

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  /**
   * Protects the page and loads user list for admins.
   *
   * Preconditions:
   * - Session must be loaded and user must be ADMIN.
   *
   * Postconditions:
   * - Populates the user list or shows an error toast on failure.
   */
  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/")
      return
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch users")
        }

        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [session, status, router, toast])

  /**
   * Updates the role of a user via API and local state.
   *
   * @param userId Target user ID
   * @param newRole New role to assign
   */
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) throw new Error("Failed to update user role")

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role. Please try again.",
      })
    }
  }


  /**
   * Deletes a user from the backend and updates local state.
   * Blocks deletion of the current admin user.
   *
   * @param userId ID of the user to delete
   */
  const handleDeleteUser = async (userId: string) => {
    if (userId === session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You cannot delete your own account.",
      })
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete user")
      }

      setUsers(users.filter((user) => user.id !== userId))

      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user. Please try again.",
      })
    }
  }

  /**
   * Maps a user role to a Tailwind CSS badge color.
   *
   * @param role User role
   * @returns Tailwind background class string
   */
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500"
      case "EMPLOYEE":
        return "bg-blue-500"
      case "MEMBER":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
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
      <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No users found</h2>
              <p className="text-muted-foreground">There are currently no users in the database.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                          disabled={user.id === session?.user?.id}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Change role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="EMPLOYEE">Employee</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={user.id === session?.user?.id}
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user and all associated
                                reservations.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
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
