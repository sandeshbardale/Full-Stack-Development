const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const donationsFile = path.join(__dirname, 'donations.json');

const initializeDonationsFile = async () => {
  try {
    await fs.access(donationsFile);
  } catch {
    await fs.writeFile(donationsFile, JSON.stringify({ donations: [], total: 0 }));
  }
};

const getDonations = async () => {
  try {
    const data = await fs.readFile(donationsFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { donations: [], total: 0 };
  }
};

const saveDonations = async (data) => {
  await fs.writeFile(donationsFile, JSON.stringify(data, null, 2));
};

app.get('/api/donations', async (req, res) => {
  const data = await getDonations();
  res.json(data);
});

app.post('/api/donate', async (req, res) => {
  const { name, email, amount, message, cause } = req.body;

  if (!name || !email || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid donation data' });
  }

  const donation = {
    id: Date.now(),
    name,
    email,
    amount: parseFloat(amount),
    message,
    cause,
    date: new Date().toISOString(),
  };

  const data = await getDonations();
  data.donations.push(donation);
  data.total = data.donations.reduce((sum, d) => sum + d.amount, 0);

  await saveDonations(data);

  res.json({
    success: true,
    message: 'Thank you for your donation!',
    donation,
  });
});

app.get('/api/stats', async (req, res) => {
  const data = await getDonations();
  const stats = {
    totalDonations: data.total,
    donorCount: data.donations.length,
    averageDonation: data.donations.length > 0 ? (data.total / data.donations.length).toFixed(2) : 0,
    highestDonation: data.donations.length > 0 ? Math.max(...data.donations.map(d => d.amount)) : 0,
  };
  res.json(stats);
});

app.get('/api/causes', (req, res) => {
  const causes = [
    { id: 1, name: 'Healthcare', icon: '🏥', description: 'Support medical facilities and treatment programs' },
    { id: 2, name: 'Education', icon: '📚', description: 'Fund scholarships and educational infrastructure' },
    { id: 3, name: 'Environment', icon: '🌍', description: 'Support conservation and sustainability projects' },
    { id: 4, name: 'Emergency Relief', icon: '🆘', description: 'Help communities during disasters' },
    { id: 5, name: 'Food Security', icon: '🍎', description: 'Provide nutritious meals to underprivileged' },
    { id: 6, name: 'Clean Water', icon: '💧', description: 'Build water infrastructure in remote areas' },
  ];
  res.json(causes);
});

initializeDonationsFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
