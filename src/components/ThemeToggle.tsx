'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'loma-theme'
const THEME_EVENT = 'loma-theme-change'

function readStoredPreference(): 'light' | 'dark' | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

let activeTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Applies the theme to <html> and (optionally) persists the choice.
 * A short `theme-transition` class on <html> smooths the color change;
 * it is removed afterwards (gated on reduced-motion via CSS).
 */
function setThemeOnDocument(next: 'light' | 'dark', persist: boolean) {
  const html = document.documentElement
  html.classList.add('theme-transition')
  html.setAttribute('data-theme', next)
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable (private mode) — theme still applies for this session */
    }
  }
  if (activeTimer) clearTimeout(activeTimer)
  activeTimer = setTimeout(() => {
    html.classList.remove('theme-transition')
    activeTimer = null
  }, 300)
  // Let any other ThemeToggle instance (e.g. mobile vs. desktop) resync
  window.dispatchEvent(new Event(THEME_EVENT))
}

function subscribe(callback: () => void) {
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystemChange = (e: MediaQueryListEvent) => {
    // Follow the system only when the user hasn't made an explicit choice
    if (readStoredPreference() === null) {
      setThemeOnDocument(e.matches ? 'dark' : 'light', false)
    }
    callback()
  }
  const onExternalChange = () => callback()
  mql.addEventListener('change', onSystemChange)
  window.addEventListener(THEME_EVENT, onExternalChange)
  window.addEventListener('storage', onExternalChange)
  return () => {
    mql.removeEventListener('change', onSystemChange)
    window.removeEventListener(THEME_EVENT, onExternalChange)
    window.removeEventListener('storage', onExternalChange)
  }
}

function getSnapshot() {
  return document.documentElement.getAttribute('data-theme') ?? 'light'
}

function getServerSnapshot() {
  // The inline script in the layout sets data-theme before first paint;
  // the server-rendered placeholder only needs a stable value.
  return 'light'
}

export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = () => {
    setThemeOnDocument(theme === 'dark' ? 'light' : 'dark', true)
  }

  const isDark = theme === 'dark'
  const label = isDark ? 'Alternar para o tema claro' : 'Alternar para o tema escuro'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'flex items-center justify-center p-2 rounded-md text-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
