import DashboardLayout from '../components/layout/DashboardLayout'
import { useAlerts, type AlertRecord } from '../hooks/useAlerts'
import styles from './DashboardContent.module.css'

const SEVERITY_CLASS: Record<string, string> = {
    Critical: styles.severityCritical,
    Warning:  styles.severityWarning,
    Info:     styles.severityInfo,
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit',
    })
}

function AlertRow({ a }: { a: AlertRecord }) {
    return (
        <div className={`${styles.alertRow} ${a.isResolved ? styles.alertResolved : ''}`}>
            <span className={`${styles.severityTag} ${SEVERITY_CLASS[a.severity] ?? styles.severityInfo}`}>
                {a.severity}
            </span>
            <span className={styles.alertMsg}>{a.message}</span>
            <span className={styles.alertTime}>{formatTime(a.createdAt)}</span>
            <span className={styles.alertStatus}>{a.isResolved ? 'Resolved' : 'Active'}</span>
        </div>
    )
}

export default function AlertsPage() {
    const { alerts, loading, error } = useAlerts()
    const active = alerts.filter(a => !a.isResolved).length

    return (
        <DashboardLayout alertCount={active}>
            <div className={styles.header}>
                <h2 className={styles.title}>Alerts</h2>
                {active > 0 && (
                    <span className={styles.alertBadge}>{active} active</span>
                )}
            </div>

            {loading && <p className={styles.stateMsg}>Loading…</p>}
            {!loading && error && <p className={styles.stateMsgError}>Error: {error}</p>}
            {!loading && !error && alerts.length === 0 && (
                <p className={styles.stateMsg}>No alerts recorded.</p>
            )}
            {!loading && !error && alerts.length > 0 && (
                <div className={styles.list}>
                    {alerts.map(a => <AlertRow key={a.id} a={a} />)}
                </div>
            )}
        </DashboardLayout>
    )
}
