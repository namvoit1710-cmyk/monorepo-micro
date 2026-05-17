import { ENDPOINTS } from "@common/configs/endpoints.config";
import { SocketClient } from "@common/configs/socket";

export const socketInstance = new SocketClient({
    baseUrl: ENDPOINTS.CONTROL_PLANE,
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const pushGatewaySocket = new SocketClient({
    baseUrl: `${import.meta.env.VITE_URL_PUSH_GATEWAY}/v1/pushgateway`,
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
})