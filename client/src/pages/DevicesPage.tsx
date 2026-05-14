import DashboardLayout from '../components/layout/DashboardLayout'
import styles from './DashboardContent.module.css'

type DeviceStatus = 'Online' | 'Offline' | 'Warning'

interface Device {
    id: string
    name: string
    status: DeviceStatus
    lastSeen: string
    sensors: string[]
}

const DEVICES: Device[] = [
    {
        id: 'greenhouse-001',
        name: 'Main Greenhouse Node',
        status: 'Online',
        lastSeen: 'Just now',
        sensors: ['Temperature', 'Humidity', 'Soil Moisture', 'Air Quality', 'Light Level'],
    },
]

const STATUS_CLASS: Record<DeviceStatus, string> = {
    Online:  styles.statusOnline,
    Offline: styles.statusOffline,
    Warning: styles.statusWarning,
}

export default function DevicesPage() {
    return (
        <DashboardLayout>
            <div className={styles.header}>
                <h2 className={styles.title}>Device Overview</h2>
                <span className={styles.subtitle}>{DEVICES.length} device{DEVICES.length !== 1 ? 's' : ''} registered</span>
            </div>
            <div className={styles.list}>
                {DEVICES.map(d => (
                    <div key={d.id} className={styles.card}>
                        <div className={styles.deviceHeader}>
                            <div>
                                <h3 className={styles.cardTitle}>{d.name}</h3>
                                <code className={styles.deviceId}>{d.id}</code>
                            </div>
                            <span className={`${styles.statusDot} ${STATUS_CLASS[d.status]}`}>
                                {d.status}
                            </span>
                        </div>
                        <p className={styles.placeholder}>Last seen: {d.lastSeen}</p>
                        <div className={styles.sensorTags}>
                            {d.sensors.map(s => (
                                <span key={s} className={styles.sensorTag}>{s}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    )
}
