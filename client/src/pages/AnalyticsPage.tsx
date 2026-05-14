import DashboardLayout from '../components/layout/DashboardLayout'
import styles from './DashboardContent.module.css'

export default function AnalyticsPage() {
    return (
        <DashboardLayout>
            <div className={styles.header}>
                <h2 className={styles.title}>Historical Data</h2>
            </div>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Temperature & Humidity</h3>
                    <p className={styles.placeholder}>Chart will be displayed here</p>
                </div>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Soil Moisture</h3>
                    <p className={styles.placeholder}>Chart will be displayed here</p>
                </div>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Air Quality</h3>
                    <p className={styles.placeholder}>Chart will be displayed here</p>
                </div>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Light Level</h3>
                    <p className={styles.placeholder}>Chart will be displayed here</p>
                </div>
            </div>
        </DashboardLayout>
    )
}
