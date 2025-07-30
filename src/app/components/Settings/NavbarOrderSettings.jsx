"use client"

import { useState, useEffect, useRef } from 'react'
import { useNavbarPreferences } from '../../hooks/useNavbarPreferences'
import { FaHome, FaBitcoin, FaComments, FaCloudSun, FaHeartbeat, FaChartLine, FaCalendarAlt, FaGripVertical, FaEye, FaUndo } from 'react-icons/fa'

const NavbarOrderSettings = () => {
  const { navbarOrder, saveNavbarOrder, preferences, togglePreference, resetToDefault } = useNavbarPreferences()
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStartY, setTouchStartY] = useState(null)
  const [touchCurrentY, setTouchCurrentY] = useState(null)
  const touchHandlersRef = useRef({})

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Gérer les event listeners tactiles avec { passive: false }
  useEffect(() => {
    if (!isMobile) return

    const handleTouchMoveGlobal = (e) => {
      if (draggedIndex !== null) {
        e.preventDefault()
        
        const touch = e.touches[0]
        const deltaY = Math.abs(touch.clientY - touchStartY)
        
        // Seuil de sensibilité pour éviter les activations accidentelles
        if (deltaY < 10) return
        
        setTouchCurrentY(touch.clientY)
        
        // Calculer sur quel élément on survole avec throttling
        if (Date.now() - (window.lastTouchCheck || 0) < 50) return
        window.lastTouchCheck = Date.now()
        
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY)
        const dragItem = elements.find(el => el.dataset.dragIndex)
        
        if (dragItem) {
          const hoverIndex = parseInt(dragItem.dataset.dragIndex)
          if (hoverIndex !== draggedIndex) {
            setDragOverIndex(hoverIndex)
          }
        } else {
          setDragOverIndex(null)
        }
      }
    }

    const handleTouchEndGlobal = () => {
      if (draggedIndex !== null) {
        // Rétablir le scroll de la page
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
        
        // Si on a un drop valide, effectuer l'échange
        if (dragOverIndex !== null && draggedIndex !== dragOverIndex) {
          const newOrder = [...navbarOrder]
          
          // Échanger les positions directement
          const temp = newOrder[draggedIndex]
          newOrder[draggedIndex] = newOrder[dragOverIndex]
          newOrder[dragOverIndex] = temp
          
          // Feedback tactile pour confirmer l'échange
          if (navigator.vibrate) {
            navigator.vibrate(100)
          }
          
          saveNavbarOrder(newOrder)
        }
        
        // Reset tous les états
        setDraggedIndex(null)
        setDragOverIndex(null)
        setTouchStartY(null)
        setTouchCurrentY(null)
      }
    }

    // Ajouter les listeners avec { passive: false }
    document.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false })
    document.addEventListener('touchend', handleTouchEndGlobal)

    return () => {
      document.removeEventListener('touchmove', handleTouchMoveGlobal)
      document.removeEventListener('touchend', handleTouchEndGlobal)
      // S'assurer que les styles sont réinitialisés
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [draggedIndex, dragOverIndex, navbarOrder, saveNavbarOrder, isMobile])

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newOrder = [...navbarOrder]
      
      // Échanger les positions directement
      const temp = newOrder[draggedIndex]
      newOrder[draggedIndex] = newOrder[dropIndex]
      newOrder[dropIndex] = temp
      
      // Feedback tactile pour confirmer l'échange
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
      
      saveNavbarOrder(newOrder)
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Handler tactile pour démarrer le drag uniquement
  const handleTouchStart = (e, index) => {
    if (!isMobile) return
    const touch = e.touches[0]
    setTouchStartY(touch.clientY)
    setTouchCurrentY(touch.clientY)
    setDraggedIndex(index)
    
    // Feedback tactile
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    // Bloquer le scroll de la page pendant le drag
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
  }

  // Mapping des icônes
  const iconMapping = {
    home: <FaHome className="text-emerald-400" />,
    crypto: <FaBitcoin className="text-orange-400" />,
    message: <FaComments className="text-blue-400" />,
    meteo: <FaCloudSun className="text-yellow-400" />,
    sante: <FaHeartbeat className="text-red-400" />,
    finances: <FaChartLine className="text-green-400" />,
    calendrier: <FaCalendarAlt className="text-purple-400" />
  }

  // Mapping des couleurs pour les borders avec valeurs CSS
  const borderColorMapping = {
    home: { borderColor: '#34d399', boxShadow: '0 25px 50px -12px rgba(52, 211, 153, 0.2)' }, // emerald-400
    crypto: { borderColor: '#fb923c', boxShadow: '0 25px 50px -12px rgba(251, 146, 60, 0.2)' }, // orange-400
    message: { borderColor: '#60a5fa', boxShadow: '0 25px 50px -12px rgba(96, 165, 250, 0.2)' }, // blue-400
    meteo: { borderColor: '#facc15', boxShadow: '0 25px 50px -12px rgba(250, 204, 21, 0.2)' }, // yellow-400
    sante: { borderColor: '#f87171', boxShadow: '0 25px 50px -12px rgba(248, 113, 113, 0.2)' }, // red-400
    finances: { borderColor: '#4ade80', boxShadow: '0 25px 50px -12px rgba(74, 222, 128, 0.2)' }, // green-400
    calendrier: { borderColor: '#c084fc', boxShadow: '0 25px 50px -12px rgba(192, 132, 252, 0.2)' } // purple-400
  }

  // Mapping des couleurs pour le hover
  const hoverColorMapping = {
    home: 'hover:border-emerald-400 hover:shadow-emerald-500/20',
    crypto: 'hover:border-orange-400 hover:shadow-orange-500/20',
    message: 'hover:border-blue-400 hover:shadow-blue-500/20',
    meteo: 'hover:border-yellow-400 hover:shadow-yellow-500/20',
    sante: 'hover:border-red-400 hover:shadow-red-500/20',
    finances: 'hover:border-green-400 hover:shadow-green-500/20',
    calendrier: 'hover:border-purple-400 hover:shadow-purple-500/20'
  }

  // Mapping des labels
  const labelMapping = {
    home: 'Accueil',
    crypto: 'Cryptos',
    message: 'Messages',
    meteo: 'Météo',
    sante: 'Santé',
    finances: 'Finances',
    calendrier: 'Calendrier'
  }


  return (
    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 shadow-2xl border border-slate-700/50">
      <div className="flex justify-end mb-6">
        <button
          onClick={resetToDefault}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/60 text-slate-300 rounded-xl transition-all duration-200 text-sm shadow-lg border border-slate-600/30"
        >
          <FaUndo className="w-3 h-3" />
          <span className="whitespace-nowrap">Réinitialiser</span>
        </button>
      </div>

      <div className="space-y-3">
        {navbarOrder.map((key, index) => (
          <div
            key={key}
            data-drag-index={index}
            draggable={!isMobile}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-3 p-4 rounded-xl border
              cursor-grab active:cursor-grabbing transition-all duration-200 ease-out
              transform-gpu will-change-transform
              ${draggedIndex === index 
                ? 'opacity-95 bg-slate-700/50 shadow-2xl scale-105 z-50 shadow-blue-500/20' 
                : `bg-slate-800/50 border-slate-600/30 hover:bg-slate-700/50 hover:scale-102 ${hoverColorMapping[key]}`
              }
              ${dragOverIndex === index && draggedIndex !== index
                ? 'bg-blue-500/10 border-blue-400/30 shadow-lg scale-102 animate-pulse'
                : ''
              }
              ${draggedIndex !== null && draggedIndex !== index && dragOverIndex !== index
                ? 'opacity-60 scale-98'
                : ''
              }
            `}
            style={{
              ...(draggedIndex === index || (dragOverIndex === index && draggedIndex !== index) 
                ? borderColorMapping[key] 
                : {})
            }}
          >
            <div 
              className="cursor-grab pointer-events-none"
              onTouchStart={(e) => handleTouchStart(e, index)}
            >
              <FaGripVertical className="text-slate-400" />
            </div>
            
            <div className="text-xl pointer-events-none">
              {iconMapping[key]}
            </div>
            
            <div className="flex-1 pointer-events-none">
              <span className="text-white font-medium">
                {labelMapping[key]}
              </span>
              <div className="text-xs text-slate-500">
                Navigation principale
              </div>
            </div>

            <button
              onClick={() => togglePreference(key)}
              className={`w-11 h-6 rounded-full relative pointer-events-auto ${
                preferences[key] ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform pointer-events-none ${
                preferences[key] ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}

export default NavbarOrderSettings