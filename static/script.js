const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const voiceButton = document.querySelector("#voice-btn");
const clearButton = document.querySelector("#clear-btn");
const chatContainer = document.querySelector(".chat-container");

let userText = null;
let isUserScrolling = false; // Flag to track if the user is manually scrolling

const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
}

// Update scrollToBottom to scroll only if the user is near the bottom
const scrollToBottom = () => {
    if (!isUserScrolling) {
        chatContainer.scrollTop = chatContainer.scrollHeight; // Force scroll to bottom if not manually scrolling
    }
}

const getChatResponse = async (incomingChatDiv) => {
    const pElement = document.createElement("p");

    try {
        const response = await fetch("/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: userText })
        });
        const data = await response.json();
        pElement.textContent = data.response;
        speakResponse(data.response); // Speak the response
    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    scrollToBottom(); // Ensure scroll to bottom after response is appended
}

const speakResponse = (responseText) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.lang = 'hi-IN'; // Adjust language as needed
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
        };
        window.speechSynthesis.speak(utterance);
    } else {
        console.error('Speech synthesis not supported in this browser.');
    }
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="static/bot.png" alt="chatbot-img">
                        <div class="typing-animation">
                            <span class="dot" style="--delay: 0s"></span>
                            <span class="dot" style="--delay: 0.2s"></span>
                            <span class="dot" style="--delay: 0.4s"></span>
                        </div>
                    </div>
                </div>`;
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    scrollToBottom(); // Scroll down when typing animation is added
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="static/profile.jpg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    scrollToBottom(); // Ensure scroll to bottom after sending a message
    setTimeout(showTypingAnimation, 500); // Slight delay before showing typing animation
}

const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'hi-IN'; // Hindi language code (for Bhojpuri, as direct support might not be available)

    recognition.onstart = () => {
        console.log('Voice recognition started. Speak into the microphone.');
    };

    recognition.onspeechend = () => {
        recognition.stop();
        console.log('Voice recognition stopped.');
    };

    recognition.onresult = async (event) => {
        const speechResult = event.results[0][0].transcript;
        userText = speechResult;

        const html = `<div class="chat-content">
                        <div class="chat-details">
                            <img src="static/profile.jpg" alt="user-img">
                            <p>${userText}</p>
                        </div>
                    </div>`;

        const outgoingChatDiv = createChatElement(html, "outgoing");
        chatContainer.querySelector(".default-text")?.remove();
        chatContainer.appendChild(outgoingChatDiv);
        scrollToBottom(); // Ensure scroll to bottom after receiving voice input
        setTimeout(showTypingAnimation, 500); // Slight delay before showing typing animation
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    recognition.start();
}

const clearChat = () => {
    chatContainer.innerHTML = '';
    const defaultText = `<div class="default-text">
                            <h1>स्वागत है!</h1>
                            <p>चैटबॉट के साथ बातचीत शुरू करें।</p>
                         </div>`;
    chatContainer.innerHTML = defaultText;
    scrollToBottom(); // Scroll to bottom after clearing the chat
}

sendButton.addEventListener("click", handleOutgoingChat);
voiceButton.addEventListener("click", handleVoiceInput);
clearButton.addEventListener("click", clearChat);

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

// Add event listener to track user scroll behavior
chatContainer.addEventListener('scroll', () => {
    const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 50;
    isUserScrolling = !isAtBottom; // Update flag based on user's scroll position
});
