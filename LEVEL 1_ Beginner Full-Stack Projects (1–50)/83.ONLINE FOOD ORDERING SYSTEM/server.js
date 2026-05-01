const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

let menu = [
    { id: 1, name: "Pizza", price: 199 },
    { id: 2, name: "Burger", price: 99 },
    { id: 3, name: "Pasta", price: 149 },
    { id: 4, name: "Sandwich", price: 79 }
];

let orders = [];

app.get('/api/menu', (req, res) => {
    res.json(menu);
});

app.post('/api/order', (req, res) => {
    const { items, total } = req.body;
    if(items && items.length > 0){
        const order = { id: Date.now(), items, total, time: new Date() };
        orders.push(order);
        res.json({ message: "Order placed successfully", order });
    } else {
        res.status(400).json({ error: "Invalid order" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});