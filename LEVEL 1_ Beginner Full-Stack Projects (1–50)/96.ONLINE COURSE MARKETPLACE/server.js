const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const courses = [
  {
    id: 1,
    title: 'Web Development Masterclass',
    instructor: 'John Developer',
    price: 99.99,
    rating: 4.8,
    students: 15420,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=300&fit=crop',
    category: 'Web Development',
    duration: '45 hours',
    level: 'Beginner',
    description: 'Learn HTML, CSS, JavaScript and build stunning websites from scratch.'
  },
  {
    id: 2,
    title: 'Advanced JavaScript Concepts',
    instructor: 'Sarah Code',
    price: 79.99,
    rating: 4.9,
    students: 8932,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    category: 'Programming',
    duration: '32 hours',
    level: 'Advanced',
    description: 'Master closures, async/await, prototypes and advanced JS patterns.'
  },
  {
    id: 3,
    title: 'React & Next.js Complete Guide',
    instructor: 'Mike ReactJS',
    price: 119.99,
    rating: 4.7,
    students: 12500,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=400&h=300&fit=crop',
    category: 'Frontend',
    duration: '56 hours',
    level: 'Intermediate',
    description: 'Build modern web apps with React and deploy them with Next.js.'
  },
  {
    id: 4,
    title: 'Node.js & MongoDB Backend',
    instructor: 'Alex Backend',
    price: 89.99,
    rating: 4.6,
    students: 9823,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    category: 'Backend',
    duration: '40 hours',
    level: 'Intermediate',
    description: 'Create scalable server applications with Node.js and MongoDB.'
  },
  {
    id: 5,
    title: 'Python For Data Science',
    instructor: 'Emma DataScience',
    price: 109.99,
    rating: 4.8,
    students: 18342,
    image: 'https://images.unsplash.com/photo-1526374965328-7f5ae4e8a83f?w=400&h=300&fit=crop',
    category: 'Data Science',
    duration: '50 hours',
    level: 'Beginner',
    description: 'Learn Python, NumPy, Pandas, and Matplotlib for data analysis.'
  },
  {
    id: 6,
    title: 'Mobile App Development',
    instructor: 'James Mobile',
    price: 99.99,
    rating: 4.5,
    students: 6721,
    image: 'https://images.unsplash.com/photo-1512941691920-25bda36dc643?w=400&h=300&fit=crop',
    category: 'Mobile',
    duration: '48 hours',
    level: 'Intermediate',
    description: 'Build iOS and Android apps using React Native and Flutter.'
  },
  {
    id: 7,
    title: 'AWS Cloud Architecture',
    instructor: 'David Cloud',
    price: 129.99,
    rating: 4.7,
    students: 7543,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
    category: 'Cloud',
    duration: '44 hours',
    level: 'Advanced',
    description: 'Master AWS services and design scalable cloud infrastructure.'
  },
  {
    id: 8,
    title: 'UI/UX Design Principles',
    instructor: 'Lisa Design',
    price: 69.99,
    rating: 4.8,
    students: 11234,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    category: 'Design',
    duration: '28 hours',
    level: 'Beginner',
    description: 'Learn design theory, wireframing, prototyping and user research.'
  }
];

app.get('/api/courses', (req, res) => {
  res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (course) {
    res.json(course);
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(courses.map(c => c.category))];
  res.json(categories);
});

app.post('/api/checkout', (req, res) => {
  const { items } = req.body;
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  res.json({ 
    success: true, 
    orderId: 'ORD-' + Date.now(),
    total: total.toFixed(2),
    message: 'Order placed successfully!'
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Marketplace is ready!');
});
