const API_BASE = '/api';

const postContent = document.getElementById('postContent');
const postBtn = document.getElementById('postBtn');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const feedContainer = document.getElementById('feedContainer');
const composeBtn = document.querySelector('.compose-btn');
const postModal = document.getElementById('postModal');
const modalPostContent = document.getElementById('modalPostContent');
const modalPostBtn = document.getElementById('modalPostBtn');
const closeModalBtn = document.querySelector('.close-modal');
const modalCancelBtn = document.querySelector('.modal-cancel');

let currentImageBase64 = null;

async function loadPosts() {
  try {
    const response = await fetch(`${API_BASE}/posts`);
    const posts = await response.json();
    renderPosts(posts);
  } catch (error) {
    console.error('Error loading posts:', error);
    showToast('Failed to load posts', 'error');
  }
}

function renderPosts(posts) {
  if (posts.length === 0) {
    feedContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h3>No posts yet</h3>
        <p>Create your first post to get started!</p>
      </div>
    `;
    return;
  }

  feedContainer.innerHTML = posts.map(post => createPostElement(post)).join('');
  attachPostListeners();
}

function createPostElement(post) {
  const timeAgo = getTimeAgo(post.timestamp);
  const commentsHTML = post.commentsList.map(comment => `
    <div class="comment">
      <div class="comment-avatar">${comment.author === 'You' ? '👤' : getAvatar(comment.author)}</div>
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-author">${comment.author}</span>
          <span class="comment-author-handle">${comment.handle}</span>
          <span class="comment-time">now</span>
        </div>
        <div class="comment-text">${comment.text}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="post" data-post-id="${post.id}">
      <div class="post-header">
        <div class="post-avatar">${post.avatar}</div>
        <div class="post-author-info">
          <div>
            <span class="post-author">${post.author}</span>
            <span class="post-handle">${post.handle}</span>
            <span class="post-dot">·</span>
            <span class="post-time">${timeAgo}</span>
          </div>
        </div>
        <button class="post-delete" data-action="delete" title="Delete post">🗑️</button>
      </div>
      <div class="post-content">${post.content}</div>
      ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" onerror="this.style.display='none'">` : ''}
      <div class="post-stats">
        <div class="stat">${post.comments} <span>Comments</span></div>
        <div class="stat">${post.likes} <span>Likes</span></div>
      </div>
      <div class="post-actions">
        <button class="action-btn" data-action="comment" title="Reply">
          <span class="icon">💬</span>
          <span>${post.comments}</span>
        </button>
        <button class="action-btn ${post.liked ? 'liked' : ''}" data-action="like" title="Like">
          <span class="icon">${post.liked ? '❤️' : '🤍'}</span>
          <span class="like-count">${post.likes}</span>
        </button>
        <button class="action-btn" data-action="share" title="Share">
          <span class="icon">↗️</span>
        </button>
      </div>
      ${post.commentsList.length > 0 ? `
        <div class="comments-section">
          ${commentsHTML}
        </div>
      ` : ''}
      <div class="comment-input-box">
        <input type="text" class="comment-input" placeholder="Reply to ${post.author}..." data-post-id="${post.id}">
        <button class="comment-submit" data-action="submit-comment" data-post-id="${post.id}">Post</button>
      </div>
    </div>
  `;
}

function attachPostListeners() {
  document.querySelectorAll('.post').forEach(post => {
    const postId = post.dataset.postId;

    post.querySelector('[data-action="like"]').addEventListener('click', () => likePost(postId, post));
    post.querySelector('[data-action="delete"]').addEventListener('click', () => deletePost(postId, post));
    post.querySelector('[data-action="comment"]').addEventListener('click', () => {
      post.querySelector('.comment-input').focus();
    });
    post.querySelector('[data-action="submit-comment"]').addEventListener('click', () => {
      submitComment(postId, post);
    });

    post.querySelector('.comment-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitComment(postId, post);
      }
    });
  });
}

async function likePost(postId, postElement) {
  try {
    const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'PUT'
    });
    const updatedPost = await response.json();
    const likeBtn = postElement.querySelector('[data-action="like"]');
    const likeCount = likeBtn.querySelector('.like-count');

    likeBtn.classList.toggle('liked');
    likeBtn.querySelector('.icon').textContent = updatedPost.liked ? '❤️' : '🤍';
    likeCount.textContent = updatedPost.likes;

    const statsDiv = postElement.querySelector('.post-stats');
    const stats = statsDiv.querySelectorAll('.stat');
    stats[1].innerHTML = `${updatedPost.likes} <span>Likes</span>`;
  } catch (error) {
    console.error('Error liking post:', error);
    showToast('Failed to update like', 'error');
  }
}

async function deletePost(postId, postElement) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE'
    });
    postElement.style.animation = 'none';
    setTimeout(() => postElement.remove(), 10);
    showToast('Post deleted', 'success');
  } catch (error) {
    console.error('Error deleting post:', error);
    showToast('Failed to delete post', 'error');
  }
}

async function submitComment(postId, postElement) {
  const input = postElement.querySelector('.comment-input');
  const text = input.value.trim();

  if (!text) {
    showToast('Comment cannot be empty', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const comment = await response.json();
    input.value = '';

    let commentsSection = postElement.querySelector('.comments-section');
    if (!commentsSection) {
      const newCommentsSection = document.createElement('div');
      newCommentsSection.className = 'comments-section';
      postElement.insertBefore(newCommentsSection, postElement.querySelector('.comment-input-box'));
      commentsSection = newCommentsSection;
    }

    const commentHTML = `
      <div class="comment">
        <div class="comment-avatar">👤</div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">${comment.author}</span>
            <span class="comment-author-handle">${comment.handle}</span>
            <span class="comment-time">now</span>
          </div>
          <div class="comment-text">${comment.text}</div>
        </div>
      </div>
    `;

    commentsSection.insertAdjacentHTML('beforeend', commentHTML);

    const commentBtn = postElement.querySelector('[data-action="comment"]');
    const commentCount = parseInt(commentBtn.querySelector('span:last-child').textContent) + 1;
    commentBtn.querySelector('span:last-child').textContent = commentCount;

    const statsDiv = postElement.querySelector('.post-stats');
    const stats = statsDiv.querySelectorAll('.stat');
    stats[0].innerHTML = `${commentCount} <span>Comments</span>`;

    showToast('Comment posted', 'success');
  } catch (error) {
    console.error('Error posting comment:', error);
    showToast('Failed to post comment', 'error');
  }
}

async function createPost(content) {
  if (!content.trim()) {
    showToast('Post content cannot be empty', 'error');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        image: currentImageBase64
      })
    });

    if (!response.ok) throw new Error('Failed to create post');

    const newPost = await response.json();
    const newPostHTML = createPostElement(newPost);
    feedContainer.insertAdjacentHTML('afterbegin', newPostHTML);
    attachPostListeners();

    clearPostInput();
    showToast('Post created successfully!', 'success');
    return true;
  } catch (error) {
    console.error('Error creating post:', error);
    showToast('Failed to create post', 'error');
    return false;
  }
}

function clearPostInput() {
  postContent.value = '';
  modalPostContent.value = '';
  currentImageBase64 = null;
  imagePreview.style.display = 'none';
}

postBtn.addEventListener('click', () => {
  const content = postContent.value;
  if (content.trim()) {
    createPost(content);
  }
});

postContent.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    const content = postContent.value;
    if (content.trim()) {
      createPost(content);
    }
  }
});

composeBtn.addEventListener('click', () => {
  postModal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
  postModal.classList.remove('active');
  modalPostContent.value = '';
});

modalCancelBtn.addEventListener('click', () => {
  postModal.classList.remove('active');
  modalPostContent.value = '';
});

postModal.addEventListener('click', (e) => {
  if (e.target === postModal) {
    postModal.classList.remove('active');
  }
});

modalPostBtn.addEventListener('click', () => {
  const content = modalPostContent.value;
  if (content.trim()) {
    createPost(content).then(() => {
      postModal.classList.remove('active');
      modalPostContent.value = '';
    });
  }
});

document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const title = this.getAttribute('title');
    if (title === 'Add Image') {
      imageInput.click();
    } else {
      showToast(`${title} coming soon!`, 'success');
    }
  });
});

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentImageBase64 = event.target.result;
      previewImg.src = currentImageBase64;
      imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

document.querySelector('.remove-image-btn').addEventListener('click', () => {
  currentImageBase64 = null;
  imageInput.value = '';
  imagePreview.style.display = 'none';
});

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function() {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    const nav = this.dataset.nav;
    document.querySelector('.header h2').textContent = nav.charAt(0).toUpperCase() + nav.slice(1);
  });
});

function getTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString();
}

function getAvatar(name) {
  const colors = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨'];
  return colors[name.length % colors.length];
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'none';
    setTimeout(() => toast.remove(), 100);
  }, 3000);
}

loadPosts();

setInterval(() => {
  const timeElements = document.querySelectorAll('.post-time');
  timeElements.forEach(el => {
    const post = el.closest('.post');
    const timestamp = post.dataset.timestamp;
  });
}, 60000);
