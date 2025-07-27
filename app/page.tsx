"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

// Landing page, introduces the service and provides quick access to main features.
export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col items-center justify-center space-y-12 text-center py-12">
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col items-center">
          <Image 
            src="/carcodillo.png" 
            alt="Carcodillo Logo" 
            width={120} 
            height={120} 
            className="mb-4" 
          />
          <h1 className="text-4xl font-bold tracking-tight text-center">Carcodillo</h1>
        </div>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Rent easily. Browse our offers and make your reservation today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/vehicles">Browse Collection</Link>
          </Button>
          {!session && (
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Create Account</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
          <div className="p-3 rounded-full bg-primary/10">
            <Image 
              src="/favicon.ico" 
              alt="Carcodillo Logo" 
              width={32} 
              height={32} 
            />
          </div>
          <h3 className="text-xl font-bold">Wide Selection</h3>
          <p className="text-muted-foreground text-center">
            Choose from our diverse fleet of vehicles to suit your needs.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
          <div className="p-3 rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Easy Booking</h3>
          <p className="text-muted-foreground text-center">Simple reservation process with real-time availability.</p>
        </div>

        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
          <div className="p-3 rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Secure</h3>
          <p className="text-muted-foreground text-center">
            Your data is protected with our secure authentication system, more or less.
          </p>
        </div>

      </div>
    </div>
  )
}
