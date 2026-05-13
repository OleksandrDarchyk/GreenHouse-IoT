import DashboardLayout from '../components/layout/DashboardLayout'
import SensorCards from '../components/dashboard/SensorCards'
import { useSensorData } from '../hooks/useSensorData'

export default function DashboardPage() {
    const sensorData = useSensorData()

    const alertCount = sensorData ? [
        sensorData.soilMoisture.value < 35,
        sensorData.temperature.value > 30,
        sensorData.airQuality.value > 150,
    ].filter(Boolean).length : 0

    return (
        <DashboardLayout alertCount={alertCount}>
            {sensorData
                ? <SensorCards data={sensorData} />
                : <p>Connecting…</p>}
        </DashboardLayout>
    )
}