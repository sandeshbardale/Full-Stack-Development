const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let projects = [
  {id: 1, title: "E-commerce Website", category: "Web Design", budget: 5000, description: "Build a modern e-commerce platform", freelancers: 12, rating: 4.8},
  {id: 2, title: "Mobile App Design", category: "UI/UX", budget: 3500, description: "Design iOS and Android app interfaces", freelancers: 8, rating: 4.9},
  {id: 3, title: "SEO Optimization", category: "Marketing", budget: 2000, description: "Improve website search engine ranking", freelancers: 15, rating: 4.7},
  {id: 4, title: "Logo Design", category: "Branding", budget: 1500, description: "Create unique brand logo", freelancers: 20, rating: 4.6},
  {id: 5, title: "API Development", category: "Backend", budget: 4500, description: "Build REST API for mobile app", freelancers: 5, rating: 4.9},
  {id: 6, title: "Content Writing", category: "Writing", budget: 1200, description: "Write blog posts and articles", freelancers: 25, rating: 4.5}
];

let freelancers = [
  {id: 1, name: "Alex Johnson", skill: "Web Design", rating: 4.9, hourly: 75, reviews: 128, image: "👨‍💻", bio: "Expert in responsive web design"},
  {id: 2, name: "Sarah Chen", skill: "UI/UX", rating: 4.8, hourly: 85, reviews: 95, image: "👩‍💻", bio: "Creative UI/UX designer"},
  {id: 3, name: "Mike Davis", skill: "Backend", rating: 4.7, hourly: 80, reviews: 112, image: "👨‍💼", bio: "Full-stack developer"},
  {id: 4, name: "Emma Wilson", skill: "Marketing", rating: 4.9, hourly: 65, reviews: 156, image: "👩‍💼", bio: "Digital marketing specialist"},
  {id: 5, name: "James Brown", skill: "Branding", rating: 4.6, hourly: 70, reviews: 87, image: "🎨", bio: "Creative branding expert"},
  {id: 6, name: "Lisa Martinez", skill: "Writing", rating: 4.8, hourly: 55, reviews: 203, image: "✍️", bio: "Professional content writer"}
];

app.get('/api/projects', (req, res) => {
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if(project) res.json(project);
  else res.status(404).json({message: "Project not found"});
});

app.get('/api/freelancers', (req, res) => {
  res.json(freelancers);
});

app.get('/api/freelancers/:id', (req, res) => {
  const freelancer = freelancers.find(f => f.id === parseInt(req.params.id));
  if(freelancer) res.json(freelancer);
  else res.status(404).json({message: "Freelancer not found"});
});

app.post('/api/projects', (req, res) => {
  const newProject = {
    id: projects.length + 1,
    ...req.body,
    freelancers: 0,
    rating: 0
  };
  projects.push(newProject);
  res.status(201).json(newProject);
});

app.post('/api/proposals', (req, res) => {
  const proposal = {
    id: Math.random().toString(36).substr(2, 9),
    ...req.body,
    status: 'pending',
    createdAt: new Date()
  };
  res.status(201).json(proposal);
});

app.listen(PORT, () => {
  console.log(`Freelancer Marketplace running on http://localhost:${PORT}`);
});
