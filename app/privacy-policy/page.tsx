import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Privacy policy page.

export const metadata = {
  title: "Privacy Policy - Carcodillo",
  description: "Information about data protection at Carcodillo",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-3xl py-12">
      {/* Back button and headline */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      </div>

      <div className="prose max-w-none">
        <section>
          <h2>1. Data Protection at a Glance</h2>
          <h3>General Information</h3>
          <p>
            The following information provides a simple overview of what happens to your personal data 
            when you visit our website or use our services.
          </p>
        </section>

        <section>
          <h2>2. General Information and Responsible Entity</h2>
          <p>
            The entity responsible for data processing on this website is:
          </p>
          <p>
            AntiFax GmbH<br />
            Flughafenallee 10<br />
            28199 Bremen<br />
            Germany<br /><br />
            
            Phone: +49 157 81040600<br />
            Email: privacy@antifax.com
          </p>
        </section>

        <section>
          <h2>3. Data Collection on Our Website</h2>
          <h3>Cookies</h3>
          <p>
            Our website uses cookies. These are small text files that your web browser stores on your device. 
            Cookies help us make our offering more user-friendly, effective, and secure.
          </p>
          <p>
            Some cookies are technically necessary to ensure the functionality of the website. 
            Other cookies are used to analyze user behavior and customize content.
          </p>
          <p>
            You can configure your browser to inform you about the use of cookies, only allow cookies 
            in individual cases, exclude cookies in certain cases or in general, and activate the automatic 
            deletion of cookies when closing the browser.
          </p>
        </section>

        <section>
          <h2>4. Registration and User Account</h2>
          <p>
            When you create a user account with us, we collect the following data:
          </p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number (optional)</li>
            <li>Address (optional)</li>
            <li>Payment information</li>
          </ul>
          <p>
            This data is used to process bookings, for contact purposes, and for customer service.
          </p>
        </section>

        <section>
          <h2>5. Booking Data</h2>
          <p>
            For processing vehicle bookings, we collect the following data:
          </p>
          <ul>
            <li>Rental duration (start and end time)</li>
            <li>Selected vehicle</li>
            <li>Pickup and return location</li>
            <li>Payment information</li>
          </ul>
          <p>
            This data is used for contract execution, customer service, and internal statistics.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>
            You have the right at any time:
          </p>
          <ul>
            <li>To request information about your stored personal data</li>
            <li>To have your stored data corrected</li>
            <li>To request the deletion of your personal data</li>
            <li>To request the restriction of data processing</li>
            <li>To object to data processing</li>
            <li>To request data portability</li>
          </ul>
          <p>
            Please direct any inquiries via email to privacy@carcodillo.com.
          </p>
        </section>

        <section>
          <h2>7. Currency and Changes to this Privacy Policy</h2>
          <p>
            This privacy policy is currently valid and was last updated in June 2025.
          </p>
        </section>
      </div>
    </div>
  )
}