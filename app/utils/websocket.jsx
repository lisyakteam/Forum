import { useEffect } from 'react';

export const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL

export const useWebSocket = (threadId, onMessage, onArchive, user) => {
    useEffect(() => {
        if (!threadId) return;
        const ws = new WebSocket(WEBSOCKET_URL);

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'subscribe', threadId }));
            if (user) ws.send(JSON.stringify({ type: 'auth', userId: user.id }));
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === 'new_message') onMessage(msg.data);
            if (msg.type === 'thread_archived') onArchive();
        };

        return () => ws.close();
    }, [threadId, user?.id]);
};
