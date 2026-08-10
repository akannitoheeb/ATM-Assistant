// ============================================================
// ATM Assistant — Stage 1 (Claude-style layout)
//
// New in this version: instead of one single conversation, we
// keep a LIST of conversations ("sessions"), each with its own
// messages, saved in the browser's localStorage so they survive
// a page refresh. The sidebar shows that list, like Claude/ChatGPT.
// ============================================================

const API_KEY = "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";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_INSTRUCTION = `
You are ATM Assistant, a helpful general-purpose AI assistant that can discuss
any topic the user brings up — questions, advice, writing, explanations, etc.

You have particularly deep, practical expertise in email marketing and
copywriting: subject lines, segmentation, automation flows, deliverability,
and conversion copy, with an understanding of the Nigerian small-business
market. When a question touches marketing, lean into that expertise with
specific, actionable answers rather than generic tips.

For everything else, just be a clear, direct, genuinely useful assistant.
Keep answers reasonably concise unless the user asks for depth.
`.trim();

const STORAGE_KEY = "atm_assistant_sessions_v2";

// --------------------------------------------------------------
// Element references
// --------------------------------------------------------------
const greetingState = document.getElementById("greetingState");
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const historyList = document.getElementById("historyList");

// --------------------------------------------------------------
// Session state
// sessions: array of { id, title, messages: [{role, parts}] }
// activeId: which session is currently open
// --------------------------------------------------------------
let sessions = loadSessions();
let activeId = sessions.length > 0 ? sessions[0].id : null;

renderSidebar();
renderActiveChat();

// --------------------------------------------------------------
// New chat
// --------------------------------------------------------------
newChatBtn.addEventListener("click", () => {
  activeId = null;
  renderSidebar();
  renderActiveChat();
  userInput.focus();
});

// --------------------------------------------------------------
// Sending a message
// --------------------------------------------------------------
chatForm.addEventListener("submit", handleSend);

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

userInput.addEventListener("input", autoGrow);

async function handleSend(event) {
  event.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  if (API_KEY === "PASTE_YOUR_GROQ_API_KEY_HERE") {
    alert("Add your free Groq API key in script.js first (see the comment at the top of the file).");
    return;
  }

  // If there's no active session yet, create one now.
  if (activeId === null) {
    const newSession = {
      id: Date.now().toString(),
      title: text.slice(0, 40),
      messages: []
    };
    sessions.unshift(newSession);
    activeId = newSession.id;
  }

  const session = getActiveSession();
  session.messages.push({ role: "user", content: text });
  saveSessions();
  renderSidebar();
  renderActiveChat();

  userInput.value = "";
  autoGrow();
  setLoading(true);

  try {
    const reply = await callGroqAPI(session.messages);
    session.messages.push({ role: "assistant", content: reply });
    saveSessions();
    renderActiveChat();
  } catch (error) {
    console.error(error);
    session.messages.push({
      role: "assistant",
      content: "⚠️ Something went wrong reaching the AI. Check your API key and internet connection."
    });
    renderActiveChat();
  } finally {
    setLoading(false);
  }
}

// --------------------------------------------------------------
// API call — sends the system instruction plus this session's
// full message history so far, OpenAI-style (Groq uses the same
// message format as OpenAI: an array of {role, content} objects).
// --------------------------------------------------------------
async function callGroqAPI(messages) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...messages
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error("No text returned from the API.");
  }

  return rawText.trim();
}

// --------------------------------------------------------------
// Rendering
// --------------------------------------------------------------
function renderSidebar() {
  historyList.innerHTML = "";

  sessions.forEach(session => {
    const item = document.createElement("div");
    item.className = "history-item" + (session.id === activeId ? " active" : "");
    item.textContent = session.title || "New chat";
    item.addEventListener("click", () => {
      activeId = session.id;
      renderSidebar();
      renderActiveChat();
    });
    historyList.appendChild(item);
  });
}

function renderActiveChat() {
  const session = getActiveSession();

  if (!session) {
    greetingState.classList.remove("hidden");
    chatLog.classList.add("hidden");
    chatLog.innerHTML = "";
    return;
  }

  greetingState.classList.add("hidden");
  chatLog.classList.remove("hidden");
  chatLog.innerHTML = "";

  session.messages.forEach(msg => {
    const role = msg.role === "user" ? "user" : "assistant";
    addMessageToDOM(msg.content, role);
  });

  chatLog.scrollTop = chatLog.scrollHeight;
}

function addMessageToDOM(text, kind) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${kind}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  chatLog.appendChild(wrapper);
}

function setLoading(isLoading) {
  sendBtn.disabled = isLoading;
  userInput.disabled = isLoading;
}

function autoGrow() {
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight + "px";
}

// --------------------------------------------------------------
// Storage helpers
// --------------------------------------------------------------
function getActiveSession() {
  return sessions.find(s => s.id === activeId) || null;
}

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
