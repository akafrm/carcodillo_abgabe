"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Car, User, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const navItems = [
    { name: "Home", href: "/", show: true },
    { name: "Vehicles", href: "/vehicles", show: true },
    { name: "My Reservations", href: "/reservations", show: !!session },
    { name: "Admin", href: "/admin", show: session?.user?.role === "ADMIN" || session?.user?.role === "EMPLOYEE" },
  ]

  return (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image 
              src="/carcodillo.png" 
              alt="Carcodillo Logo" 
              width={40} 
              height={40} 
            />
            <span>Carcodillo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="hidden md:flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        Role: {session.user?.role?.toLowerCase()}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems
                  .filter((item) => item.show)
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        isActive(item.href) ? "text-primary" : "text-muted-foreground"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}

                {session ? (
                  <>
                    <Link
                      href="/profile"
                      className="text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setOpen(false)}
                    >
                      Profile
                    </Link>
                    <Button
                      variant="ghost"
                      className="justify-start p-0 h-auto font-medium"
                      onClick={() => {
                        signOut()
                        setOpen(false)
                      }}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      className="text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
