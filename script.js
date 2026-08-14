// ============================================================
// ATM Assistant — Stage 3 (accounts + server-side storage)
//
// Big change in this version: your chats and settings used to
// live only in this browser (localStorage). Now they live on
// the SERVER, tied to your account — so they follow you to any
// device you log into. This file talks to our own /data function
// to load and save that information, and to Netlify Identity to
// know who's logged in.
// ============================================================

const CHAT_API_URL = "/.netlify/functions/chat";
const DATA_API_URL = "/.netlify/functions/data";

// --------------------------------------------------------------
// Element references
// --------------------------------------------------------------
const loginGate = document.getElementById("loginGate");
const appRoot = document.getElementById("appRoot");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");

const greetingState = document.getElementById("greetingState");
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const historyList = document.getElementById("historyList");
const sidebar = document.getElementById("sidebar");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");

const settingsBtn = document.getElementById("settingsBtn");
const settingsOverlay = document.getElementById("settingsOverlay");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const toneSelect = document.getElementById("toneSelect");
const nigeriaToggle = document.getElementById("nigeriaToggle");
const customInstruction = document.getElementById("customInstruction");

// --------------------------------------------------------------
// App state — filled in once the user logs in
// --------------------------------------------------------------
let sessions = [];
let activeId = null;
let settings = defaultSettings();

function defaultSettings() {
  return {
    tone: "friendly and warm",
    emphasizeNigeria: true,
    customInstruction: ""
  };
}

// ================================================================
// AUTH — Netlify Identity handles login/signup/logout for us.
// ================================================================
netlifyIdentity.init();

netlifyIdentity.on("init", (user) => {
  if (user) {
    onLogin(user);
  } else {
    showLoginGate();
  }
});

netlifyIdentity.on("login", (user) => {
  netlifyIdentity.close();
  onLogin(user);
});

netlifyIdentity.on("logout", () => {
  sessions = [];
  activeId = null;
  settings = defaultSettings();
  showLoginGate();
});

loginBtn.addEventListener("click", () => netlifyIdentity.open());
logoutBtn.addEventListener("click", () => netlifyIdentity.logout());

async function onLogin(user) {
  userEmail.textContent = user.email;
  loginGate.classList.add("hidden");
  appRoot.classList.remove("hidden");

  await loadUserData();
  applySettingsToForm();
  activeId = sessions.length > 0 ? sessions[0].id : null;
  renderSidebar();
  renderActiveChat();
}

function showLoginGate() {
  loginGate.classList.remove("hidden");
  appRoot.classList.add("hidden");
}

// Attaches the logged-in user's login token to a request, so our
// server functions know who's asking. Netlify Identity handles
// refreshing this token automatically if it's close to expiring.
async function getAuthHeaders() {
  const user = netlifyIdentity.currentUser();
  if (!user) return {};
  const token = await user.jwt();
  return { Authorization: `Bearer ${token}` };
}

// ================================================================
// SERVER-SIDE DATA — load/save sessions + settings via our own
// /data function, which stores them in Netlify Blobs per user.
// ================================================================
async function loadUserData() {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(DATA_API_URL, { headers });
    const data = await response.json();
    sessions = data.sessions || [];
    settings = data.settings || defaultSettings();
  } catch (error) {
    console.error("Failed to load data:", error);
    sessions = [];
    settings = defaultSettings();
  }
}

async function saveUserData() {
  try {
    const headers = await getAuthHeaders();
    await fetch(DATA_API_URL, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ sessions, settings })
    });
  } catch (error) {
    console.error("Failed to save data:", error);
  }
}

// --------------------------------------------------------------
// Settings panel
// --------------------------------------------------------------
settingsBtn.addEventListener("click", () => {
  applySettingsToForm();
  settingsOverlay.classList.remove("hidden");
});

closeSettingsBtn.addEventListener("click", () => {
  settingsOverlay.classList.add("hidden");
});

settingsOverlay.addEventListener("click", (event) => {
  if (event.target === settingsOverlay) {
    settingsOverlay.classList.add("hidden");
  }
});

