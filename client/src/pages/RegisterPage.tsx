import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './LoginPage.module.css'

interface FormErrors {
    email?: string
    password?: string
    confirm?: string
    general?: string
}

function validateEmail(email: string): string | undefined {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
}

function validatePassword(password: string): string | undefined {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
}

function validateConfirm(password: string, confirm: string): string | undefined {
    if (!confirm) return 'Please confirm your password'
    if (password !== confirm) return 'Passwords do not match'
}

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth()

    const [email, setEmail]       = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm]   = useState('')
    const [errors, setErrors]     = useState<FormErrors>({})
    const [loading, setLoading]   = useState(false)
    const [touched, setTouched]   = useState({ email: false, password: false, confirm: false })

    function handleBlur(field: 'email' | 'password' | 'confirm') {
        setTouched(t => ({ ...t, [field]: true }))
        setErrors(prev => ({
            ...prev,
            email:    field === 'email'    ? validateEmail(email)                   : prev.email,
            password: field === 'password' ? validatePassword(password)             : prev.password,
            confirm:  field === 'confirm'  ? validateConfirm(password, confirm)     : prev.confirm,
        }))
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        const emailErr    = validateEmail(email)
        const passwordErr = validatePassword(password)
        const confirmErr  = validateConfirm(password, confirm)

        if (emailErr || passwordErr || confirmErr) {
            setErrors({ email: emailErr, password: passwordErr, confirm: confirmErr })
            setTouched({ email: true, password: true, confirm: true })
            return
        }

        setLoading(true)
        setErrors({})
        try {
            await register(email, password)
            navigate('/dashboard')
        } catch (err) {
            setErrors({ general: err instanceof Error ? err.message : 'Registration failed' })
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

                <h1 className={styles.heading}>Create account</h1>
                <p className={styles.sub}>Register to access your greenhouse</p>

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
                            autoComplete="new-password"
                            placeholder="Min. 8 characters"
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

                    <div className={styles.field}>
                        <label htmlFor="confirm" className={styles.label}>Confirm Password</label>
                        <input
                            id="confirm"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            onBlur={() => handleBlur('confirm')}
                            className={`${styles.input} ${touched.confirm && errors.confirm ? styles.inputError : ''}`}
                            aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                            aria-invalid={!!errors.confirm}
                        />
                        {touched.confirm && errors.confirm && (
                            <span id="confirm-error" className={styles.fieldError} role="alert">{errors.confirm}</span>
                        )}
                    </div>

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? <span className={styles.spinner} aria-label="Creating account…" /> : 'Create Account'}
                    </button>
                </form>

                <p className={styles.hint}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#22c55e', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    )
}
