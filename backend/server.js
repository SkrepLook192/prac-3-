const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = 3000;
const WS_PORT = 4000;
const app = express();
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Читаем товары из JSON
const productsFilePath = path.join(__dirname, 'products.json');
const getProducts = () => {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(data);
};

// Определяем GraphQL-схему
const schema = buildSchema(`
    type Product {
        id: Int
        name: String
        price: Int
        description: String
        categories: [String]
    }

    type Query {
        products: [Product]
        product(id: Int!): Product
    }
`);

// Описываем, как сервер отвечает на запросы
const root = {
    products: () => getProducts(),
    product: ({ id }) => getProducts().find(p => p.id === id)
};

// Добавляем GraphQL в Express
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));

// Запуск HTTP-сервера
const server = app.listen(PORT, () => 
    console.log(`Buyer server running on http://localhost:${PORT}`)
);

// Запуск WebSocket-сервера
const wss = new WebSocketServer({ port: WS_PORT });

let adminWs = null; // Переменная для хранения соединения администратора
const clients = new Map();

wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    const tabId = Math.random().toString(36).substr(2, 9); // Генерация уникального tabId для вкладки
    clients.set(clientId, { ws, tabId });
    console.log(`Клиент ${clientId} подключился с tabId: ${tabId}`);

    // Отправляем уникальный ID клиенту
    ws.send(JSON.stringify({ type: 'setClientId', clientId, tabId }));

    // Определяем, кто администратор
    if (!adminWs) {
        adminWs = ws; // Первый подключившийся становится администратором
        console.log(`Админ подключился с ID: ${clientId}`);
    }

    // Обрабатываем полученные сообщения от клиентов
    // ... (остальной код сервера без изменений)

ws.on('message', (message) => {
    console.log(`Получено сообщение от ${clientId}: ${message}`);

    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'chat') {
        const { text, tabId: messageTabId } = parsedMessage;
        const messageToSend = {
            from: clientId,
            text: text,
            type: 'chat',
            tabId: messageTabId
        };

        clients.forEach((clientData) => {
            if (clientData.ws !== ws && clientData.tabId === messageTabId) {
                console.log(`Отправляем сообщение на вкладку с tabId: ${clientData.tabId}, текущий tabId: ${messageTabId}`);
                clientData.ws.send(JSON.stringify(messageToSend));
            }
        });

        if (adminWs && adminWs.readyState === adminWs.OPEN && adminWs.tabId === messageTabId) {
            adminWs.send(JSON.stringify(messageToSend));
        }
    }
});

// ... (остальной код сервера без изменений)

    ws.on('close', () => {
        console.log(`Клиент ${clientId} отключился`);
        clients.delete(clientId);
        if (adminWs === ws) {
            adminWs = null; // Если админ отключился, сбрасываем ссылку на его WebSocket
        }
    });
});

console.log('WebSocket сервер запущен на ws://localhost:4000');
