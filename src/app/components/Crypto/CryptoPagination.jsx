import React from "react"

const CryptoPagination = ({
  currentPage,
  onPageChange,
  cryptosLength,
  perPage,
  className = ""
}) => {
  const handlePrevious = () => {
    onPageChange(Math.max(1, currentPage - 1))
  }

  const handleNext = () => {
    onPageChange(currentPage + 1)
  }

  // Pour le mode "Tout", on permet toujours la navigation suivante
  // sauf si on reçoit moins de 50 résultats (fin des données)
  const isNextDisabled = perPage === "all" ? cryptosLength < 50 : false

  return (
    <>
      {/* Pagination desktop/tablette */}
      <div className={`hidden sm:flex justify-center items-center gap-3 mt-8 ${className}`}>
        <button
          disabled={currentPage === 1}
          onClick={handlePrevious}
          className="bg-[#3a3d4e] hover:bg-[#4a4d5e] disabled:bg-[#2a2d3e] text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Précédent</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#2a2d3e] rounded-lg border border-[#3a3d4e]">
          <span className="text-gray-300 text-sm">
            Page {currentPage}
          </span>
          <span className="text-xs text-gray-400">
            ({cryptosLength} résultats)
          </span>
        </div>

        <button
          disabled={isNextDisabled}
          onClick={handleNext}
          className="bg-[#3A6FF8] hover:bg-[#2952d3] disabled:bg-[#2a2d3e] text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>Suivant</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Pagination mobile flottante */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[60] pb-20 px-4">
        <div className="flex items-center justify-between gap-3">
          <button
            disabled={currentPage === 1}
            onClick={handlePrevious}
            className="bg-[#3a3d4e] hover:bg-[#4a4d5e] disabled:bg-[#2a2d3e] text-white px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Précédent</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-3 bg-[#2a2d3e] rounded-lg border border-[#3a3d4e] shadow-lg">
            <span className="text-gray-300 text-sm font-medium">
              Page {currentPage}
            </span>
            <span className="text-xs text-gray-400">
              ({cryptosLength})
            </span>
          </div>

          <button
            disabled={isNextDisabled}
            onClick={handleNext}
            className="bg-[#3A6FF8] hover:bg-[#2952d3] disabled:bg-[#2a2d3e] text-white px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            <span>Suivant</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

export default CryptoPagination