const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/products', (req, res) => {
    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Ошибка загрузки товаров');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));