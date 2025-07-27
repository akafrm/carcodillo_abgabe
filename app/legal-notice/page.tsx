// Legal notice page.
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Legal Notice - Carcodillo",
  description: "Legal information about Carcodillo",
}

export default function LegalNoticePage() {
  return (
    <div className="container max-w-3xl py-12">
      {/* Back navigation and title */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Legal Notice</h1>
      </div>

      <div className="prose max-w-none">
        <section>
          <h2>Information pursuant to § 5 DDG</h2>
          <p>
            AntiFax GmbH<br />
            Flughafenallee 10<br />
            28199 Bremen<br />
            Germany<br />
          </p>

          <h3>Represented by</h3>
          <p>
            Fabio Mueller, CEO <br />
            Dominik Asselborn, COO <br />
            Youssef Beltagi, CFO <br />
            Roman Babisko, CIO <br />
          </p>

          <h3>Contact</h3>
          <p>
            Phone: +49 157 81040600<br />
            Email: privacy@antifax.com
          </p>

          <h3>Commercial Register</h3>
          <p>
            Registered in the Commercial Register.<br />
            Registration Court: Local Court Bremen<br />
            Registration Number: 123456
          </p>

          <h3>VAT ID</h3>
          <p>
            VAT identification number according to § 27a of the German VAT Act:<br />
            DE123456789
          </p>
        </section>

        <section>
          <h2>Liability for Content</h2>
          <p>
            As a service provider, we are responsible for our own content on these pages according to 
            general laws pursuant to § 7 Paragraph 1 TMG. According to §§ 8 to 10 TMG, however, we as a 
            service provider are not obligated to monitor transmitted or stored third-party information 
            or to investigate circumstances that indicate illegal activity.
          </p>
        </section>

        <section>
          <h2>Copyright</h2>
          <p>
            The content and works created by the site operators on these pages are subject to German copyright law. 
            Duplication, processing, distribution, and any form of commercialization of such material beyond the 
            scope of the copyright law shall require the prior written consent of the respective author or creator.
          </p>
        </section>
      </div>
    </div>
  )
}