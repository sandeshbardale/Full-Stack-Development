const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

let products = [
    { id: 1, name: "Laptop", price: 45000 },
    { id: 2, name: "Smartphone", price: 15000 },
    { id: 3, name: "Headphones", price: 2000 },
    { id: 4, name: "Smartwatch", price: 5000 }
];

let orders = [];

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/order', (req, res) => {
    const { items, total } = req.body;
    if(items && items.length > 0){
        const order = { id: Date.now(), items, total, timestamp: new Date() };
        orders.push(order);
        res.json({ message: "Order placed successfully", order });
    } else {
        res.status(400).json({ error: "Invalid order" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});