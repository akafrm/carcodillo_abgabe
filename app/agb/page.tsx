import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Terms and conditions (AGB) page

export const metadata = {
  title: "Terms and Conditions - Carcodillo",
  description: "Terms and conditions for using Carcodillo",
}

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12">
      {/* Back button and heading */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
      </div>

      <div className="prose max-w-none">
        <section>
          <h2>1. Scope</h2>
          <p>
            These terms and conditions apply to all rental agreements between Carcodillo (hereinafter "Lessor") and the renter for the rental of vehicles.
          </p>
        </section>

        <section>
          <h2>2. Conclusion of Contract</h2>
          <p>
            The rental agreement is concluded once the booking is confirmed by the Lessor. The confirmation will be sent in text form (email).
          </p>
        </section>

        <section>
          <h2>3. Vehicle Pick-up and Return</h2>
          <p>
            The vehicle can be picked up at the agreed time and location and must be returned at the specified time and return location.
          </p>
        </section>

        <section>
          <h2>4. Payment Terms</h2>
          <p>
            The rental fee is due upon completion of the booking. Payment can be made via credit card, PayPal, or bank transfer.
          </p>
        </section>

        <section>
          <h2>5. Cancellation Policy</h2>
          <p>
            For cancellations up to 48 hours before the rental starts, a processing fee of 20% of the rental price will be charged. 
            For later cancellations or no-shows, the full rental price will be charged.
          </p>
        </section>

        <section>
          <h2>6. Obligations of the Renter</h2>
          <p>
            The renter agrees to handle the vehicle with care, obey all traffic laws, and use the vehicle only for the agreed purpose.
          </p>
        </section>

        <section>
          <h2>7. Liability</h2>
          <p>
            The renter is liable for all damages to the vehicle that occur during the rental period, unless covered by insurance.
          </p>
        </section>

        <section>
          <h2>8. Data Protection</h2>
          <p>
            Information about how personal data is processed can be found in our <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2>9. Final Provisions</h2>
          <p>
            German law applies. The place of jurisdiction, if legally permissible, is the registered office of the Lessor.
          </p>
          <p>
            Effective: June 2025
          </p>
        </section>
      </div>
    </div>
  )
}
