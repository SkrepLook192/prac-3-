const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path'); // Оставляем только эту строку

const ADMIN_PORT = 8080;
const adminApp = express(); 

adminApp.use(express.json());
adminApp.use(cors());

const productsFilePath = path.join(__dirname, 'products.json');

adminApp.use(express.static(path.join(__dirname, 'public')));
adminApp.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Получение всех товаров
adminApp.get('/products', (req, res) => {
    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка загрузки товаров');
        res.json(JSON.parse(data));
    });
});

// Добавление новых товаров
adminApp.post('/products', (req, res) => {
    const newProducts = req.body;
    
    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка загрузки товаров');

        let products = JSON.parse(data);
        newProducts.forEach((p, index) => p.id = products.length + index + 1);
        products = [...products, ...newProducts];

        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), err => {
            if (err) return res.status(500).send('Ошибка сохранения товара');
            res.status(201).send('Товар(ы) добавлены');
        });
    });
});

// Обновление товара по ID
adminApp.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;

    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка загрузки товаров');

        let products = JSON.parse(data);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) return res.status(404).send('Товар не найден');

        products[productIndex] = { ...products[productIndex], ...updatedProduct };

        fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), err => {
            if (err) return res.status(500).send('Ошибка обновления товара');
            res.send('Товар обновлён');
        });
    });
});

// Удаление товара по ID
adminApp.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);

    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка загрузки товаров');

        let products = JSON.parse(data);
        const newProducts = products.filter(p => p.id !== productId);

        if (products.length === newProducts.length) return res.status(404).send('Товар не найден');

        fs.writeFile(productsFilePath, JSON.stringify(newProducts, null, 2), err => {
            if (err) return res.status(500).send('Ошибка удаления товара');
            res.send('Товар удалён');
        });
    });
});

// Запуск сервера
adminApp.listen(ADMIN_PORT, () => {
    console.log(`Admin server running on http://localhost:${ADMIN_PORT}`);
});
