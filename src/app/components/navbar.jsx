"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaBars, FaTimes, FaRocket } from "react-icons/fa";

export default function Navbar({ isOpen, setIsOpen }) {
  const [hasMounted, setHasMounted] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <>
      {/* Interface en bas pour mobile - Sans background */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70] pb-4 px-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-white bg-[#3A6FF8] p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#2952d3] shadow-lg flex items-center justify-center gap-2"
          aria-label={isOpen ? "Fermer la navbar" : "Ouvrir la navbar"}
        >
          <div className="transition-transform duration-200">
            {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </div>
          <span className="font-medium">
            {isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          </span>
        </button>
      </div>

      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[55]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navbar */}
      <div
        className={`
          fixed z-[60] bg-[#212332] text-white flex flex-col border-r border-gray-500 overflow-hidden transition-all duration-300
          md:top-0 md:left-0 md:h-screen md:border-r
          ${
            isOpen
              ? "md:w-64 inset-0 w-full h-full"
              : "md:w-16 md:min-w-[64px] -left-full w-0 h-0"
          }
        `}
      >
        <div
          className={`flex items-center justify-between p-4 text-2xl font-bold ${
            isOpen ? "gap-2" : "md:justify-center"
          }`}
          style={{ minHeight: "64px" }}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <FaRocket className="text-[#3A6FF8] flex-shrink-0" />
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen
                  ? "opacity-100 max-w-[200px] transform translate-x-0"
                  : "md:opacity-0 md:max-w-0 md:transform md:-translate-x-4"
              }`}
            >
              <Link href="/" className="whitespace-nowrap">
                Stat and You
              </Link>
            </div>
          </div>

          {/* Bouton toggle pour desktop seulement */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:block text-white bg-[#3A6FF8] p-2 rounded-lg cursor-pointer flex-shrink-0 transition-all duration-200 hover:bg-[#2952d3]"
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
              : "md:opacity-0 md:max-h-0 md:transform md:-translate-y-4"
          }`}
        >
          <nav className="flex flex-col gap-4 p-2">
            <div className="bg-[#2A2D3A] border border-gray-600 text-white rounded-lg overflow-hidden">
              <div
                onClick={() => setDashboardOpen(!dashboardOpen)}
                className="flex items-center justify-between p-3 cursor-pointer font-semibold select-none"
              >
                <span>Dashboard</span>
                <div
                  className={`w-6 h-6 flex items-center justify-center bg-[#3A6FF8] rounded-md transition-transform duration-300 ease-in-out ${
                    dashboardOpen ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div
                className={`overflow-hidden transition-all duration-400 ease-in-out px-3 flex flex-col gap-2 text-sm ${
                  dashboardOpen
                    ? "max-h-96 opacity-100 pb-3"
                    : "max-h-0 opacity-0"
                }`}
              >
                <Link
                  href="/Dashboard/Crypto"
                  className="hover:text-gray-300 transition-colors duration-200 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  Cryptos
                </Link>
                <Link
                  href="/Dashboard/Message"
                  className="hover:text-gray-300 transition-colors duration-200 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  href="/Dashboard/Meteo"
                  className="hover:text-gray-300 transition-colors duration-200 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  Météo
                </Link>
                <Link
                  href="/Dashboard/Sport"
                  className="hover:text-gray-300 transition-colors duration-200 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  Sport
                </Link>
                <Link
                  href="/Dashboard/Calendrier"
                  className="hover:text-gray-300 transition-colors duration-200 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  Calendrier
                </Link>
              </div>
            </div>

            <div className="flex flex-col p-2 gap-2">
              <Link
                href="/Dashboard/Profile"
                className="hover:text-gray-300 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Profil
              </Link>
              <Link
                href="/Dashboard/Parametre"
                className="hover:text-gray-300 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Paramètres
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}