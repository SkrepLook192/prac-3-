const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');

const ADMIN_PORT = 8080;
const adminApp = express();

adminApp.use(express.json());
adminApp.use(cors());

const productsFilePath = path.join(__dirname, 'products.json');

// Статические файлы для админки
adminApp.use(express.static(path.join(__dirname, 'public')));

// Главная страница админа
adminApp.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Запуск сервера админки
adminApp.listen(ADMIN_PORT, () => {
    console.log(`Admin server running on http://localhost:${ADMIN_PORT}`);
});

// WebSocket соединение для администратора
const ws = new WebSocket('ws://localhost:4000'); // Подключение к серверу WebSocket

ws.on('open', () => {
    console.log('Админ подключен к WebSocket серверу');
});

ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'chat') {
        console.log(`Новое сообщение от пользователя ${parsedMessage.from}: ${parsedMessage.text}`);
    }
});

ws.on('close', () => {
    console.log('Соединение с WebSocket сервером закрыто');
});
