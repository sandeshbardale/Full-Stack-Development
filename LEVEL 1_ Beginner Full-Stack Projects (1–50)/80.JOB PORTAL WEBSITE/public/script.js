async function fetchJobs() {
  const res = await fetch('/api/jobs')
  const data = await res.json()
  const jobsDiv = document.getElementById('jobs')
  jobsDiv.innerHTML = ''
  data.forEach(job => {
    const div = document.createElement('div')
    div.className = 'job'
    div.innerHTML = `<h2>${job.title}</h2><p>${job.company} - ${job.location}</p><button onclick="deleteJob(${job.id})">Delete</button>`
    jobsDiv.appendChild(div)
  })
}

async function addJob() {
  const title = document.getElementById('title').value
  const company = document.getElementById('company').value
  const location = document.getElementById('location').value
  await fetch('/api/jobs', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ title, company, location })
  })
  document.getElementById('title').value = ''
  document.getElementById('company').value = ''
  document.getElementById('location').value = ''
  fetchJobs()
}

async function deleteJob(id) {
  await fetch('/api/jobs/' + id, { method:'DELETE' })
  fetchJobs()
}

fetchJobs()