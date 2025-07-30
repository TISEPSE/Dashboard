"use client"

import { useState } from 'react'
import { useColors } from '../../hooks/useColors'

const ColorPicker = ({ selectedColorId = '1', onColorChange, className = '' }) => {
  const [justChanged, setJustChanged] = useState(null)
  const { getAvailableColors, getColor, loading, isGoogleConnected } = useColors()
  const colorOptions = Object.entries(getAvailableColors())

  const handleColorChange = (colorId) => {
    onColorChange(colorId)
    setJustChanged(colorId)
    
    // Remettre l'état normal après animation
    setTimeout(() => setJustChanged(null), 800)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      

      {/* Grille de couleurs */}
      <div className="grid grid-cols-6 gap-2">
        {colorOptions.map(([colorId, colorData]) => (
          <button
            key={colorId}
            type="button"
            onClick={() => handleColorChange(colorId)}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
              selectedColorId === colorId 
                ? 'border-white shadow-lg scale-110' 
                : 'border-gray-400/50 hover:border-gray-300'
            } ${
              justChanged === colorId ? 'ring-4 ring-white/50 animate-pulse' : ''
            }`}
            style={{ backgroundColor: colorData.background }}
            title={`Couleur ${colorId}`}
          >
            {selectedColorId === colorId && (
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: colorData.text }}>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ColorPicker