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
      elem.innerText = text;
      // Accessibility: announce new messages
      elem.setAttribute("role", "article");
      chatbox.appendChild(elem);
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  
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
  
    clearBtn.addEventListener("click", () => {
      chatbox.innerHTML = "";
      input.value = "";
    });
  
    startBtn && startBtn.addEventListener("click", () => {
      input.focus();
      appendMessage("Hello! Ask me anything about the Indian Constitution.", "bot");
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
