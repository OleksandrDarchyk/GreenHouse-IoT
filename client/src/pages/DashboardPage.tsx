import DashboardLayout from '../components/layout/DashboardLayout'
import SensorCards from '../components/dashboard/SensorCards'
import { useSensorData } from '../hooks/useSensorData'

export default function DashboardPage() {
    const sensorData = useSensorData(2000)

    const alertCount = [
        sensorData.soilMoisture.value < 35,
        sensorData.temperature.value > 30,
        sensorData.airQuality.value > 150,
    ].filter(Boolean).length

    return (
        <DashboardLayout alertCount={alertCount}>
            <SensorCards data={sensorData} />
        </DashboardLayout>
    )
}