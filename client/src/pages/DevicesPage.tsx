import { Fragment } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useDeviceOverview, type DeviceOverview, type ActuatorStatus } from '../hooks/useDeviceOverview'
import styles from './DashboardContent.module.css'

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
}

function Esp32Row({ device }: { device: DeviceOverview }) {
    return (
        <div className={styles.deviceRow}>
            <span className={styles.deviceName}>{device.deviceId}</span>
            <span className={styles.deviceLastSeen}>
                Last seen: {formatTime(device.lastSeen)}
            </span>
            <span className={`${styles.deviceStatus} ${device.online ? styles.deviceOnline : styles.deviceOffline}`}>
                <span className={styles.deviceDot} />
                {device.online ? 'online' : 'offline'}
            </span>
        </div>
    )
}

function ActuatorRow({ actuator, esp32Online }: { actuator: ActuatorStatus; esp32Online: boolean }) {
    return (
        <div className={styles.deviceRow}>
            <div className={styles.deviceInfo}>
                <span className={styles.deviceName}>{actuator.name}</span>
                <span className={styles.deviceLastSeen}>
                    {esp32Online ? 'Controlled by ESP32' : 'Not controllable'}
                </span>
            </div>
            <span className={styles.tag}>{actuator.mode}</span>
            <span className={`${styles.statusDot} ${actuator.on ? styles.statusOnline : styles.statusOffline}`}>
                {actuator.state}
            </span>
        </div>
    )
}

export default function DevicesPage() {
    const { overview, loading, error } = useDeviceOverview()

    return (
        <DashboardLayout>
            <div className={styles.header}>
                <h2 className={styles.title}>Device Overview</h2>
            </div>

            {loading && <p className={styles.stateMsg}>Loading…</p>}
            {!loading && error && <p className={styles.stateMsgError}>Error: {error}</p>}

            {!loading && !error && (
                <div className={styles.deviceList}>
                    {overview.map(device => (
                        <Fragment key={device.deviceId}>
                            <Esp32Row device={device} />
                            {device.actuators.map(actuator => (
                                <ActuatorRow
                                    key={`${device.deviceId}-${actuator.type}`}
                                    actuator={actuator}
                                    esp32Online={device.online}
                                />
                            ))}
                        </Fragment>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
