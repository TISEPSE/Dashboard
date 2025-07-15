"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaBars, FaTimes, FaRocket } from "react-icons/fa";

export default function Navbar({ isOpen, setIsOpen }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-[#212332] text-white flex flex-col border-r border-gray-500 z-50 overflow-hidden transition-all duration-300 ${
        isOpen ? "w-64" : "w-16 min-w-[64px]"
      }`}
    >
      <div
        className={`flex items-center justify-between p-4 text-2xl font-bold ${
          isOpen ? "gap-2" : "justify-center"
        }`}
        style={{ minHeight: "64px" }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <FaRocket className="text-[#3A6FF8] flex-shrink-0" />
          <div 
            className={`transition-all duration-300 ease-in-out ${
              isOpen 
                ? "opacity-100 max-w-[200px] transform translate-x-0" 
                : "opacity-0 max-w-0 transform -translate-x-4"
            }`}
          >
            <Link href="/" className="whitespace-nowrap">
              Stat and You
            </Link>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white bg-[#3A6FF8] p-2 rounded-lg cursor-pointer flex-shrink-0 transition-all duration-200 hover:bg-[#2952d3]"
          aria-label={isOpen ? "Fermer la navbar" : "Ouvrir la navbar"}
        >
          <div className="transition-transform duration-200">
            {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </div>
        </button>
      </div>

      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen 
            ? "opacity-100 max-h-screen transform translate-y-0" 
            : "opacity-0 max-h-0 transform -translate-y-4"
        }`}
      >
        <nav className="flex flex-col gap-4 p-2">
          <div className="bg-[#2A2D3A] border border-gray-600 text-white rounded-lg overflow-hidden">
            <input type="checkbox" className="peer hidden" id="dashboard-toggle" />
            <label 
              htmlFor="dashboard-toggle" 
              className="flex items-center justify-between p-3 cursor-pointer font-semibold"
            >
              <span>Dashboard</span>
              <div className="w-6 h-6 flex items-center justify-center bg-[#3A6FF8] rounded-md">
                <svg 
                  className="w-4 h-4 transition-transform duration-300 ease-in-out peer-checked:rotate-180" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </label>
            <div className="max-h-0 opacity-0 transition-all duration-400 ease-in-out overflow-hidden peer-checked:max-h-96 peer-checked:opacity-100 peer-checked:pb-3">
              <div className="px-3 flex flex-col gap-2 text-sm">
                <Link href="/" className="hover:text-gray-300 transition-colors duration-200 py-1">
                  Accueil
                </Link>
                <Link href="/Dashboard/Crypto" className="hover:text-gray-300 transition-colors duration-200 py-1">
                  Crypto
                </Link>
                <Link href="/Dashboard/Message" className="hover:text-gray-300 transition-colors duration-200 py-1">
                  Messages
                </Link>
                <Link href="/Dashboard/Meteo" className="hover:text-gray-300 transition-colors duration-200 py-1">
                  Météo
                </Link>
                <Link href="/Dashboard/Sport" className="hover:text-gray-300 transition-colors duration-200 py-1">
                  Sport
                </Link>
                <Link href="/Dashboard/Calendrier" className="hover:text-gray-300 transition-colors duration-200 py-1">
                  Calendrier
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col p-2 gap-2">
            <Link href="/Dashboard/Profile" className="hover:text-gray-300 transition-colors duration-200">
              Profile
            </Link>
            <Link href="/Dashboard/Parametre" className="hover:text-gray-300 transition-colors duration-200">
              Paramètre
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}