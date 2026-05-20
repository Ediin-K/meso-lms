import { useCallback, useEffect, useMemo, useState } from 'react'
import { lookupString } from '../lib/mesonStrings.js'
import { AppPreferencesContext } from './appPreferencesContext.js'

const STORAGE_LOCALE = 'meson-locale'
const STORAGE_ROLE = 'meson-role'
const STORAGE_THEME = 'meson-theme'

function readStoredLocale() {
  try {
    const v = localStorage.getItem(STORAGE_LOCALE)
    if (v === 'sq' || v === 'en') return v
  } catch {
    /* ignore */
  }
  return 'sq'
}

function readStoredRole() {
  try {
    const v = localStorage.getItem(STORAGE_ROLE).toLowerCase()
    if (['guest', 'student', 'teacher', 'parent', 'admin'].includes(v)) {
      return v
    }
  } catch {}
  return 'guest'
}

function readStoredColorMode() {
  try {
    const v = localStorage.getItem(STORAGE_THEME)
    if (v === 'dark' || v === 'light') return v
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function AppPreferencesProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale)
  const [role, setRoleState] = useState(readStoredRole)
  const [colorMode, setColorModeState] = useState(readStoredColorMode)
  const [isAuthenticated, setIsAuthenticated] = useState(
      !!localStorage.getItem('token')
  )
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem(STORAGE_ROLE)
    setIsAuthenticated(false)
    setRoleState('guest')
  }, [])
  const setLocale = useCallback((next) => {
    const v = next === 'en' ? 'en' : 'sq'
    setLocaleState(v)
    try {
      localStorage.setItem(STORAGE_LOCALE, v)
    } catch {
      /* ignore */
    }
  }, [])

  const setRole = useCallback((next) => {
    const allowed = ['guest', 'student', 'teacher', 'parent', 'admin']
    const v = allowed.includes(next?.toLowerCase()) ? next.toLowerCase() : 'guest'
    setRoleState(v)
    localStorage.setItem(STORAGE_ROLE, v)
  }, [])

  const setColorMode = useCallback((next) => {
    const v = next === 'dark' ? 'dark' : 'light'
    setColorModeState(v)
    try {
      localStorage.setItem(STORAGE_THEME, v)
    } catch {
      /* ignore */
    }
  }, [])

  const toggleColorMode = useCallback(() => {
    setColorModeState((prev) => {
      const v = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_THEME, v)
      } catch {
        /* ignore */
      }
      return v
    })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (colorMode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [colorMode])

  const t = useCallback(
    (path) => lookupString(locale, path),
    [locale],
  )

  const value = useMemo(() => ({
    locale,
    setLocale,
    role,
    setRole,
    mode: colorMode,
    colorMode,
    setColorMode,
    toggleColorMode,
    t,
    isAuthenticated,
    setIsAuthenticated,
    logout
  }), [
    locale,
    role,
    colorMode,
    t,
    isAuthenticated,
    setLocale,
    setRole,
    setColorMode,
    toggleColorMode,
    logout
  ])

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  )
}
