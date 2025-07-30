import { useState, useEffect } from "react"

export const useCryptoPreferences = () => {
  const [hydrated, setHydrated] = useState(false)
  const [currency, setCurrency] = useState("eur")
  const [perPage, setPerPage] = useState(6)
  const [sortBy, setSortBy] = useState("market_cap")
  const [sortOrder, setSortOrder] = useState("desc")

  // Hydratation initiale
  useEffect(() => {
    setHydrated(true)
    
    const savedCurrency = localStorage.getItem("currency")
    if (savedCurrency) setCurrency(savedCurrency)

    const savedPerPage = localStorage.getItem("perPage")
    if (savedPerPage) {
      setPerPage(savedPerPage === "all" ? "all" : Number(savedPerPage))
    }

    const savedSortBy = localStorage.getItem("sortBy")
    if (savedSortBy) setSortBy(savedSortBy)

    const savedSortOrder = localStorage.getItem("sortOrder")
    if (savedSortOrder) setSortOrder(savedSortOrder)
  }, [])

  // Sauvegarde des préférences
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem("currency", currency)
  }, [currency, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem("perPage", perPage)
  }, [perPage, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem("sortBy", sortBy)
  }, [sortBy, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem("sortOrder", sortOrder)
  }, [sortOrder, hydrated])

  return {
    hydrated,
    currency,
    setCurrency,
    perPage,
    setPerPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  }
}