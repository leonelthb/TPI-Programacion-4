import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Cambiar al tema ${isDark ? 'claro' : 'oscuro'}`}
      aria-pressed={isDark}
      className="fixed bottom-5 right-5 z-[100] inline-flex items-center gap-2 rounded-full bg-food-green px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-food-green-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-food-orange"
    >
      {isDark ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
      <span>{isDark ? 'Tema claro' : 'Tema oscuro'}</span>
    </button>
  )
}
