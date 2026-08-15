// ============================================================
// ATM Assistant — Stage 3 (Supabase accounts + database)
//
// Chats and settings now live in Supabase, tied to your account,
// instead of just this browser — so they follow you to any
// device you log into. Login/signup is also handled by Supabase.
// ============================================================

const CHAT_API_URL = "/.netlify/functions/chat";

// --------------------------------------------------------------
// Element references
// --------------------------------------------------------------
const loginGate = document.getElementById("loginGate");
const appRoot = document.getElementById("appRoot");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");

const greetingState = document.getElementById("greetingState");
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const attachBtn = document.getElementById("attachBtn");
const fileInput = document.getElementById("fileInput");
const attachmentPreview = document.getElementById("attachmentPreview");
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
// SUPABASE SETUP
// Paste your own Project URL and anon key here — get them from
// Supabase → Settings → API. These are safe to be public; the
// database's Row Level Security rules are what actually protect
// everyone's data, not secrecy of this key.
// ================================================================
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authForm = document.getElementById("authForm");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authToggleBtn = document.getElementById("authToggleBtn");
const authToggleText = document.getElementById("authToggleText");
const authSubtext = document.getElementById("authSubtext");
const authError = document.getElementById("authError");

let authMode = "login"; // or "signup"

authToggleBtn.addEventListener("click", () => {
  authMode = authMode === "login" ? "signup" : "login";
  updateAuthFormLabels();
});

function updateAuthFormLabels() {
  if (authMode === "login") {
    authSubmitBtn.textContent = "Log in";
    authToggleText.textContent = "Don't have an account?";
    authToggleBtn.textContent = "Sign up";
    authSubtext.textContent = "Sign in to save your chats and settings to your account.";
  } else {
    authSubmitBtn.textContent = "Sign up";
    authToggleText.textContent = "Already have an account?";
    authToggleBtn.textContent = "Log in";
    authSubtext.textContent = "Create an account to save your chats and settings.";
  }
  authError.classList.add("hidden");
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authError.classList.add("hidden");
  authSubmitBtn.disabled = true;

  const email = authEmail.value.trim();
  const password = authPassword.value;

  try {
    const { error } =
      authMode === "login"
        ? await supabaseClient.auth.signInWithPassword({ email, password })
        : await supabaseClient.auth.signUp({ email, password });

    if (error) throw error;
    // On success, onAuthStateChange (below) handles showing the app.
  } catch (error) {
    authError.textContent = error.message;
    authError.classList.remove("hidden");
  } finally {
    authSubmitBtn.disabled = false;
  }
});

logoutBtn.addEventListener("click", () => supabaseClient.auth.signOut());

// Fires on initial page load (restoring a saved session) AND
// whenever the user logs in or out — one place to react to both.
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session && session.user) {
    onLogin(session.user);
  } else {
    showLoginGate();
  }
});

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
  authForm.reset();
}

// Attaches the logged-in user's access token to a request, so our
// chat function knows who's asking.
async function getAuthHeaders() {
  const { data } = await supabaseClient.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ================================================================
// SERVER-SIDE DATA — sessions + settings, stored directly in
// Supabase (protected by the Row Level Security rules you set up),
// no extra function needed for this part.
// ================================================================
async function loadUserData() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const { data, error } = await supabaseClient
      .from("user_data")
      .select("sessions, settings")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    sessions = (data && data.sessions) || [];
    settings = (data && data.settings) || defaultSettings();
  } catch (error) {
    console.error("Failed to load data:", error);
    sessions = [];
    settings = defaultSettings();
  }
}

