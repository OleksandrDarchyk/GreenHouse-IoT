import { useState, ReactNode, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './DashboardLayout.module.css'

export type NavTab = 'overview' | 'analytics' | 'controls' | 'automation' | 'alerts' | 'devices'

interface NavItem { id: NavTab; label: string; icon: string; path: string }

const NAV_ITEMS: NavItem[] = [
    { id: 'overview',    label: 'Overview',             icon: '◈', path: '/dashboard' },
    { id: 'analytics',  label: 'Historical Data',       icon: '⌇', path: '/dashboard/analytics' },
    { id: 'controls',   label: 'Manual Controls',       icon: '⚙', path: '/dashboard/controls' },
    { id: 'automation', label: 'Automation Settings',   icon: '⚡', path: '/dashboard/automation' },
    { id: 'alerts',     label: 'Alerts',                icon: '⚐', path: '/dashboard/alerts' },
    { id: 'devices',    label: 'Device Overview',       icon: '⊞', path: '/dashboard/devices' },
]

interface Props { children: ReactNode; alertCount?: number }

export default function DashboardLayout({ children, alertCount = 0 }: Props) {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout, user } = useAuth()
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(id)
    }, [])

    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const activeTab = NAV_ITEMS.find(n => location.pathname === n.path)?.id ?? 'overview'

    function handleLogout() { logout(); navigate('/login') }

    return (
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>🌿</span>
                    <div className={styles.logoText}>
                        <span className={styles.logoName}>GreenCore</span>
                        <span className={styles.logoSub}>IoT System</span>
                    </div>
                </div>

                <nav className={styles.nav} aria-label="Main navigation">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activeTab === item.id ? styles.navActive : ''}`}
                            onClick={() => navigate(item.path)}
                            aria-current={activeTab === item.id ? 'page' : undefined}
                        >
                            <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                            {item.id === 'overview' && alertCount > 0 && (
                                <span className={styles.badge}>{alertCount}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.avatar}>{user?.name?.slice(0,2).toUpperCase() ?? 'LC'}</div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.email?.split('@')[0] ?? 'User'}</span>
                        <span className={styles.userRole}>Operator</span>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Sign out">⏻</button>
                </div>
            </aside>

            <div className={styles.main}>
                <header className={styles.topbar}>
                    <div>
                        <h1 className={styles.topTitle}>Smart Greenhouse</h1>
                        <p className={styles.topSub}>IoT Monitoring &amp; Control System</p>
                    </div>
                    <div className={styles.topBadges}>
                        <div className={`${styles.topBadge} ${styles.badgeOnline}`}>
                            <span className={styles.pulseDot} aria-hidden="true" /> Connected
                        </div>
                        <div className={`${styles.topBadge} ${styles.badgeAuto}`}>
                            <span aria-hidden="true">⚡</span> Auto ON
                        </div>
                        <div className={`${styles.topBadge} ${styles.badgeTime}`}>
                            <span aria-hidden="true">◷</span> {timeStr}
                        </div>
                    </div>
                </header>
                <main className={styles.content}>{children}</main>
            </div>
        </div>
    )
}