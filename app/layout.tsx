import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/toaster"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Admin Tool - Contact Records",
  description: "Manage and explore your contact database",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <nav className="flex gap-4">
              <Link href="/" className="px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
                Contacts
              </Link>
              <Link href="/quotations" className="px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">
                Quotations
              </Link>
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'