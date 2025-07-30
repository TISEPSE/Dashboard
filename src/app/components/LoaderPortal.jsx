"use client"

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Loader from './Loader'

export default function LoaderPortal({ show = true }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Ne pas afficher le loader par défaut
  if (!mounted || !show) return null

  return createPortal(
    <Loader />,
    document.body
  )
}