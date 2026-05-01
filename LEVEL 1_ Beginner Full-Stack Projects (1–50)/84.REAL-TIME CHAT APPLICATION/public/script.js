const socket = io();

const chatWindow = document.getElementById('chat-window');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim() || "Anonymous";
    const message = messageInput.value.trim();
    if(message){
        socket.emit('chat message', `${username}: ${message}`);
        messageInput.value = '';
    }
});

socket.on('chat message', (msg) => {
    const div = document.createElement('div');
    div.textContent = msg;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
});