import DashboardLayout from '../components/layout/DashboardLayout'
import styles from './DashboardContent.module.css'

type Severity = 'Critical' | 'Warning' | 'Info'

interface Alert {
    id: number
    severity: Severity
    message: string
    time: string
    resolved: boolean
}

const MOCK_ALERTS: Alert[] = [
    { id: 1, severity: 'Critical', message: 'Soil moisture below 20% — irrigation required',      time: '14:32', resolved: false },
    { id: 2, severity: 'Warning',  message: 'Temperature exceeded 35°C — ventilation activated',  time: '13:15', resolved: true  },
    { id: 3, severity: 'Warning',  message: 'Air quality above 150 PPM',                          time: '11:48', resolved: true  },
    { id: 4, severity: 'Info',     message: 'Device greenhouse-001 reconnected',                   time: '10:02', resolved: true  },
]

const SEVERITY_CLASS: Record<Severity, string> = {
    Critical: styles.severityCritical,
    Warning:  styles.severityWarning,
    Info:     styles.severityInfo,
}

export default function AlertsPage() {
    const active = MOCK_ALERTS.filter(a => !a.resolved)

    return (
        <DashboardLayout alertCount={active.length}>
            <div className={styles.header}>
                <h2 className={styles.title}>Alerts</h2>
                {active.length > 0 && (
                    <span className={styles.alertBadge}>{active.length} active</span>
                )}
            </div>
            {MOCK_ALERTS.length === 0 ? (
                <p className={styles.placeholder}>No alerts recorded.</p>
            ) : (
                <div className={styles.list}>
                    {MOCK_ALERTS.map(a => (
                        <div key={a.id} className={`${styles.alertRow} ${a.resolved ? styles.alertResolved : ''}`}>
                            <span className={`${styles.severityTag} ${SEVERITY_CLASS[a.severity]}`}>
                                {a.severity}
                            </span>
                            <span className={styles.alertMsg}>{a.message}</span>
                            <span className={styles.alertTime}>{a.time}</span>
                            <span className={styles.alertStatus}>{a.resolved ? 'Resolved' : 'Active'}</span>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
