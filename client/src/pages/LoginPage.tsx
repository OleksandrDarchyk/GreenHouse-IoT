import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './LoginPage.module.css'

interface FormErrors {
    email?: string
    password?: string
    general?: string
}

function validateEmail(email: string): string | undefined {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
}

function validatePassword(password: string): string | undefined {
    if (!password) return 'Password is required'
    if (password.length < 4) return 'Password must be at least 4 characters'
}

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail]               = useState('')
    const [password, setPassword]         = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors]             = useState<FormErrors>({})
    const [loading, setLoading]           = useState(false)
    const [touched, setTouched]           = useState({ email: false, password: false })

    function handleBlur(field: 'email' | 'password') {
        setTouched(t => ({ ...t, [field]: true }))
        setErrors(prev => ({
            ...prev,
            [field]: field === 'email' ? validateEmail(email) : validatePassword(password),
        }))
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        const emailErr    = validateEmail(email)
        const passwordErr = validatePassword(password)
        if (emailErr || passwordErr) {
            setErrors({ email: emailErr, password: passwordErr })
            setTouched({ email: true, password: true })
            return
        }
        setLoading(true)
        setErrors({})
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err) {
            setErrors({ general: err instanceof Error ? err.message : 'Login failed' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.orb1} />
            <div className={styles.orb2} />

            <div className={styles.card}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>🌿</span>
                    <div>
                        <div className={styles.logoName}>GreenCore</div>
                        <div className={styles.logoSub}>IoT Control System</div>
                    </div>
                </div>

                <h1 className={styles.heading}>Welcome back</h1>
                <p className={styles.sub}>Sign in to monitor your greenhouse</p>

                {errors.general && (
                    <div className={styles.errorBanner} role="alert">{errors.general}</div>
                )}

                <form onSubmit={handleSubmit} noValidate className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onBlur={() => handleBlur('email')}
                            className={`${styles.input} ${touched.email && errors.email ? styles.inputError : ''}`}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            aria-invalid={!!errors.email}
                        />
                        {touched.email && errors.email && (
                            <span id="email-error" className={styles.fieldError} role="alert">{errors.email}</span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onBlur={() => handleBlur('password')}
                                className={`${styles.input} ${styles.inputPassword} ${touched.password && errors.password ? styles.inputError : ''}`}
                                aria-describedby={errors.password ? 'pw-error' : undefined}
                                aria-invalid={!!errors.password}
                            />
                            <button
                                type="button"
                                className={styles.eyeBtn}
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {touched.password && errors.password && (
                            <span id="pw-error" className={styles.fieldError} role="alert">{errors.password}</span>
                        )}
                    </div>

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? <span className={styles.spinner} aria-label="Signing in…" /> : 'Sign In'}
                    </button>
                </form>

                <p className={styles.hint}>
                    No account?{' '}
                    <Link to="/register" style={{ color: '#22c55e', fontWeight: 600 }}>Create one</Link>
                </p>
            </div>
        </div>
    )
}