const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

let items = [];

app.get('/api/items', (req, res) => {
    res.json(items);
});

app.post('/api/items', (req, res) => {
    const { name, quantity, price } = req.body;
    if(name && quantity && price){
        const item = { id: Date.now(), name, quantity, price };
        items.unshift(item);
        res.json(item);
    } else {
        res.status(400).json({ error: "Invalid data" });
    }
});

app.delete('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    items = items.filter(item => item.id !== id);
    res.json({ message: "Item deleted" });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});