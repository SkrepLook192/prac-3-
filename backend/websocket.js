const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 4001 });

const clients = new Map();

wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(clientId, ws);
    console.log(`Клиент ${clientId} подключился`);

    // Отправляем уникальный ID клиенту
    ws.send(JSON.stringify({ type: 'setClientId', clientId }));

    // Обрабатываем полученные сообщения от клиентов
    ws.on('message', (message) => {
        console.log(`Получено сообщение от ${clientId}: ${message}`);

        // Обрабатываем полученное сообщение
        const parsedMessage = JSON.parse(message);

        // Если это обычное сообщение чата, отправляем его обратно
        if (parsedMessage.type === 'chat') {
            const messageToSend = {
                from: clientId,
                text: parsedMessage.text,
                type: 'chat'
            };
            // Отправляем сообщение только тому клиенту, который отправил его
            ws.send(JSON.stringify(messageToSend));
        }
    });

    ws.on('close', () => {
        console.log(`Клиент ${clientId} отключился`);
        clients.delete(clientId);
    });
});

console.log('WebSocket сервер запущен на ws://localhost:4000');
