"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { X } from "lucide-react"

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookie-consent")
    if (!cookieConsent) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShowConsent(false)
  }

const declineCookies = () => {
  localStorage.setItem("cookie-consent", "declined-except-essential");
  setShowConsent(false);
}

  if (!showConsent) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="container mx-auto max-w-screen-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-base font-medium mb-1">Cookie Notice</h3>
            <p className="text-sm text-muted-foreground">
              This website uses cookies to improve your experience. By using our website, 
              you agree to our <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={declineCookies}>
              Decline
            </Button>
            <Button size="sm" onClick={acceptCookies}>
              Accept
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 md:hidden" 
            onClick={declineCookies}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}