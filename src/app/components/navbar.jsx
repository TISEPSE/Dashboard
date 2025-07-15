"use client"
import { useState } from "react"
import Link from "next/link"
import { FaRocket, FaBars, FaTimes } from "react-icons/fa"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      {isOpen && (
        <div className="h-screen w-64 fixed top-0 left-0 bg-[#212332] text-white flex flex-col border-r border-gray-500 z-40 overflow-y-auto">
          <div className="flex items-center justify-between gap-2 p-4 text-2xl font-bold">
            <div className="flex items-center gap-2">
              <FaRocket className="text-[#3A6FF8]" />
              <a href="/">Stat and You</a>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white bg-[#3A6FF8] p-2 rounded-lg"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-4 p-2">
            <div className="flex flex-col gap-2">
              <div className="bg-[#3A6FF8] collapse collapse-arrow border border-base-300 text-white hover:border-white">
                <input type="checkbox" className="peer h-10" />
                <div className="collapse-title font-semibold">Dashboard</div>
                <div className="collapse-content text-sm flex flex-col gap-2 max-h-0 opacity-0 transition-all duration-300 ease-in-out overflow-hidden peer-checked:max-h-96 peer-checked:opacity-100">
                  <Link href="/" className="hover:text-gray-300">Accueil</Link>
                  <Link href="/Dashboard/Crypto" className="hover:text-gray-300">Crypto</Link>
                  <Link href="/Dashboard/Message" className="hover:text-gray-300">Messages</Link>
                  <Link href="/Dashboard/Meteo" className="hover:text-gray-300">Météo</Link>
                  <Link href="/Dashboard/Sport" className="hover:text-gray-300">Sport</Link>
                  <Link href="/Dashboard/Calendrier" className="hover:text-gray-300">Calendrier</Link>
                </div>
              </div>

              <div className="flex flex-col p-2 gap-2">
                <Link href="/Dashboard/Profile" className="hover:text-gray-300">Profile</Link>
                <Link href="/Dashboard/Parametre" className="hover:text-gray-300">Paramètre</Link>
              </div>
            </div>
          </nav>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 text-white bg-[#3A6FF8] p-2 rounded-lg"
        >
          <FaBars size={20} />
        </button>
      )}
    </>
  )
}
