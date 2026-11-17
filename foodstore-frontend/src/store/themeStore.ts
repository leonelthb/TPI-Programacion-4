import { create } from 'zustand'

type Theme = 'light' | 'dark'

type ThemeState = {
  theme: Theme
  toggleTheme: () => void
}

function readSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const savedTheme = window.localStorage.getItem('foodstore-theme')
  const theme: Theme = savedTheme === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  return theme
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readSavedTheme(),
  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('foodstore-theme', theme)
    set({ theme })
  },
}))
