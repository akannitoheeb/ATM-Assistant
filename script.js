// ============================================================
// ATM Assistant — Stage 1 (Claude-style layout)
//
// New in this version: instead of one single conversation, we
// keep a LIST of conversations ("sessions"), each with its own
// messages, saved in the browser's localStorage so they survive
// a page refresh. The sidebar shows that list, like Claude/ChatGPT.
// ============================================================

// Your browser now calls YOUR OWN function, not Groq directly.
// No API key lives here anymore — it's safe to make this code
// fully public.
const API_URL = "/.netlify/functions/chat";

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
      content: "⚠️ " + error.message
    });
    renderActiveChat();
  } finally {
    setLoading(false);
  }
}

// --------------------------------------------------------------
// API call — sends this session's message history to OUR OWN
// function (not Groq directly). Our function adds the system
// instruction and the secret key on the server side.
// --------------------------------------------------------------
async function callGroqAPI(messages) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  if (!data.reply) {
    throw new Error("No text returned from the API.");
  }

  return data.reply.trim();
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

  // User messages stay as plain text (safe, and they don't need formatting).
  // Assistant messages get run through our small markdown renderer below.
  if (kind === "assistant") {
    bubble.innerHTML = renderMarkdown(text);
  } else {
    bubble.textContent = text;
  }

  wrapper.appendChild(bubble);
  chatLog.appendChild(wrapper);
}

// --------------------------------------------------------------
// A small, purpose-built markdown renderer.
// Handles just what the AI actually sends us: **bold** text,
// numbered lists, bullet lists, and paragraph breaks. Not a full
// markdown library — just enough for clean, readable replies.
// --------------------------------------------------------------
function renderMarkdown(text) {
  // Escape HTML first so the AI's text can never inject real tags —
  // only the specific markdown patterns below become real HTML.
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Turn **bold** into <strong>bold</strong>
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Process line by line so we can group consecutive list items
  // into a single <ol> or <ul>, instead of one per line.
  const lines = withBold.split("\n");
  let html = "";
  let listType = null; // "ol", "ul", or null

  function closeList() {
    if (listType) {
      html += listType === "ol" ? "</ol>" : "</ul>";
      listType = null;
    }
  }

  lines.forEach(line => {
    const numberedMatch = line.match(/^\s*\d+[\.\)]\s+(.*)/);
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)/);

    if (numberedMatch) {
      if (listType !== "ol") { closeList(); html += "<ol>"; listType = "ol"; }
      html += `<li>${numberedMatch[1]}</li>`;
    } else if (bulletMatch) {
      if (listType !== "ul") { closeList(); html += "<ul>"; listType = "ul"; }
      html += `<li>${bulletMatch[1]}</li>`;
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      html += `<p>${line}</p>`;
    }
  });
  closeList();

  return html;
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
