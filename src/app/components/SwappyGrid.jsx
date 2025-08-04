"use client"

import { useState, useRef, useEffect } from 'react'
import React from 'react'

export default function SwappyGrid({ children, className = "", enabled = true }) {
  const containerRef = useRef(null)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [items, setItems] = useState([])
  const [hasSwapped, setHasSwapped] = useState(false)
  const [swappingItems, setSwappingItems] = useState([])
  const [initialLoad, setInitialLoad] = useState(true)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const childrenArray = Array.isArray(children) ? children : [children]
    setItems(childrenArray.map((child, index) => ({ 
      id: `item-${index}`,
      content: child,
      // Animations UNIQUEMENT au tout premier chargement
      processedContent: initialLoad ? React.cloneElement(child, { 
        key: `initial-${index}`,
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { 
          delay: (child.props.transition?.delay || 0) * 0.3,
          duration: 0.2
        }
      }) : child
    })))

    // Marquer que le chargement initial est terminé après le premier rendu
    if (initialLoad) {
      const timer = setTimeout(() => setInitialLoad(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [children, enabled, initialLoad])

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragEnd = (e) => {
    setDraggedIndex(null)
    setHoveredIndex(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    const index = parseInt(e.currentTarget.dataset.index)
    if (draggedIndex !== null && index !== draggedIndex) {
      setHoveredIndex(index)
    }
  }

  const handleDragLeave = (e) => {
    setHoveredIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    
    if (dragIndex !== dropIndex) {
      setHasSwapped(true)
      
      // Animation fluide en 3 étapes - version rapide
      setSwappingItems([dragIndex, dropIndex])
      
      // Étape 1: Légère contraction des éléments
      setTimeout(() => {
        const newItems = [...items]
        const temp = newItems[dragIndex]
        newItems[dragIndex] = newItems[dropIndex]
        newItems[dropIndex] = temp
        setItems(newItems)
      }, 50)
      
      // Étape 2: Retour à la normale avec effet de succès
      setTimeout(() => setSwappingItems([]), 200)
    }
    
    setDraggedIndex(null)
    setHoveredIndex(null)
  }

  if (!enabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={containerRef} className={`${className}`}>
      {items.map((item, index) => (
        <div
          key={hasSwapped ? `swapped-${item.id}-${index}` : `${item.id}-${index}`}
          data-index={index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`
            cursor-grab active:cursor-grabbing 
            transform transition-all ease-out
            ${draggedIndex === index ? 
              'scale-105 z-50 opacity-80 shadow-2xl shadow-emerald-500/40 rotate-1 duration-200 rounded-2xl' : 
              'duration-300'
            }
            ${hoveredIndex === index && draggedIndex !== null && draggedIndex !== index ? 
              'scale-[1.02] ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-400/25 rounded-2xl' : ''
            }
            ${swappingItems.includes(index) ? 
              'scale-95 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 ring-2 ring-emerald-400/80 shadow-2xl shadow-emerald-400/30 rounded-2xl' : 
              ''
            }
          `}
          style={{
            transition: swappingItems.includes(index) 
              ? 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' 
              : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out, box-shadow 0.2s ease-out'
          }}
        >
          {item.processedContent || item.content}
        </div>
      ))}
    </div>
  )
}