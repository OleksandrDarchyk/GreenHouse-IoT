import { useState, useCallback } from 'react'
import { BASE_URL } from '../config/api'

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
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        if (res.status === 401) throw new Error('Invalid email or password.')
        if (!res.ok) throw new Error('Something went wrong. Please try again.')

        const data = await res.json()

        globalState = {
            isAuthenticated: true,
            user: { name: data.user.email.split('@')[0], email: data.user.email },
            token: data.accessToken,
        }
        sessionStorage.setItem('gh_auth', JSON.stringify(globalState))
        notifyListeners()
    }, [])

    const register = useCallback(async (email: string, password: string): Promise<void> => {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        if (res.status === 409) throw new Error('This email is already registered.')
        if (!res.ok) throw new Error('Something went wrong. Please try again.')

        const data = await res.json()

        globalState = {
            isAuthenticated: true,
            user: { name: data.user.email.split('@')[0], email: data.user.email },
            token: data.accessToken,
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
        register,
        logout,
    }
}