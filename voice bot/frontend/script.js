document.addEventListener("DOMContentLoaded", () => {
    const statusDiv = document.getElementById("status");
    const startBtn = document.getElementById("start-btn");
    const chatBox = document.getElementById("transcript"); // Renamed for clarity

    let socket;
    let recognition;
    let conversationStarted = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        statusDiv.textContent = "Error: Speech Recognition API not supported.";
        startBtn.disabled = true;
        return;
    }

    function addMessageToChat(sender, text) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("chat-message", sender);
        messageElement.textContent = text;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
    }

    function connect() {
        socket = new WebSocket("ws://localhost:8000/ws");

        socket.onopen = () => {
            statusDiv.textContent = "Ready to talk.";
            startBtn.disabled = false;
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "ai_response") {
                const cleanedText = message.text.replace(/[*_#]/g, '');
                addMessageToChat("ai", `AI: ${cleanedText}`); // Add AI message to chat
                speakText(cleanedText);
            }
        };

        socket.onclose = () => {
            statusDiv.textContent = "Connection lost. Retrying...";
            if (recognition) recognition.stop();
            window.speechSynthesis.cancel();
            setTimeout(connect, 3000);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            statusDiv.textContent = "Connection error.";
            if (recognition) recognition.stop();
            socket.close();
        };
    }

    function speakText(text) {
        // Stop any currently playing audio or speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Workaround for a browser bug where speech gets cut off
        let keepAliveInterval;
        const startKeepAlive = () => {
            keepAliveInterval = setInterval(() => {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 5000); // Nudge every 5 seconds
        };

        const stopKeepAlive = () => {
            clearInterval(keepAliveInterval);
        };

        utterance.onstart = startKeepAlive;
        utterance.onend = () => {
            stopKeepAlive();
            // After AI is done speaking, turn mic back on
            if (conversationStarted) {
                statusDiv.textContent = "Your turn...";
                recognition.start();
            }
        };
        utterance.onerror = () => {
            stopKeepAlive();
        }

        statusDiv.textContent = "AI is speaking...";
        window.speechSynthesis.speak(utterance);
    }

    function setupRecognition() {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            if (transcript && socket.readyState === WebSocket.OPEN) {
                addMessageToChat("user", `You: ${transcript}`); // Add user message to chat
                socket.send(transcript);
                statusDiv.textContent = "AI is thinking...";
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };
    }

    startBtn.addEventListener("click", () => {
        if (!conversationStarted) {
            conversationStarted = true;
            startBtn.textContent = "End Conversation";
            
            setupRecognition();
            
            const greetingText = "Hello, how can I help you?";
            addMessageToChat("ai", `AI: ${greetingText}`); // Add initial greeting to chat
            speakText(greetingText);

        } else {
            conversationStarted = false;
            startBtn.textContent = "Start Conversation";
            if (recognition) recognition.stop();
            window.speechSynthesis.cancel();
            statusDiv.textContent = "Ready to talk.";
            chatBox.innerHTML = ''; // Clear chat history on end
        }
    });

    connect();
});
