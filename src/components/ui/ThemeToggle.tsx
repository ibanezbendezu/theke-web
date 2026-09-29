import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "../../providers/ThemeProvider"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex items-center gap-0.5" role="group" aria-label="Apariencia">
            <button
                onClick={() => setTheme("light")}
                className={`rounded-md p-1.5 hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary ${theme === 'light' ? 'bg-surface-variant text-on-background' : 'text-outline hover:text-on-background'}`}
                title="Claro"
                aria-label="Tema claro"
                aria-pressed={theme === 'light'}
            >
                <Sun size={16} />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`rounded-md p-1.5 hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary ${theme === 'system' ? 'bg-surface-variant text-on-background' : 'text-outline hover:text-on-background'}`}
                title="Sistema"
                aria-label="Tema del sistema"
                aria-pressed={theme === 'system'}
            >
                <Monitor size={16} />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`rounded-md p-1.5 hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary ${theme === 'dark' ? 'bg-surface-variant text-on-background' : 'text-outline hover:text-on-background'}`}
                title="Oscuro"
                aria-label="Tema oscuro"
                aria-pressed={theme === 'dark'}
            >
                <Moon size={16} />
            </button>
        </div>
    )
}
