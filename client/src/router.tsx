import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router-dom'
import MainLayout    from '@layouts/MainLayout'
import LoginPage     from '@pages/LoginPage'
import RegisterPage  from '@pages/RegisterPage'
import DashboardPage from '@pages/DashboardPage'
import ProtectedRoute from '@layouts/ProtectedRoute'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="login"    element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="dashboard" element={
                <ProtectedRoute>
                    <DashboardPage />
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Route>
    )
)

export default router
