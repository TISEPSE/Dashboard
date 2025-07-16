"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes, FaRocket } from "react-icons/fa";
import { useCryptoContext } from "../context/CryptoContext";

export default function Navbar({ isOpen, setIsOpen }) {
  const [hasMounted, setHasMounted] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const pathname = usePathname();
  const { cryptoPaginationData } = useCryptoContext();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const isCryptoPage = pathname === '/Dashboard/Crypto';
  const showPagination = isCryptoPage && cryptoPaginationData?.isPaginationEnabled;

  return (
    <>
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-[999] p-4" 
        style={{ 
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 6rem))' 
        }}
      >
        {showPagination ? (
          <div className="bg-gradient-to-r from-[#1a1d29] to-[#212332] border border-gray-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-600/50">
              <button
                disabled={cryptoPaginationData.currentPage === 1}
                onClick={cryptoPaginationData.handlePrevious}
                className="bg-gradient-to-r from-[#3a3d4e] to-[#4a4d5e] hover:from-[#4a4d5e] hover:to-[#5a5d6e] disabled:from-[#2a2d3e] disabled:to-[#2a2d3e] text-white px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Préc.</span>
              </button>

              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2a2d3e] to-[#3a3d4e] rounded-xl border border-gray-600/50 shadow-lg">
                <span className="text-white text-sm font-bold">
                  {cryptoPaginationData.currentPage}
                </span>
                <span className="text-gray-400 text-sm">/</span>
                <span className="text-gray-300 text-sm">
                  {cryptoPaginationData.totalPages}
                </span>
              </div>

              <button
                disabled={cryptoPaginationData.isNextDisabled}
                onClick={cryptoPaginationData.handleNext}
                className="bg-gradient-to-r from-[#3A6FF8] to-[#2952d3] hover:from-[#2952d3] hover:to-[#1e3a8a] disabled:from-[#2a2d3e] disabled:to-[#2a2d3e] text-white px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
              >
                <span>Suiv.</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-gradient-to-r from-[#3a3d4e] to-[#4a4d5e] hover:from-[#4a4d5e] hover:to-[#5a5d6e] text-white p-4 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 touch-none"
              aria-label={isOpen ? "Fermer la navbar" : "Ouvrir la navbar"}
            >
              <div className="transition-transform duration-200 pointer-events-none">
                {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </div>
              <span className="font-bold text-lg pointer-events-none">
                {isOpen ? "Fermer le menu" : "Ouvrir le menu"}
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-gradient-to-r from-[#3A6FF8] to-[#2952d3] hover:from-[#2952d3] hover:to-[#1e3a8a] text-white p-5 rounded-2xl transition-all duration-200 shadow-2xl flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95 touch-none"
            aria-label={isOpen ? "Fermer la navbar" : "Ouvrir la navbar"}
          >
            <div className="transition-transform duration-200 pointer-events-none">
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </div>
            <span className="font-bold text-lg pointer-events-none">
              {isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            </span>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[55]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed z-[60] bg-gradient-to-br from-[#1a1d29] to-[#212332] text-white flex flex-col border-r border-gray-500/30 overflow-hidden transition-all duration-300 shadow-2xl
          md:top-0 md:left-0 md:h-screen md:border-r
          ${
            isOpen
              ? "md:w-80 inset-0 w-full h-full"
              : "md:w-16 md:min-w-[64px] -left-full w-0 h-0"
          }
        `}
      >
        <div
          className={`flex items-center justify-between p-6 pt-8 text-2xl font-bold border-b border-gray-600/30 bg-gradient-to-r from-[#3A6FF8]/10 to-transparent ${
            isOpen ? "gap-3" : "md:justify-center"
          }`}
          style={{ minHeight: "88px" }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative">
              <FaRocket className="text-[#3A6FF8] flex-shrink-0 text-3xl drop-shadow-lg" />
              <div className="absolute inset-0 bg-[#3A6FF8]/20 rounded-full blur-lg"></div>
            </div>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isOpen
                  ? "opacity-100 max-w-[250px] transform translate-x-0"
                  : "md:opacity-0 md:max-w-0 md:transform md:-translate-x-4"
              }`}
            >
              <Link href="/" className="whitespace-nowrap">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Stat and You
                </span>
              </Link>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:block text-white bg-gradient-to-r from-[#3A6FF8] to-[#2952d3] p-3 rounded-xl cursor-pointer flex-shrink-0 transition-all duration-200 hover:from-[#2952d3] hover:to-[#1e3a8a] shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 touch-none"
            aria-label={isOpen ? "Fermer la navbar" : "Ouvrir la navbar"}
          >
            <div className="transition-transform duration-200 pointer-events-none">
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </div>
          </button>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden flex-1 ${
            isOpen
              ? "opacity-100 max-h-screen transform translate-y-0"
              : "md:opacity-0 md:max-h-0 md:transform md:-translate-y-4"
          }`}
        >
          <nav className="flex flex-col gap-6 p-6 h-full">
            <div className="bg-gradient-to-r from-[#2A2D3A] to-[#1f2937] border border-gray-600/50 text-white rounded-2xl overflow-hidden shadow-xl">
              <div
                onClick={() => setDashboardOpen(!dashboardOpen)}
                className="flex items-center justify-between p-4 cursor-pointer font-bold select-none hover:bg-white/5 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#3A6FF8] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-lg">Dashboard</span>
                </div>
                <div
                  className={`w-8 h-8 flex items-center justify-center bg-[#3A6FF8] rounded-lg transition-transform duration-300 ease-in-out shadow-lg ${
                    dashboardOpen ? "rotate-180" : ""
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div
                className={`overflow-hidden transition-all duration-400 ease-in-out px-4 flex flex-col gap-3 ${
                  dashboardOpen
                    ? "max-h-screen opacity-100 pb-4"
                    : "max-h-0 opacity-0"
                }`}
              >
                {[
                  { href: "/Dashboard/Crypto", label: "Cryptos", icon: "₿" },
                  { href: "/Dashboard/Message", label: "Messages", icon: "💬" },
                  { href: "/Dashboard/Meteo", label: "Météo", icon: "🌤️" },
                  { href: "/Dashboard/Sport", label: "Sport", icon: "⚽" },
                  { href: "/Dashboard/Calendrier", label: "Calendrier", icon: "📅" }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 hover:text-[#3A6FF8] hover:bg-white/5 transition-all duration-200 py-3 px-3 rounded-xl group ${
                      pathname === item.href ? 'bg-[#3A6FF8]/20 text-[#3A6FF8]' : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#374151] to-[#1f2937] rounded-2xl p-4 shadow-xl">
              <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                Compte
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { href: "/Dashboard/Profile", label: "Profil", icon: "👤" },
                  { href: "/Dashboard/Parametre", label: "Paramètres", icon: "⚙️" }
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 hover:text-[#3A6FF8] hover:bg-white/5 transition-all duration-200 py-3 px-3 rounded-xl group ${
                      pathname === item.href ? 'bg-[#3A6FF8]/20 text-[#3A6FF8]' : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-600/30">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>v1.0.0</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>En ligne</span>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
