const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const posts = [
  {
    id: 1,
    author: 'Sarah Wilson',
    avatar: '👩‍💼',
    handle: '@sarahwilson',
    timestamp: new Date(Date.now() - 3600000),
    content: 'Just launched my new design portfolio! Check it out and let me know what you think 🎨',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=400&fit=crop',
    likes: 234,
    comments: 45,
    liked: false,
    commentsList: [
      { id: 1, author: 'John Doe', handle: '@johndoe', text: 'Amazing work! 🔥' },
      { id: 2, author: 'Emma Stone', handle: '@emmastone', text: 'Love the colors!' }
    ]
  },
  {
    id: 2,
    author: 'Alex Turner',
    avatar: '👨‍💻',
    handle: '@alexturner',
    timestamp: new Date(Date.now() - 7200000),
    content: 'Machine learning is revolutionizing how we build applications. The future is now! 🚀',
    image: null,
    likes: 567,
    comments: 89,
    liked: false,
    commentsList: [
      { id: 1, author: 'Lisa Chen', handle: '@lisachen', text: 'Totally agree!' }
    ]
  },
  {
    id: 3,
    author: 'Maya Johnson',
    avatar: '👩‍🎨',
    handle: '@mayajohnson',
    timestamp: new Date(Date.now() - 14400000),
    content: 'Coffee + Creativity = Perfect morning ☕✨',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=500&h=400&fit=crop',
    likes: 892,
    comments: 156,
    liked: false,
    commentsList: []
  }
];

let nextPostId = 4;

app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const { content, image } = req.body;
  
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Content is required' });
  }

  const newPost = {
    id: nextPostId++,
    author: 'You',
    avatar: '👤',
    handle: '@yourhandle',
    timestamp: new Date(),
    content,
    image: image || null,
    likes: 0,
    comments: 0,
    liked: false,
    commentsList: []
  };

  posts.unshift(newPost);
  res.status(201).json(newPost);
});

app.put('/api/posts/:id/like', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;

  res.json(post);
});

app.post('/api/posts/:id/comments', (req, res) => {
  const { text } = req.body;
  const post = posts.find(p => p.id === parseInt(req.params.id));

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  const comment = {
    id: post.commentsList.length + 1,
    author: 'You',
    handle: '@yourhandle',
    text
  };

  post.commentsList.push(comment);
  post.comments += 1;

  res.status(201).json(comment);
});

app.delete('/api/posts/:id', (req, res) => {
  const index = posts.findIndex(p => p.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const deleted = posts.splice(index, 1);
  res.json(deleted[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
