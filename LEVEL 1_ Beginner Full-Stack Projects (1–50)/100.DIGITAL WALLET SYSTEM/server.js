const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const users = {
    'john.doe@example.com': {
        name: 'John Doe',
        email: 'john.doe@example.com',
        balance: 5247.50,
        income: 12450.00,
        expense: 7202.50,
        pending: 250.00,
        phone: '+1 (555) 123-4567',
        country: 'United States'
    },
    'sarah@example.com': {
        name: 'Sarah',
        email: 'sarah@example.com',
        balance: 3800.00,
        income: 8900.00,
        expense: 5100.00,
        pending: 0.00
    },
    'mike@example.com': {
        name: 'Mike',
        email: 'mike@example.com',
        balance: 7500.00,
        income: 15000.00,
        expense: 7500.00,
        pending: 500.00
    }
};

const transactions = [
    {
        id: 1,
        from: 'john.doe@example.com',
        to: 'sarah@example.com',
        amount: 150.00,
        description: 'Payment to Sarah',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed',
        type: 'sent'
    },
    {
        id: 2,
        from: 'salary@company.com',
        to: 'john.doe@example.com',
        amount: 3500.00,
        description: 'Salary Received',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'completed',
        type: 'received'
    }
];

let transactionId = 3;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/user', (req, res) => {
    const userEmail = 'john.doe@example.com';
    const user = users[userEmail];
    
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.post('/api/send', (req, res) => {
    const { recipientEmail, amount, description } = req.body;
    const senderEmail = 'john.doe@example.com';

    if (!recipientEmail || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    const sender = users[senderEmail];
    const recipient = users[recipientEmail];

    if (!sender) {
        return res.status(404).json({ message: 'Sender not found' });
    }

    if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
    }

    if (sender.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
    }

    sender.balance -= amount;
    sender.expense += amount;
    recipient.balance += amount;
    recipient.income += amount;

    const transaction = {
        id: transactionId++,
        from: senderEmail,
        to: recipientEmail,
        amount: amount,
        description: description || `Payment to ${recipientEmail}`,
        date: new Date(),
        status: 'completed',
        type: 'sent'
    };

    transactions.push(transaction);

    res.json({
        message: 'Money sent successfully',
        transaction: transaction,
        newBalance: sender.balance
    });
});

app.post('/api/receive-request', (req, res) => {
    const { senderEmail, amount, description } = req.body;
    const recipientEmail = 'john.doe@example.com';

    if (!senderEmail || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    const transaction = {
        id: transactionId++,
        from: senderEmail,
        to: recipientEmail,
        amount: amount,
        description: description || `Payment from ${senderEmail}`,
        date: new Date(),
        status: 'pending',
        type: 'receive'
    };

    transactions.push(transaction);

    res.json({
        message: 'Receive request created',
        transaction: transaction
    });
});

app.get('/api/transactions', (req, res) => {
    const userEmail = 'john.doe@example.com';
    const userTransactions = transactions.filter(t => 
        t.from === userEmail || t.to === userEmail
    );

    res.json(userTransactions);
});

app.get('/api/transactions/:id', (req, res) => {
    const transaction = transactions.find(t => t.id === parseInt(req.params.id));

    if (transaction) {
        res.json(transaction);
    } else {
        res.status(404).json({ message: 'Transaction not found' });
    }
});

app.post('/api/update-profile', (req, res) => {
    const { name, email, phone, country } = req.body;
    const userEmail = 'john.doe@example.com';
    const user = users[userEmail];

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (country) user.country = country;

    res.json({
        message: 'Profile updated successfully',
        user: user
    });
});

app.get('/api/transaction-stats', (req, res) => {
    const userEmail = 'john.doe@example.com';
    const user = users[userEmail];

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({
        balance: user.balance,
        income: user.income,
        expense: user.expense,
        pending: user.pending
    });
});

app.post('/api/verify-payment', (req, res) => {
    const { paymentCode } = req.body;
    const code = 'PAY-JD2024001';

    if (paymentCode === code) {
        res.json({
            message: 'Payment code verified',
            valid: true,
            user: 'john.doe@example.com'
        });
    } else {
        res.status(400).json({
            message: 'Invalid payment code',
            valid: false
        });
    }
});

app.get('/api/recipients', (req, res) => {
    const recipients = [
        { name: 'Sarah', email: 'sarah@example.com' },
        { name: 'Mike', email: 'mike@example.com' }
    ];

    res.json(recipients);
});

app.post('/api/add-recipient', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email required' });
    }

    const recipient = { name, email };
    res.json({
        message: 'Recipient added successfully',
        recipient: recipient
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Digital Wallet Server running on http://localhost:${PORT}`);
    console.log(`📍 Open browser and go to http://localhost:${PORT}`);
    console.log(`\n✅ API Endpoints:`);
    console.log(`   GET  /api/user`);
    console.log(`   POST /api/send`);
    console.log(`   POST /api/receive-request`);
    console.log(`   GET  /api/transactions`);
    console.log(`   GET  /api/transaction-stats`);
    console.log(`   POST /api/update-profile`);
});
