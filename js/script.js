const chatContainer = document.getElementById('chat-container');
const chatIcon = document.getElementById('chat-icon');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');

let userName = '';

const GROQ_API_KEY = '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'; // Your Groq key
const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

// Function to toggle the chat window
function toggleChat() {
  if (chatContainer.style.display === 'flex') {
    chatContainer.style.display = 'none';
  } else {
    chatContainer.style.display = 'flex';
    loadHistory();
  }
}

// Clicking outside chat closes it
document.addEventListener('click', function(e){
  if (!chatContainer.contains(e.target) && e.target !== chatIcon) {
    chatContainer.style.display = 'none';
  }
});

// Load chat history
function loadHistory() {
  const history = localStorage.getItem('chatHistory');
  if (history) {
    chatMessages.innerHTML = history;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else {
    CulturaSay("Hi, I am Cultura! What's your name?");
  }
}

// Save chat history
function saveHistory() {
  localStorage.setItem('chatHistory', chatMessages.innerHTML);
}

// Format the message for HTML tags
function formatMessage(message) {
  // Convert *text* to <em>text</em> (italic)
  message = message.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Convert **text** to <strong>text</strong> (bold)
  message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert ***text*** to <strong><em>text</em></strong> (bold and italic)
  message = message.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  
  return message;
}

// Bot says
function CulturaSay(message) {
  const formattedMessage = formatMessage(message); // Format the message
  const botMessage = `<div class="name-tag">Cultura:</div><div class="Cultura-message">${formattedMessage}</div>`;
  chatMessages.innerHTML += `<div style="margin-bottom:10px;">🧕 ${botMessage}</div>`;
  saveHistory();
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// User says
function userSay(message) {
  const userMessage = `<div class="name-tag">You:</div><div class="user-message">${message}</div>`;
  chatMessages.innerHTML += `<div style="margin-bottom:10px;">${userMessage}</div>`;
  saveHistory();
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Typing animation
function showTyping() {
  const typing = `<div id="typing" style="margin-bottom:10px;">🧕 <div class="name-tag">Cultura:</div><div class="Cultura-message typing-dots"></div></div>`;
  chatMessages.innerHTML += typing;
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing
function removeTyping() {
  const typing = document.getElementById('typing');
  if (typing) typing.remove();
}

// Send user message
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  userSay(message);
  userInput.value = '';

  showTyping();

  if (!userName) {
    userName = message;
    removeTyping();
    CulturaSay(`${userName}! How can I assist you today?`);
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {"role": "system", "content": `You are Cultura, a helpful, friendly assistant specialized in Indian Heritage, heritage, festivals, places, flights, and hotels. Answer in detail.`},
          {"role": "user", "content": message}
        ]
      })
    });
    const data = await res.json();
    removeTyping();
    const reply = data.choices[0].message.content.trim();
    const formattedReply = formatMessage(reply); // Format the response before displaying
    CulturaSay(formattedReply);
  } catch (error) {
    console.error(error);
    removeTyping();
    CulturaSay("Oops! I couldn't understand. Please try again.");
  }
}
