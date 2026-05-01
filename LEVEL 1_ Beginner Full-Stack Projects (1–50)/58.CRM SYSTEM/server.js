const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

let customers = [];

app.get('/api/customers', (req, res) => {
    res.json(customers);
});

app.post('/api/customers', (req, res) => {
    const { name, email, phone } = req.body;
    if(name && email && phone){
        const customer = { id: Date.now(), name, email, phone };
        customers.unshift(customer);
        res.json(customer);
    } else {
        res.status(400).json({ error: "Invalid data" });
    }
});

app.delete('/api/customers/:id', (req, res) => {
    const id = parseInt(req.params.id);
    customers = customers.filter(c => c.id !== id);
    res.json({ message: "Customer deleted" });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});