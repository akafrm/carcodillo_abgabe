import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="flex justify-center">
      <div className="container text-center">
        <div className="grid gap-6 md:grid-cols-4 mb-6 text-sm text-slate-600 max-w-4xl mx-auto">
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Carcodillo</h3>
            <p className="text-xs">
              Easy and fast vehicle sharing with Carcodillo.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Offers</h3>
            <ul className="space-y-1">
              <li><Link href="/vehicles" className="hover:underline">Vehicles</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-slate-800 mb-2">My Account</h3>
            <ul className="space-y-1">
              <li><Link href="/login" className="hover:underline">Login</Link></li>
              <li><Link href="/register" className="hover:underline">Register</Link></li>
              <li><Link href="/reservations" className="hover:underline">My Reservations</Link></li>
              <li><Link href="/profile" className="hover:underline">Edit Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Help & Legal</h3>
            <ul className="space-y-1">
              <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/legal-notice" className="hover:underline">Legal Notice</Link></li>
              <li><Link href="/agb" className="hover:underline>">Terms and conditions</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex flex-col items-center gap-2">
          <div>© {currentYear} Carcodillo. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:underline">Privacy</Link>
            <Link href="/legal-notice" className="hover:underline">Legal Notice</Link>
            <Link href="/agb" className="hover:underline>">Terms and conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}