saveSettingsBtn.addEventListener("click", () => {
  settings = {
    tone: toneSelect.value,
    emphasizeNigeria: nigeriaToggle.checked,
    customInstruction: customInstruction.value.trim()
  };
  saveUserData();
  settingsOverlay.classList.add("hidden");
});

function applySettingsToForm() {
  toneSelect.value = settings.tone;
  nigeriaToggle.checked = settings.emphasizeNigeria;
  customInstruction.value = settings.customInstruction;
}

// --------------------------------------------------------------
// Mobile sidebar toggle
// --------------------------------------------------------------
mobileMenuBtn.addEventListener("click", openSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);

function openSidebar() {
  sidebar.classList.add("open");
  sidebarBackdrop.classList.remove("hidden");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  sidebarBackdrop.classList.add("hidden");
}

// --------------------------------------------------------------
// New chat
// --------------------------------------------------------------
newChatBtn.addEventListener("click", () => {
  activeId = null;
  renderSidebar();
  renderActiveChat();
  userInput.focus();
  closeSidebar();
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
  saveUserData();
  renderSidebar();
  renderActiveChat();

  userInput.value = "";
  autoGrow();
  setLoading(true);

  try {
    const reply = await callGroqAPI(session.messages);
    session.messages.push({ role: "assistant", content: reply });
    saveUserData();
    renderActiveChat();
  } catch (error) {
    console.error(error);
    session.messages.push({ role: "assistant", content: "⚠️ " + error.message });
    renderActiveChat();
  } finally {
    setLoading(false);
  }
}

// --------------------------------------------------------------
// API call — sends this session's message history to OUR OWN
// function, including our login token so the server knows it's us.
// --------------------------------------------------------------
async function callGroqAPI(messages) {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({ messages, settings })
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
// Rendering — sidebar
// --------------------------------------------------------------
function renderSidebar() {
  historyList.innerHTML = "";

  sessions.forEach(session => {
    const item = document.createElement("div");
    item.className = "history-item" + (session.id === activeId ? " active" : "");

    const label = document.createElement("span");
    label.className = "history-item-label";
    label.textContent = session.title || "New chat";
    label.addEventListener("click", () => {
      activeId = session.id;
      renderSidebar();
      renderActiveChat();
      closeSidebar();
    });

    const menuBtn = document.createElement("button");
    menuBtn.className = "history-item-menu";
    menuBtn.textContent = "⋮";
    menuBtn.setAttribute("aria-label", "Chat options");
    menuBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      handleHistoryMenu(session.id);
    });

    item.appendChild(label);
    item.appendChild(menuBtn);
    historyList.appendChild(item);
  });
}

function handleHistoryMenu(sessionId) {
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;

  const newTitle = prompt("Rename this chat (leave blank to delete it):", session.title);
  if (newTitle === null) return;

  if (newTitle.trim() === "") {
    if (confirm("Delete this chat? This can't be undone.")) {
      sessions = sessions.filter(s => s.id !== sessionId);
      if (activeId === sessionId) activeId = sessions.length > 0 ? sessions[0].id : null;
      saveUserData();
      renderSidebar();
      renderActiveChat();
    }
    return;
  }

  session.title = newTitle.trim();
  saveUserData();
  renderSidebar();
}

// --------------------------------------------------------------
// Rendering — chat log
// --------------------------------------------------------------
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

  if (kind === "assistant") {
    bubble.innerHTML = renderMarkdown(text);
  } else {
    bubble.textContent = text;
  }

  wrapper.appendChild(bubble);
  chatLog.appendChild(wrapper);
}

// --------------------------------------------------------------
// A small, purpose-built markdown renderer — bold, lists, paragraphs.
// --------------------------------------------------------------
function renderMarkdown(text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const lines = withBold.split("\n");
  let html = "";
  let listType = null;

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

function getActiveSession() {
  return sessions.find(s => s.id === activeId) || null;
}
