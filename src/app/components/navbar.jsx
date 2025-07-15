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
        <div className="flex items-center gap-2">
          {isOpen && <FaRocket className="text-[#3A6FF8]" />}
          {isOpen && <Link href="/">Stat and You</Link>}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white bg-[#3A6FF8] p-2 rounded-lg cursor-pointer"
          aria-label={isOpen ? "Fermer la navbar" : "Ouvrir la navbar"}
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {isOpen && (
        <nav className="flex flex-col gap-4 p-2 overflow-y-auto">
          <div className="bg-[#3A6FF8] collapse collapse-arrow border border-base-300 text-white hover:border-white">
            <input type="checkbox" className="peer h-10" />
            <div className="collapse-title font-semibold">Dashboard</div>
            <div className="collapse-content text-sm flex flex-col gap-2 max-h-0 opacity-0 transition-all duration-300 ease-in-out overflow-hidden peer-checked:max-h-96 peer-checked:opacity-100">
              <Link href="/" className="hover:text-gray-300">
                Accueil
              </Link>
              <Link href="/Dashboard/Crypto" className="hover:text-gray-300">
                Crypto
              </Link>
              <Link href="/Dashboard/Message" className="hover:text-gray-300">
                Messages
              </Link>
              <Link href="/Dashboard/Meteo" className="hover:text-gray-300">
                Météo
              </Link>
              <Link href="/Dashboard/Sport" className="hover:text-gray-300">
                Sport
              </Link>
              <Link href="/Dashboard/Calendrier" className="hover:text-gray-300">
                Calendrier
              </Link>
            </div>
          </div>

          <div className="flex flex-col p-2 gap-2">
            <Link href="/Dashboard/Profile" className="hover:text-gray-300">
              Profile
            </Link>
            <Link href="/Dashboard/Parametre" className="hover:text-gray-300">
              Paramètre
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
