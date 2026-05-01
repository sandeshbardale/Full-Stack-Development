const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const BUGS_FILE = path.join(__dirname, 'bugs.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function readBugs() {
    try {
        if (fs.existsSync(BUGS_FILE)) {
            const data = fs.readFileSync(BUGS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading bugs file:', error);
    }
    return [];
}

function writeBugs(bugs) {
    try {
        fs.writeFileSync(BUGS_FILE, JSON.stringify(bugs, null, 2));
    } catch (error) {
        console.error('Error writing bugs file:', error);
    }
}

function getNextId(bugs) {
    if (bugs.length === 0) return 1;
    return Math.max(...bugs.map(b => b.id)) + 1;
}

app.get('/api/bugs', (req, res) => {
    const bugs = readBugs();
    res.json(bugs);
});

app.post('/api/bugs', (req, res) => {
    const { title, description, severity, assignee, status, createdAt } = req.body;

    if (!title || !description || !severity || !assignee) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const bugs = readBugs();
    const newBug = {
        id: getNextId(bugs),
        title,
        description,
        severity,
        assignee,
        status: status || 'open',
        createdAt: createdAt || new Date().toISOString()
    };

    bugs.push(newBug);
    writeBugs(bugs);
    res.status(201).json(newBug);
});

app.put('/api/bugs/:id', (req, res) => {
    const { id } = req.params;
    const { status, title, description, severity, assignee } = req.body;

    const bugs = readBugs();
    const bugIndex = bugs.findIndex(b => b.id === parseInt(id));

    if (bugIndex === -1) {
        return res.status(404).json({ error: 'Bug not found' });
    }

    if (status) bugs[bugIndex].status = status;
    if (title) bugs[bugIndex].title = title;
    if (description) bugs[bugIndex].description = description;
    if (severity) bugs[bugIndex].severity = severity;
    if (assignee) bugs[bugIndex].assignee = assignee;

    writeBugs(bugs);
    res.json(bugs[bugIndex]);
});

app.delete('/api/bugs/:id', (req, res) => {
    const { id } = req.params;
    const bugs = readBugs();
    const bugIndex = bugs.findIndex(b => b.id === parseInt(id));

    if (bugIndex === -1) {
        return res.status(404).json({ error: 'Bug not found' });
    }

    const deletedBug = bugs.splice(bugIndex, 1);
    writeBugs(bugs);
    res.json(deletedBug[0]);
});

app.listen(PORT, () => {
    console.log(`\n🐛 Bug Tracker Pro Server running at http://localhost:${PORT}`);
    console.log('📝 Open http://localhost:3000 in your browser\n');
});
