import { SensorData, SensorReading, SensorStatus } from '../../hooks/useSensorData'
import styles from './SensorCards.module.css'

const STATUS_LABEL: Record<SensorStatus, string> = {
    normal:   'Normal',
    good:     'Good',
    warning:  'High',
    poor:     'Poor',
    critical: 'Critical',
}

const SENSOR_ORDER: Array<keyof SensorData> = [
    'temperature', 'humidity', 'soilMoisture', 'lightLevel',
]

function SensorCard({ sensorKey, reading }: { sensorKey: keyof SensorData; reading: SensorReading }) {
    return (
        <article
            className={`${styles.card} ${styles[`card--${sensorKey}`]}`}
            aria-label={`${reading.label}: ${reading.value} ${reading.unit}`}
        >
            <div className={styles.top}>
                <div className={`${styles.iconBubble} ${styles[`iconBubble--${sensorKey}`]}`}>
                    {reading.icon}
                </div>
                <span className={`${styles.statusTag} ${styles[`status_${reading.status}`]}`}>
          {STATUS_LABEL[reading.status]}
        </span>
            </div>
            <p className={styles.label}>{reading.label}</p>
            <div className={styles.valueRow}>
                <span className={styles.value}>{reading.value}</span>
                <span className={styles.unit}>{reading.unit}</span>
            </div>
        </article>
    )
}

export default function SensorCards({ data }: { data: SensorData }) {
    return (
        <section aria-label="Live sensor readings">
            <div className={styles.header}>
                <h2 className={styles.headerTitle}>Live Sensor Data</h2>
                <div className={styles.liveTag}>
                    <span className={styles.liveDot} aria-hidden="true" /> LIVE
                </div>
            </div>
            <div className={styles.grid}>
                {SENSOR_ORDER.map(key => (
                    <SensorCard key={key} sensorKey={key} reading={data[key]} />
                ))}
            </div>
        </section>
    )
}