async function saveUserData() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const { error } = await supabaseClient.from("user_data").upsert({
      user_id: user.id,
      sessions,
      settings,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
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
// File attachments (images and plain text files)
// --------------------------------------------------------------
let pendingAttachment = null; // { kind: "image"|"text", name, data }

attachBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  try {
    if (file.type.startsWith("image/")) {
      const dataUrl = await readFileAsDataURL(file);
      pendingAttachment = { kind: "image", name: file.name, data: dataUrl };
    } else {
      // Treat anything else as plain text — .txt, .md, .csv, etc.
      // (PDFs and Word docs aren't supported yet — text files only for now.)
      const text = await readFileAsText(file);
      pendingAttachment = { kind: "text", name: file.name, data: text };
    }
    renderAttachmentPreview();
  } catch (error) {
    console.error("Failed to read file:", error);
    alert("Couldn't read that file. Try an image or a plain text file.");
  }

  fileInput.value = ""; // allows attaching the same file again later
});

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function renderAttachmentPreview() {
  attachmentPreview.innerHTML = "";

  if (!pendingAttachment) {
    attachmentPreview.classList.add("hidden");
    return;
  }

  attachmentPreview.classList.remove("hidden");

  if (pendingAttachment.kind === "image") {
    const img = document.createElement("img");
    img.src = pendingAttachment.data;
    attachmentPreview.appendChild(img);
  } else {
    const chip = document.createElement("div");
    chip.className = "attachment-chip";
    chip.textContent = "📄 " + pendingAttachment.name;
    attachmentPreview.appendChild(chip);
  }

  const removeBtn = document.createElement("button");
  removeBtn.className = "attachment-remove";
  removeBtn.textContent = "✕";
  removeBtn.addEventListener("click", () => {
    pendingAttachment = null;
    renderAttachmentPreview();
  });
  attachmentPreview.appendChild(removeBtn);
}

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
  if (!text && !pendingAttachment) return;

  if (activeId === null) {
    const newSession = {
      id: Date.now().toString(),
      title: (text || pendingAttachment.name).slice(0, 40),
      messages: []
    };
    sessions.unshift(newSession);
    activeId = newSession.id;
  }

  // Build the message content. Plain string for text-only messages
  // (keeps things simple/compact) — an array of parts only when
  // there's an image or file attached, which is the format Groq's
  // vision model expects.
  let content = text;

  if (pendingAttachment) {
    if (pendingAttachment.kind === "image") {
      content = [
        { type: "text", text: text || "What's in this image?" },
        { type: "image_url", image_url: { url: pendingAttachment.data } }
      ];
    } else {
      // Text file — just fold its contents into the message text,
      // no vision model needed for this.
      content = `${text}\n\n[Attached file: ${pendingAttachment.name}]\n${pendingAttachment.data}`;
    }
  }

  const session = getActiveSession();
  session.messages.push({ role: "user", content });
  saveUserData();
  renderSidebar();
  renderActiveChat();

  userInput.value = "";
  pendingAttachment = null;
  renderAttachmentPreview();
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

// content is either a plain string, or an array of parts
// ({type:"text"} / {type:"image_url"}) when a file was attached.
function addMessageToDOM(content, kind) {
  const textPart = Array.isArray(content)
    ? (content.find(p => p.type === "text")?.text || "")
    : content;
  const imagePart = Array.isArray(content)
    ? content.find(p => p.type === "image_url")
    : null;

  const wrapper = document.createElement("div");
  wrapper.className = `message ${kind}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = kind === "assistant" ? "✉" : getUserInitial();

  const body = document.createElement("div");
  body.className = "message-body";

  if (imagePart) {
    const img = document.createElement("img");
    img.className = "message-image";
    img.src = imagePart.image_url.url;
    body.appendChild(img);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (kind === "assistant") {
    bubble.innerHTML = renderMarkdown(textPart);
  } else {
    bubble.textContent = textPart;
  }
  body.appendChild(bubble);

  // Copy button under assistant replies, matching the kind of
  // message-action row you'd see in other AI chat interfaces.
  if (kind === "assistant" && textPart) {
    const actions = document.createElement("div");
    actions.className = "message-actions";

    const copyBtn = document.createElement("button");
    copyBtn.className = "action-btn";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(textPart);
      copyBtn.textContent = "Copied";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1200);
    });

    actions.appendChild(copyBtn);
    body.appendChild(actions);
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(body);
  chatLog.appendChild(wrapper);
}

// Uses the first letter of the logged-in user's email for their avatar.
function getUserInitial() {
  const email = userEmail.textContent || "";
  return email.charAt(0).toUpperCase() || "U";
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
