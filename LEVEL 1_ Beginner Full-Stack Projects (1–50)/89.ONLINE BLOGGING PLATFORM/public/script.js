async function fetchPosts() {
  const res = await fetch('/api/posts')
  const data = await res.json()
  const postsDiv = document.getElementById('posts')
  postsDiv.innerHTML = ''
  data.forEach(post => {
    const div = document.createElement('div')
    div.className = 'post'
    div.innerHTML = `<h2>${post.title}</h2><p>${post.content}</p><button onclick="deletePost(${post.id})">Delete</button>`
    postsDiv.appendChild(div)
  })
}

async function addPost() {
  const title = document.getElementById('title').value
  const content = document.getElementById('content').value
  await fetch('/api/posts', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ title, content })
  })
  document.getElementById('title').value = ''
  document.getElementById('content').value = ''
  fetchPosts()
}

async function deletePost(id) {
  await fetch('/api/posts/' + id, { method:'DELETE' })
  fetchPosts()
}

fetchPosts()