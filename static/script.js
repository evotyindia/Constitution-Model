// Basic interactive chat front-end to work with your Flask /chat endpoint
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("chatForm");
    const input = document.getElementById("userInput");
    const chatbox = document.getElementById("chatbox");
    const clearBtn = document.getElementById("clearBtn");
    const startBtn = document.getElementById("startChatBtn");
  
    function appendMessage(text, cls) {
      const elem = document.createElement("div");
      elem.className = `message ${cls}`;
      if (cls === "bot") {
        // If the message contains block HTML tags, render as HTML
        if (/<(p|ul|ol|li|br|h\d|div|table|blockquote)[^>]*>/i.test(text)) {
          elem.innerHTML = text;
        } else {
          // Otherwise, replace newlines with <br> for display
          elem.innerHTML = text.replace(/\n/g, '<br>');
        }
      } else {
        // Always use innerText for user messages to avoid HTML interpretation
        elem.innerText = text;
      }
      // Accessibility: announce new messages
      elem.setAttribute("role", "article");
      chatbox.appendChild(elem);
      chatbox.scrollTop = chatbox.scrollHeight;
    }

    // Ensure only one welcome message is present
    function showWelcome() {
      chatbox.innerHTML = '';
      appendMessage("Lawyer: <p>Welcome! I am your Constitution Lawyer AI. How can I help you today?</p>", "bot");
    }

    // Show welcome on load
    showWelcome();
  
    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      appendMessage("You: " + text, "user");
      input.value = "";
      try {
        // Show typing placeholder
        const typing = document.createElement("div");
        typing.className = "message bot";
        typing.innerText = "Lawyer is typing…";
        chatbox.appendChild(typing);
        chatbox.scrollTop = chatbox.scrollHeight;
  
        const res = await fetch("/chat", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({message: text})
        });
        const data = await res.json();
        typing.remove();
        appendMessage("Lawyer: " + (data.reply || "[No response]"), "bot");
      } catch (err) {
        typing && typing.remove();
        appendMessage("Error: Could not reach server. Try again.", "bot");
        console.error(err);
      }
    }
  
    // Form bindings
    document.getElementById("sendBtn").addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  
    clearBtn.addEventListener("click", async () => {
      chatbox.innerHTML = "";
      input.value = "";
      // Tell backend to clear chat history
      await fetch('/clear', { method: 'POST' });
      showWelcome();
    });
  
    startBtn && startBtn.addEventListener("click", () => {
      // Set placeholder and focus input, do not send message to bot
      input.value = "hey lawyer!";
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  
  });
  // 🎤 Speech-to-Text
const micBtn = document.getElementById("micBtn");
const userInput = document.getElementById("userInput");

if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN"; // Indian English
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener("click", () => {
    recognition.start();
    micBtn.innerText = "🎙️"; // recording state
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    micBtn.innerText = "🎤";
  };

  recognition.onerror = () => {
    micBtn.innerText = "🎤";
  };
} else {
  micBtn.disabled = true; // browser not supported
}
