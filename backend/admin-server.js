const adminApp = express();
const cors = require('cors');
const ADMIN_PORT = 8080;
adminApp.use(express.json());
adminApp.use(cors());

adminApp.get('/products', (req, res) => {
    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) res.status(500).send('Ошибка загрузки товаров');
        else res.json(JSON.parse(data));
    });
});

adminApp.post('/products', (req, res) => {
    const newProducts = req.body;
    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка загрузки товаров');
        let products = JSON.parse(data);
        newProducts.forEach((p, index) => p.id = products.length + index + 1);
        products = products.concat(newProducts);
        fs.writeFile('products.json', JSON.stringify(products, null, 2), err => {
            if (err) res.status(500).send('Ошибка сохранения товара');
            else res.status(201).send('Товар(ы) добавлены');
        });
    });
});

adminApp.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка загрузки товаров');
        let products = JSON.parse(data);
        products = products.map(p => (p.id === productId ? { ...p, ...updatedProduct } : p));
        fs.writeFile('products.json', JSON.stringify(products, null, 2), err => {
            if (err) res.status(500).send('Ошибка обновления товара');
            else res.send('Товар обновлён');
        });
    });
});

adminApp.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    fs.readFile('products.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка загрузки товаров');
        let products = JSON.parse(data);
        products = products.filter(p => p.id !== productId);
        fs.writeFile('products.json', JSON.stringify(products, null, 2), err => {
            if (err) res.status(500).send('Ошибка удаления товара');
            else res.send('Товар удалён');
        });
    });
});

adminApp.listen(ADMIN_PORT, () => console.log(`Admin server running on http://localhost:${ADMIN_PORT}`));
