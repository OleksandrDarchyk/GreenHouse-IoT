import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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

    const [email, setEmail]       = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors]     = useState<FormErrors>({})
    const [loading, setLoading]   = useState(false)
    const [touched, setTouched]   = useState({ email: false, password: false })

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
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onBlur={() => handleBlur('password')}
                            className={`${styles.input} ${touched.password && errors.password ? styles.inputError : ''}`}
                            aria-describedby={errors.password ? 'pw-error' : undefined}
                            aria-invalid={!!errors.password}
                        />
                        {touched.password && errors.password && (
                            <span id="pw-error" className={styles.fieldError} role="alert">{errors.password}</span>
                        )}
                    </div>

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? <span className={styles.spinner} aria-label="Signing in…" /> : 'Sign In'}
                    </button>
                </form>

                <p className={styles.hint}>Demo: any email + 4+ char password</p>
            </div>
        </div>
    )
}