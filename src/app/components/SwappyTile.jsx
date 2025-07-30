"use client"

export default function SwappyTile({ children, slotId, className = "" }) {
  return (
    <div 
      className={`${className}`} 
      data-swapy-slot={slotId}
    >
      <div 
        data-swapy-item={slotId}
      >
        {children}
      </div>
    </div>
  )
}