const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let users = {
  'john@bank.com': { password: 'pass123', name: 'John Doe', balance: 5000, accountNumber: '1234567890' },
  'jane@bank.com': { password: 'pass456', name: 'Jane Smith', balance: 8500, accountNumber: '9876543210' }
};

let transactions = {
  'john@bank.com': [
    { date: '2025-04-20', type: 'Deposit', amount: 1000, description: 'Salary Credit' },
    { date: '2025-04-18', type: 'Withdrawal', amount: 500, description: 'ATM Withdrawal' },
    { date: '2025-04-15', type: 'Transfer', amount: 200, description: 'Transfer to Friend' }
  ],
  'jane@bank.com': [
    { date: '2025-04-21', type: 'Deposit', amount: 2000, description: 'Freelance Payment' },
    { date: '2025-04-19', type: 'Bill Payment', amount: 300, description: 'Electricity Bill' }
  ]
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { email, password } = JSON.parse(body);
      if (users[email] && users[email].password === password) {
        res.writeHead(200);
        res.end(JSON.stringify({ 
          success: true, 
          user: { email, name: users[email].name, balance: users[email].balance, accountNumber: users[email].accountNumber }
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
      }
    });
  } 
  else if (pathname === '/api/transactions' && req.method === 'GET') {
    const email = query.email;
    res.writeHead(200);
    res.end(JSON.stringify({ transactions: transactions[email] || [] }));
  }
  else if (pathname === '/api/transfer' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { email, amount, recipient } = JSON.parse(body);
      if (users[email] && users[email].balance >= amount) {
        users[email].balance -= amount;
        if (!transactions[email]) transactions[email] = [];
        transactions[email].push({ 
          date: new Date().toISOString().split('T')[0], 
          type: 'Transfer', 
          amount: amount, 
          description: `Transfer to ${recipient}` 
        });
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, newBalance: users[email].balance }));
      } else {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, message: 'Insufficient balance' }));
      }
    });
  }
  else if (pathname === '/api/deposit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { email, amount } = JSON.parse(body);
      if (users[email]) {
        users[email].balance += amount;
        if (!transactions[email]) transactions[email] = [];
        transactions[email].push({ 
          date: new Date().toISOString().split('T')[0], 
          type: 'Deposit', 
          amount: amount, 
          description: 'Deposit' 
        });
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, newBalance: users[email].balance }));
      }
    });
  }
  else if (pathname.startsWith('/public/')) {
    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.setHeader('Content-Type', ext === '.css' ? 'text/css' : ext === '.js' ? 'text/javascript' : 'text/html');
        res.writeHead(200);
        res.end(data);
      }
    });
  }
  else if (pathname === '/' || pathname === '/index.html') {
    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(data);
    });
  }
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
});

server.listen(3000, () => {
  console.log('Banking Portal Server running on http://localhost:3000');
});