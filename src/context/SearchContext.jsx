// src/context/SearchContext.jsx
//
// Global search state shared between Navbar (input) and Members page (results).
// Flow:
//   1. User types in Navbar search bar
//   2. SearchContext updates searchQuery (debounced 300ms)
//   3. Members page reads searchQuery and filters the list

import { createContext, useContext, useState, useCallback, useRef } from 'react'

const SearchContext = createContext(null)

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const debounceRef                   = useRef(null)

  // Debounced setter — waits 300ms after user stops typing
  const setSearchDebounced = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value.trim())
    }, 300)
  }, [])

  // Immediate clear (for X button)
  const clearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSearchQuery('')
  }, [])

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchDebounced, clearSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used inside SearchProvider')
  return ctx
}