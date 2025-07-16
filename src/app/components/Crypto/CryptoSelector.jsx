import React from "react"

const CryptoSelector = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => {
        const newValue = e.target.value === "all" ? "all" : Number(e.target.value)
        onChange(newValue)
      }}
      className="bg-[#1a1d29] text-[#FeFeFe] border border-[#3a3d4e] rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-[#3A6FF8] focus:border-transparent transition-all duration-200 md:text-sm text-xs"
    >
      <option value={24}>24</option>
      <option value={32}>32</option>
      <option value={40}>40</option>
      <option value="all">Tout</option>
    </select>
  )
}

export default CryptoSelector