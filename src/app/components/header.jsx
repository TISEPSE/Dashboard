//=========Header de la page tout le temps présente=========//

export default function Header() {
  return (
    <div className="h-16 bg-[#212631] text-white flex items-center border-b-1 border-gray-500 px-4 z-50 shadow-md">
      <span className="text-xl font-semibold">Navbar icon</span>
      <div className="flex items-center w-full max-w-xs ml-4">
        <textarea
          placeholder="Effectuer une recherche"
          className="w-full h-10 bg-gray-900 text-white border border-gray-700 rounded-md pl-3 pr-3 py-2 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

