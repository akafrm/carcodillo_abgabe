"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2, Shield, Globe } from "lucide-react"
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
import type { User } from "@/types"
import { COUNTRIES } from "@/lib/constants"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("Germany")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [driversLicenseNumber, setDriversLicenseNumber] = useState("")

  /**
   * Loads the user profile from the server.
   * Redirects to login if session is missing.
   */
  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login?callbackUrl=/profile")
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile")
        if (!response.ok) throw new Error("Failed to fetch profile")

        const data = await response.json()

        setProfile(data)
        setName(data.name)
        setPhone(data.phone || "")
        setAddress(data.address || "")
        setCity(data.city || "")
        setCountry(data.country || "Germany")
        setBirthDate(data.birthDate ? data.birthDate.substring(0, 10) : "")
        setDriversLicenseNumber(data.driversLicenseNumber || "")
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, status, router, toast])

  /**
   * Sends updated profile data to the server.
   * Updates session name and shows toast on success.
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, city, country, birthDate }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to update profile")

      await update({ name })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Changes the user's password.
   * Validates new password match and calls backend API.
   */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match.",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to change password")

      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Deletes the user account from the server.
   * Signs the user out on success.
   */
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)

    try {
      const response = await fetch("/api/profile", { method: "DELETE" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete account")
      }

      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      })

      await signOut({ callbackUrl: "/" })
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account. Please try again.",
      })
      setIsDeletingAccount(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

      <div className="grid gap-8">
        {/* Profile*/}
        <Card>
          <form onSubmit={handleUpdateProfile}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile?.email || ""} disabled />
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+49 15781040698"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={profile?.role || ""} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Your street 1"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Bremen" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birthdate</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driversLicenseNumber">DL number</Label>
                  <Input
                    id="driversLicenseNumber"
                    type="text"
                    value={driversLicenseNumber}
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Change pw */}
        <Card>
          <form onSubmit={handleChangePassword}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Changing Password..." : "Change Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Del acc*/}
        {session?.user?.role === "MEMBER" && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account all your reservations and data will be permanently deleted.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeletingAccount}>
                    {isDeletingAccount ? "Deleting..." : "Delete My Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Once you delete your account all your reservations and data will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                      Yes, delete account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
