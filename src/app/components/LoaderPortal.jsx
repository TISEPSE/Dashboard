"use client"

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Loader from './Loader'

export default function LoaderPortal() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(
    <Loader />,
    document.body
  )
}