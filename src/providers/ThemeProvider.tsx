import React, {createContext, useContext, useEffect, useState} from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
                                  children,
                                  defaultTheme = "system",
                                  storageKey = "theke-ui-theme",
                                  ...props
                              }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )

    useEffect(() => {
        const root = window.document.documentElement
        const preference = window.matchMedia("(prefers-color-scheme: dark)")
        const applyTheme = () => {
            const resolved = theme === "system" ? (preference.matches ? "dark" : "light") : theme
            root.classList.remove("light", "dark")
            root.classList.add(resolved)
            const favicon = document.getElementById("theke-favicon") as HTMLLinkElement | null
            if (favicon) favicon.href = resolved === "dark" ? "/ceratium-dark.svg" : "/ceratium-light.svg"
        }
        applyTheme()
        if (theme === "system") preference.addEventListener("change", applyTheme)
        return () => { if (theme === "system") preference.removeEventListener("change", applyTheme) }
    }, [theme])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

// El provider y su hook permanecen juntos para conservar la API pública existente.
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeProviderContext)
    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
    return context
}
