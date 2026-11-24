import {Moon, Sun, Monitor} from "lucide-react"
import {useTheme} from "../../providers/ThemeProvider"

export function ThemeToggle({variant = 'compact'}: {variant?: 'compact' | 'menu'}) {
    const {theme, setTheme} = useTheme()
    const menu = variant === 'menu'
    const optionClass = (value: typeof theme) => `${menu ? 'flex min-h-12 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px]' : 'p-1.5'} rounded-md hover:bg-surface-variant focus-visible:outline-2 focus-visible:outline-primary ${theme === value ? 'bg-surface-variant text-on-background' : 'text-outline hover:text-on-background'}`

    return (
        <div className={menu ? 'grid w-full grid-cols-3 gap-0.5 rounded-lg bg-surface-variant/35 p-0.5' : 'flex items-center gap-0.5'} role="group" aria-label="Apariencia">
            <button
                onClick={() => setTheme("light")}
                className={optionClass('light')}
                data-tooltip={menu ? undefined : 'Claro'}
                aria-label="Tema claro"
                aria-pressed={theme === 'light'}
            >
                <Sun size={16} aria-hidden="true"/>{menu && <span>Claro</span>}
            </button>
            <button
                onClick={() => setTheme("system")}
                className={optionClass('system')}
                data-tooltip={menu ? undefined : 'Sistema'}
                aria-label="Tema del sistema"
                aria-pressed={theme === 'system'}
            >
                <Monitor size={16} aria-hidden="true"/>{menu && <span>Sistema</span>}
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={optionClass('dark')}
                data-tooltip={menu ? undefined : 'Oscuro'}
                aria-label="Tema oscuro"
                aria-pressed={theme === 'dark'}
            >
                <Moon size={16} aria-hidden="true"/>{menu && <span>Oscuro</span>}
            </button>
        </div>
    )
}
