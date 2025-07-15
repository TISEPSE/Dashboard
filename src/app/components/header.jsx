//=========Header de la page tout le temps présente=========//

"use client";

export default function Header({ isOpen }) {
  return (
    <div
      className={`fixed top-0 h-16 bg-[#212332] text-white flex items-center border-b border-gray-500 px-4 shadow-md transition-all duration-300 ease-in-out ${
        isOpen ? "left-64 w-[calc(100%-16rem)]" : "left-16 w-[calc(100%-4rem)]"
      }`}
      style={{ zIndex: 40 }}
    >
      <span className="text-xl font-semibold">Navbar icon</span>
      <div className="flex items-center w-full max-w-xs ml-4">
        <textarea
          placeholder="Effectuer une recherche"
          className="w-full h-10 bg-[#31353F] text-white border border-gray-700 rounded-md pl-3 pr-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}



