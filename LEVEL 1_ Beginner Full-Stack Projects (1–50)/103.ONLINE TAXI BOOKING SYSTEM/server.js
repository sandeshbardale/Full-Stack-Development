const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
let bookings = [];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (pathname === '/') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (pathname === '/style.css') {
        const filePath = path.join(__dirname, 'style.css');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    } else if (pathname === '/script.js') {
        const filePath = path.join(__dirname, 'script.js');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end();
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
        });
    } else if (pathname === '/api/bookings' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(bookings));
    } else if (pathname === '/api/bookings' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const booking = JSON.parse(body);
            booking.id = Math.floor(Math.random() * 100000);
            booking.status = 'Confirmed';
            booking.createdAt = new Date();
            booking.driverId = 'DRV' + Math.floor(Math.random() * 1000);
            booking.driverName = ['John Smith', 'Maria Garcia', 'Ahmed Hassan', 'Sarah Johnson', 'Michael Chen'][Math.floor(Math.random() * 5)];
            booking.driverRating = (4 + Math.random()).toFixed(1);
            booking.estimatedArrival = '5-10 mins';
            booking.vehicleNumber = 'TX' + Math.floor(Math.random() * 9000) + 1000;
            booking.color = ['Black', 'White', 'Silver', 'Blue', 'Red'][Math.floor(Math.random() * 5)];
            
            bookings.unshift(booking);
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Booking created successfully',
                booking: booking
            }));
        });
    } else if (pathname.startsWith('/api/bookings/') && req.method === 'GET') {
        const bookingId = parseInt(pathname.split('/')[3]);
        const booking = bookings.find(b => b.id === bookingId);
        
        if (booking) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(booking));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Booking not found' }));
        }
    } else if (pathname.startsWith('/api/bookings/') && req.method === 'DELETE') {
        const bookingId = parseInt(pathname.split('/')[3]);
        const index = bookings.findIndex(b => b.id === bookingId);
        
        if (index > -1) {
            const deletedBooking = bookings.splice(index, 1);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Booking cancelled',
                booking: deletedBooking[0]
            }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Booking not found' }));
        }
    } else if (pathname === '/api/stats') {
        const stats = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((sum, b) => sum + b.estimatedPrice, 0),
            completedTrips: Math.floor(bookings.length * 0.7),
            averageRating: 4.8
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stats));
    } else if (pathname === '/api/drivers') {
        const drivers = [
            { id: 'DRV001', name: 'John Smith', rating: 4.9, rides: 1250, available: true },
            { id: 'DRV002', name: 'Maria Garcia', rating: 4.8, rides: 980, available: true },
            { id: 'DRV003', name: 'Ahmed Hassan', rating: 4.7, rides: 750, available: false },
            { id: 'DRV004', name: 'Sarah Johnson', rating: 4.9, rides: 1100, available: true },
            { id: 'DRV005', name: 'Michael Chen', rating: 4.6, rides: 650, available: true }
        ];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(drivers));
    } else if (pathname === '/api/support') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const message = JSON.parse(body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Support ticket created',
                ticketId: 'TKT' + Math.floor(Math.random() * 100000)
            }));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Page Not Found</h1>');
    }
});

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║          🚕 RideHub Taxi Booking System Started           ║
╚═══════════════════════════════════════════════════════════╝

📍 Server is running at: http://localhost:${PORT}
🌐 Open in browser: http://127.0.0.1:${PORT}

✅ Features Active:
   ✓ Ride Booking System
   ✓ Driver Management
   ✓ Real-time Tracking
   ✓ Payment Processing
   ✓ User Dashboard

📊 API Endpoints:
   GET  /api/bookings
   POST /api/bookings
   GET  /api/bookings/:id
   DELETE /api/bookings/:id
   GET  /api/drivers
   GET  /api/stats
   POST /api/support

⚡ Press Ctrl+C to stop the server

    `);
});
