const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const PORT = 3000

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

let jobs = []

app.get('/api/jobs', (req, res) => {
  res.json(jobs)
})

app.post('/api/jobs', (req, res) => {
  const job = { id: Date.now(), ...req.body }
  jobs.push(job)
  res.json(job)
})

app.delete('/api/jobs/:id', (req, res) => {
  jobs = jobs.filter(j => j.id != req.params.id)
  res.json({ success: true })
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))