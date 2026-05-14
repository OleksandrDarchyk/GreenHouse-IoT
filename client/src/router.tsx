import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router-dom'
import MainLayout    from '@layouts/MainLayout'
import LoginPage     from '@pages/LoginPage'
import RegisterPage  from '@pages/RegisterPage'
import DashboardPage  from '@pages/DashboardPage'
import AnalyticsPage  from '@pages/AnalyticsPage'
import ControlsPage   from '@pages/ControlsPage'
import AutomationPage from '@pages/AutomationPage'
import AlertsPage     from '@pages/AlertsPage'
import DevicesPage    from '@pages/DevicesPage'
import ProtectedRoute from '@layouts/ProtectedRoute'

function Protected({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>
}

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="login"    element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            <Route path="dashboard"            element={<Protected><DashboardPage /></Protected>} />
            <Route path="dashboard/analytics"  element={<Protected><AnalyticsPage /></Protected>} />
            <Route path="dashboard/controls"   element={<Protected><ControlsPage /></Protected>} />
            <Route path="dashboard/automation" element={<Protected><AutomationPage /></Protected>} />
            <Route path="dashboard/alerts"     element={<Protected><AlertsPage /></Protected>} />
            <Route path="dashboard/devices"    element={<Protected><DevicesPage /></Protected>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
    )
)

export default router
