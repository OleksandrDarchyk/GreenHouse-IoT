const local = "http://localhost:5110";
const prod  = "https://greenhouse-iot-api.fly.dev";

export const BASE_URL = import.meta.env.PROD ? prod : local;
export const SSE_URL  = `${BASE_URL}/sse`;
