import { BASE_URL } from '../config/api'
import { SensorReadingClient, AuthClient } from './generated/generated-ts-client'

const customFetch = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    const token = localStorage.getItem('token')
    return fetch(url, {
        ...init,
        headers: {
            ...init?.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })
}

const http = { fetch: customFetch }

export const api = {
    sensorReading: new SensorReadingClient(BASE_URL, http),
    auth:          new AuthClient(BASE_URL, http),
}
