"use client"
import { useState } from "react"
import Navbar from "./components/navbar"
import { CryptoProvider } from "./context/CryptoContext"
import { Geist, Geist_Mono } from "next/font/google"
import SplashHandler from "./components/SplashHandler"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export default function RootLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <html data-theme="dark" lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <CryptoProvider>
          <SplashHandler />
          <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
          <main
            className={`transition-all duration-300 ease-in-out ${
              isOpen ? "md:ml-80" : "md:ml-16"
            }`}
          >
            {children}
          </main>
        </CryptoProvider>
      </body>
    </html>
  )
}