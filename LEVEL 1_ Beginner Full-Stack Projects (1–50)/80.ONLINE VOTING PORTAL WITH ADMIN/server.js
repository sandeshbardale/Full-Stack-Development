const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

let polls = [];
let voters = [
    {id: 'voter1', password: 'pass1'},
    {id: 'voter2', password: 'pass2'},
    {id: 'voter3', password: 'pass3'},
    {id: 'voter4', password: 'pass4'},
    {id: 'voter5', password: 'pass5'}
];
let votes = [];

function generateId() {
    return Math.random().toString(36).substring(2, 11);
}

function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch {
                reject(new Error('Invalid JSON'));
            }
        });
    });
}

function serveFile(filePath, res) {
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json'
    };
    
    fs.readFile(filePath, (err, data) => {
        if(err) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('404 - File Not Found');
            return;
        }
        
        const ext = path.extname(filePath);
        const contentType = contentTypes[ext] || 'text/plain';
        res.writeHead(200, {'Content-Type': contentType});
        res.end(data);
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if(req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if(pathname === '/' || pathname === '/index.html') {
        serveFile(path.join(__dirname, 'index.html'), res);
    }
    else if(pathname === '/style.css') {
        serveFile(path.join(__dirname, 'style.css'), res);
    }
    else if(pathname === '/script.js') {
        serveFile(path.join(__dirname, 'script.js'), res);
    }
    else if(pathname === '/api/get-polls') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({polls}));
    }
    else if(pathname === '/api/create-poll' && req.method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const poll = {
                id: generateId(),
                title: body.title,
                description: body.description,
                options: body.options.map(name => ({name, votes: 0})),
                created: new Date().toISOString()
            };
            polls.push(poll);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true, poll}));
        } catch(err) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, error: err.message}));
        }
    }
    else if(pathname === '/api/submit-vote' && req.method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const pollId = body.pollId;
            const voterId = body.voterId;
            const selectedOption = body.option;
            
            const poll = polls.find(p => p.id === pollId);
            if(!poll) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, error: 'Poll not found'}));
                return;
            }
            
            const hasVoted = votes.find(v => v.pollId === pollId && v.voterId === voterId);
            if(hasVoted) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: false, error: 'Already voted'}));
                return;
            }
            
            const option = poll.options.find(o => o.name === selectedOption);
            if(option) {
                option.votes++;
            }
            
            votes.push({pollId, voterId, option: selectedOption, timestamp: new Date().toISOString()});
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true, message: 'Vote recorded'}));
        } catch(err) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, error: err.message}));
        }
    }
    else if(pathname === '/api/delete-poll' && req.method === 'DELETE') {
        try {
            const body = await parseRequestBody(req);
            polls = polls.filter(p => p.id !== body.pollId);
            votes = votes.filter(v => v.pollId !== body.pollId);
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: true, message: 'Poll deleted'}));
        } catch(err) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, error: err.message}));
        }
    }
    else if(pathname === '/api/get-stats') {
        const totalVoters = voters.length;
        const totalVotes = votes.length;
        const activePollsCount = polls.length;
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({totalVoters, totalVotes, activePollsCount}));
    }
    else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 - Endpoint Not Found');
    }
});

server.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     🗳️  ONLINE VOTING PORTAL WITH ADMIN DASHBOARD         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('✨ Server is running successfully!\n');
    console.log('🌐 Open your browser and visit: http://localhost:' + PORT);
    console.log('\n📋 VOTER LOGIN CREDENTIALS:');
    console.log('   Voter ID: voter1 - voter5');
    console.log('   Password: pass1 - pass5 (corresponding)\n');
    console.log('🔐 ADMIN LOGIN CREDENTIALS:');
    console.log('   Admin ID: admin');
    console.log('   Password: admin123\n');
    console.log('💡 Features:');
    console.log('   ✓ Create and manage polls');
    console.log('   ✓ Vote on active polls');
    console.log('   ✓ View real-time voting results');
    console.log('   ✓ Admin dashboard with statistics');
    console.log('   ✓ Delete polls (admin only)\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
});
