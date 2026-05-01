const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const PORT = 3000

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

let posts = []

app.get('/api/posts', (req, res) => {
  res.json(posts)
})

app.post('/api/posts', (req, res) => {
  const post = { id: Date.now(), ...req.body }
  posts.push(post)
  res.json(post)
})

app.delete('/api/posts/:id', (req, res) => {
  posts = posts.filter(p => p.id != req.params.id)
  res.json({ success: true })
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))