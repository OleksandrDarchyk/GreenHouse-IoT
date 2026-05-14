import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import styles from './DashboardContent.module.css'

interface Control { id: string; label: string; description: string }

const CONTROLS: Control[] = [
    { id: 'irrigation',  label: 'Irrigation',   description: 'Water pump for plant irrigation' },
    { id: 'ventilation', label: 'Ventilation',  description: 'Fans for air circulation' },
    { id: 'lighting',    label: 'Lighting',     description: 'Artificial grow lights' },
    { id: 'heating',     label: 'Heating',      description: 'Heating system for temperature control' },
]

export default function ControlsPage() {
    const [active, setActive] = useState<Record<string, boolean>>({})

    function toggle(id: string) {
        setActive(prev => ({ ...prev, [id]: !prev[id] }))
    }

    return (
        <DashboardLayout>
            <div className={styles.header}>
                <h2 className={styles.title}>Manual Controls</h2>
                <span className={styles.subtitle}>Direct control of greenhouse systems</span>
            </div>
            <div className={styles.grid}>
                {CONTROLS.map(c => (
                    <div key={c.id} className={styles.card}>
                        <div className={styles.controlRow}>
                            <div>
                                <h3 className={styles.cardTitle}>{c.label}</h3>
                                <p className={styles.placeholder}>{c.description}</p>
                            </div>
                            <button
                                className={`${styles.toggle} ${active[c.id] ? styles.toggleOn : ''}`}
                                onClick={() => toggle(c.id)}
                                aria-label={`Toggle ${c.label}`}
                            >
                                {active[c.id] ? 'ON' : 'OFF'}
                            </button>
                        </div>
                        <div className={`${styles.statusBar} ${active[c.id] ? styles.statusBarOn : ''}`} />
                    </div>
                ))}
            </div>
        </DashboardLayout>
    )
}
