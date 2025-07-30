"use client"

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a1d29] to-[#212332] flex items-center justify-center z-[70]">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-[#3A6FF8]/30 rounded-full animate-spin border-t-[#3A6FF8]"></div>
        <p className="mt-4 text-white text-lg font-medium">Chargement...</p>
      </div>
    </div>
  )
}