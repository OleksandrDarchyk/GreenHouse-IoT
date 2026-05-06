import { useState, useCallback } from 'react'

interface AuthState {
    isAuthenticated: boolean
    user: { name: string; email: string } | null
    token: string | null
}

const stored = sessionStorage.getItem('gh_auth')
const initialState: AuthState = stored
    ? JSON.parse(stored)
    : { isAuthenticated: false, user: null, token: null }

let globalState = initialState
const listeners = new Set<() => void>()

function notifyListeners() {
    listeners.forEach(fn => fn())
}

export function useAuth() {
    const [, forceRender] = useState(0)

    const subscribe = useCallback(() => {
        const fn = () => forceRender(n => n + 1)
        listeners.add(fn)
        return () => listeners.delete(fn)
    }, [])

    useState(subscribe)

    const login = useCallback(async (email: string, password: string): Promise<void> => {
        // TODO: replace with real API call
        // const res = await fetch('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password }) })
        // const data = await res.json()
        // globalState = { isAuthenticated: true, user: data.user, token: data.token }

        if (!email || !password) throw new Error('Please fill in all fields')
        if (password.length < 4) throw new Error('Password must be at least 4 characters')

        await new Promise(r => setTimeout(r, 800))

        globalState = {
            isAuthenticated: true,
            user: { name: 'LC', email },
            token: 'mock-jwt-token',
        }
        sessionStorage.setItem('gh_auth', JSON.stringify(globalState))
        notifyListeners()
    }, [])

    const logout = useCallback(() => {
        globalState = { isAuthenticated: false, user: null, token: null }
        sessionStorage.removeItem('gh_auth')
        notifyListeners()
    }, [])

    return {
        isAuthenticated: globalState.isAuthenticated,
        user: globalState.user,
        token: globalState.token,
        login,
        logout,
    }
}