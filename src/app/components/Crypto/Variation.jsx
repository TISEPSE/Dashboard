import React from "react"

export default function Variation({ label, value }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-gray-400">{label}</span>
      <span
        className={`font-semibold px-2 py-0.5 rounded-full ${
          value >= 0 ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"
        }`}
      >
        {value?.toFixed(2)}%
      </span>
    </div>
  )
}
