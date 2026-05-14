import DashboardLayout from '../components/layout/DashboardLayout'
import { useDeviceStatus, type DeviceStatus } from '../hooks/useDeviceStatus'
import styles from './DashboardContent.module.css'

const KNOWN_ACTUATORS = [
    { deviceId: 'water-pump', label: 'Water Pump' },
    { deviceId: 'fan',        label: 'Fan'        },
]

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
}

function DeviceRow({ deviceId, label, device }: {
    deviceId: string
    label:    string
    device:   DeviceStatus | undefined
}) {
    const isOnline = device?.isOnline ?? false
    return (
        <div className={styles.deviceRow}>
            <span className={styles.deviceName}>{label}</span>
            {device?.lastSeen && (
                <span className={styles.deviceLastSeen}>
                    Last seen: {formatTime(device.lastSeen)}
                </span>
            )}
            <span className={`${styles.deviceStatus} ${isOnline ? styles.deviceOnline : styles.deviceOffline}`}>
                <span className={styles.deviceDot} />
                {isOnline ? 'online' : 'offline'}
            </span>
        </div>
    )
}

export default function DevicesPage() {
    const { devices, loading, error } = useDeviceStatus()

    const byId = Object.fromEntries(devices.map(d => [d.deviceId, d]))

    const sensorDevices = devices.filter(
        d => !KNOWN_ACTUATORS.some(a => a.deviceId === d.deviceId)
    )

    return (
        <DashboardLayout>
            <div className={styles.header}>
                <h2 className={styles.title}>Device Overview</h2>
            </div>

            {loading && <p className={styles.stateMsg}>Loading…</p>}
            {!loading && error && <p className={styles.stateMsgError}>Error: {error}</p>}

            {!loading && !error && (
                <div className={styles.deviceList}>
                    {sensorDevices.map(d => (
                        <DeviceRow key={d.deviceId} deviceId={d.deviceId} label={d.deviceId} device={d} />
                    ))}
                    {KNOWN_ACTUATORS.map(a => (
                        <DeviceRow key={a.deviceId} deviceId={a.deviceId} label={a.label} device={byId[a.deviceId]} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
