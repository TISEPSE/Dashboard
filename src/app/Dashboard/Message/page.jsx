"use client"

import { useState, useEffect } from "react"
import Loader from "../../components/Loader"

export default function MessagePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <Loader />
  }

  return(
    <div className="min-h-screen bg-gradient-to-br from-[#1a1d29] to-[#212332] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col justify-center items-center min-h-screen"> 
          <h1 className="font-bold text-4xl text-white mb-4">Page des Messages</h1>
          <p className="text-gray-300">Ici c'est la page des Messages</p>
        </div>
      </div>
    </div>
  )
}