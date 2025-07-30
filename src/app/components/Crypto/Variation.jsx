"use client"

import React from "react"

export default function Variation({ label, value }) {
  const numericValue = typeof value === "number" ? value : parseFloat(value)

  if (isNaN(numericValue)) return null

  return (
    <div className="flex items-center gap-1">
      <span className="text-white text-sm">{label}</span>
      <span
        className={`text-sm font-semibold ${
          numericValue > 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        {numericValue}%
      </span>
    </div>
  )
}
