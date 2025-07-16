"use client"
import { useState } from "react"
import Navbar from "./components/navbar"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <html data-theme="dark" lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main
          className={`transition-all duration-300 ease-in-out ${
            isOpen ? "md:ml-64" : "md:ml-16"
          }`}
        >
          {children}
        </main>
      </body>
    </html>
  )
}