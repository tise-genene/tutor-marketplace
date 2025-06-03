import { ReactNode } from "react"
import Link from "next/link"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            TutorHub
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/search" className="text-sm hover:text-primary">
              Find Tutors
            </Link>
            <Link href="/become-tutor" className="text-sm hover:text-primary">
              Become a Tutor
            </Link>
            <Link href="/login" className="text-sm hover:text-primary">
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <p className="text-sm text-muted-foreground">
                TutorHub connects students with qualified Ethiopian tutors for personalized learning experiences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-primary">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Tutors</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/become-tutor" className="hover:text-primary">
                    Become a Tutor
                  </Link>
                </li>
                <li>
                  <Link href="/tutor-resources" className="hover:text-primary">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>Email: support@tutorhub.et</li>
                <li>Phone: +251 911 123 456</li>
                <li>Address: Addis Ababa, Ethiopia</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} TutorHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 