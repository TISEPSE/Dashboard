"use client"
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransition({ children }) {
  const [animationClass, setAnimationClass] = useState('')
  const [displayChildren, setDisplayChildren] = useState(children)
  const pathname = usePathname()

  useEffect(() => {
    // Démarrer l'animation de sortie
    setAnimationClass('page-transition-exit')
    
    // Attendre que l'animation de sortie se termine
    const exitTimeout = setTimeout(() => {
      setDisplayChildren(children)
      
      // Démarrer l'animation d'entrée
      setTimeout(() => {
        setAnimationClass('page-transition-enter')
        
        // Nettoyer la classe d'animation après l'entrée
        setTimeout(() => {
          setAnimationClass('')
        }, 300)
      }, 20)
    }, 200)

    return () => clearTimeout(exitTimeout)
  }, [pathname, children])

  return (
    <div className="relative w-full h-full">
      <div className={`w-full h-full ${animationClass}`}>
        {displayChildren}
      </div>
    </div>
  )
}