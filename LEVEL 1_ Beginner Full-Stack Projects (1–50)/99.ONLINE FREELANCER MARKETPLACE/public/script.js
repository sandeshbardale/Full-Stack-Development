const API_URL = 'http://localhost:3000/api';
let projects = [];
let freelancers = [];
let selectedCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    fetchProjects();
    fetchFreelancers();
}

function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            navigateToSection(section);
        });
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedCategory = e.target.dataset.filter;
            displayProjects();
        });
    });

    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);

    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if(e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function navigateToSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(section).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    if(section === 'projects') displayProjects();
    if(section === 'freelancers') displayFreelancers();
}

function fetchProjects() {
    fetch(`${API_URL}/projects`)
        .then(res => res.json())
        .then(data => {
            projects = data;
            displayProjects();
        })
        .catch(() => {
            projects = [
                {id: 1, title: "E-commerce Website", category: "Web Design", budget: 5000, description: "Build a modern e-commerce platform", freelancers: 12, rating: 4.8},
                {id: 2, title: "Mobile App Design", category: "UI/UX", budget: 3500, description: "Design iOS and Android app interfaces", freelancers: 8, rating: 4.9},
                {id: 3, title: "SEO Optimization", category: "Marketing", budget: 2000, description: "Improve website search engine ranking", freelancers: 15, rating: 4.7},
                {id: 4, title: "Logo Design", category: "Branding", budget: 1500, description: "Create unique brand logo", freelancers: 20, rating: 4.6},
                {id: 5, title: "API Development", category: "Backend", budget: 4500, description: "Build REST API for mobile app", freelancers: 5, rating: 4.9},
                {id: 6, title: "Content Writing", category: "Writing", budget: 1200, description: "Write blog posts and articles", freelancers: 25, rating: 4.5}
            ];
            displayProjects();
        });
}

function fetchFreelancers() {
    fetch(`${API_URL}/freelancers`)
        .then(res => res.json())
        .then(data => {
            freelancers = data;
            displayFreelancers();
        })
        .catch(() => {
            freelancers = [
                {id: 1, name: "Alex Johnson", skill: "Web Design", rating: 4.9, hourly: 75, reviews: 128, image: "👨‍💻", bio: "Expert in responsive web design"},
                {id: 2, name: "Sarah Chen", skill: "UI/UX", rating: 4.8, hourly: 85, reviews: 95, image: "👩‍💻", bio: "Creative UI/UX designer"},
                {id: 3, name: "Mike Davis", skill: "Backend", rating: 4.7, hourly: 80, reviews: 112, image: "👨‍💼", bio: "Full-stack developer"},
                {id: 4, name: "Emma Wilson", skill: "Marketing", rating: 4.9, hourly: 65, reviews: 156, image: "👩‍💼", bio: "Digital marketing specialist"},
                {id: 5, name: "James Brown", skill: "Branding", rating: 4.6, hourly: 70, reviews: 87, image: "🎨", bio: "Creative branding expert"},
                {id: 6, name: "Lisa Martinez", skill: "Writing", rating: 4.8, hourly: 55, reviews: 203, image: "✍️", bio: "Professional content writer"}
            ];
            displayFreelancers();
        });
}

function displayProjects() {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';

    const filtered = selectedCategory === 'all' 
        ? projects 
        : projects.filter(p => p.category === selectedCategory);

    filtered.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <span class="project-category">${project.category}</span>
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-footer">
                <span class="project-budget">$${project.budget}</span>
                <div class="project-stats">
                    <span>👥 ${project.freelancers}</span>
                    <span>⭐ ${project.rating}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => openProjectModal(project));
        grid.appendChild(card);
    });
}

function displayFreelancers() {
    const grid = document.getElementById('freelancersGrid');
    grid.innerHTML = '';

    freelancers.forEach(freelancer => {
        const stars = '⭐'.repeat(Math.floor(freelancer.rating));
        const card = document.createElement('div');
        card.className = 'freelancer-card';
        card.innerHTML = `
            <div class="freelancer-avatar">${freelancer.image}</div>
            <h3>${freelancer.name}</h3>
            <div class="freelancer-skill">${freelancer.skill}</div>
            <div class="freelancer-bio">${freelancer.bio}</div>
            <div class="freelancer-rating">
                <span class="stars">${stars}</span>
                <span>${freelancer.rating}</span>
            </div>
            <div class="review-count">(${freelancer.reviews} reviews)</div>
            <div class="freelancer-hourly">$${freelancer.hourly}/hour</div>
        `;
        card.addEventListener('click', () => openFreelancerModal(freelancer));
        grid.appendChild(card);
    });
}

function openProjectModal(project) {
    const modal = document.getElementById('projectModal');
    const body = document.getElementById('modalBody');
    body.innerHTML = `
        <h3>${project.title}</h3>
        <p><strong>Category:</strong> ${project.category}</p>
        <p><strong>Budget:</strong> $${project.budget}</p>
        <p><strong>Description:</strong> ${project.description}</p>
        <p><strong>Freelancers Interested:</strong> ${project.freelancers}</p>
        <p><strong>Average Rating:</strong> ${project.rating}/5</p>
    `;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('projectModal').style.display = 'none';
}

function openFreelancerModal(freelancer) {
    const modal = document.getElementById('freelancerModal');
    const body = document.getElementById('freelancerModalBody');
    const stars = '⭐'.repeat(Math.floor(freelancer.rating));
    body.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 5rem; margin-bottom: 1rem;">${freelancer.image}</div>
            <h3>${freelancer.name}</h3>
            <p style="color: #6366f1; font-weight: bold; margin-bottom: 0.5rem;">${freelancer.skill}</p>
            <p>${freelancer.bio}</p>
            <div style="margin: 1rem 0;">
                <span style="color: #fbbf24; font-size: 1.2rem;">${stars}</span>
                <span style="margin-left: 0.5rem; color: #64748b;">${freelancer.rating}/5 (${freelancer.reviews} reviews)</span>
            </div>
            <p style="font-size: 1.5rem; color: #ec4899; font-weight: bold;">$${freelancer.hourly}/hour</p>
        </div>
    `;
    modal.style.display = 'block';
}

function closeFreelancerModal() {
    document.getElementById('freelancerModal').style.display = 'none';
}

function handleProjectSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProject = {
        title: formData.get('title') || e.target.elements[0].value,
        category: formData.get('category') || e.target.elements[1].value,
        budget: parseFloat(formData.get('budget') || e.target.elements[2].value),
        description: formData.get('description') || e.target.elements[3].value
    };

    fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newProject)
    })
    .then(res => res.json())
    .then(() => {
        fetchProjects();
        e.target.reset();
        alert('Project posted successfully!');
        navigateToSection('projects');
    })
    .catch(err => {
        const title = e.target.elements[0].value;
        const category = e.target.elements[1].value;
        const budget = parseFloat(e.target.elements[2].value);
        const description = e.target.elements[3].value;
        
        projects.push({
            id: projects.length + 1,
            title, category, budget, description,
            freelancers: 0, rating: 0
        });
        displayProjects();
        e.target.reset();
        alert('Project posted successfully!');
        navigateToSection('projects');
    });
}
