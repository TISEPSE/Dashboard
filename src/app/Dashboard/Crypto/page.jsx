"use client"

import { useState } from "react"
import CryptoDashboard from "../../components/Crypto/CryptoDashboard"

export default function CryptoPage() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <CryptoDashboard 
      isNavOpen={isNavOpen} 
      setIsNavOpen={setIsNavOpen} 
    />
  )
}