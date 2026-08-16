// ============================================================
// ATM Assistant — Stage 4 (guest mode + accounts)
//
// Chat is visible immediately, even before logging in. Guests get
// 1 free message per day (tracked by IP, on the server). Once
// that's used, the login/signup modal opens automatically. Logged
// in, chats/settings sync to Supabase as before.
// ============================================================

const CHAT_API_URL = "/api/chat";
const BREVO_SIGNUP_URL = "/api/brevo-signup";

// --------------------------------------------------------------
// Element references
// --------------------------------------------------------------
const guestBlock = document.getElementById("guestBlock");
const accountBlock = document.getElementById("accountBlock");
const openAuthBtn = document.getElementById("openAuthBtn");
const logoutBtn = document.getElementById("logoutBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const upgradeOverlay = document.getElementById("upgradeOverlay");
const closeUpgradeBtn = document.getElementById("closeUpgradeBtn");
const upgradeError = document.getElementById("upgradeError");
const userEmail = document.getElementById("userEmail");
const userAvatarImg = document.getElementById("userAvatarImg");
const userAvatarInitial = document.getElementById("userAvatarInitial");

const authOverlay = document.getElementById("authOverlay");
const closeAuthBtn = document.getElementById("closeAuthBtn");

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
// App state
// --------------------------------------------------------------
let sessions = [];
let activeId = null;
let settings = defaultSettings();
let isGuest = true; // flips to false once logged in

function defaultSettings() {
  return {
    tone: "friendly and warm",
    emphasizeNigeria: true,
    customInstruction: ""
  };
}

// ================================================================
// SUPABASE SETUP
// ================================================================
const SUPABASE_URL = "https://jouvcvrnsegzecqdkody.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdXZjdnJuc2VnemVjcWRrb2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NDAxOTEsImV4cCI6MjEwMjMxNjE5MX0.fnkm94U5c-gbdDMrBvVoZ4ewyEUcOlRY7TJkqkEQS1Q";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authForm = document.getElementById("authForm");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const googleAuthBtn = document.getElementById("googleAuthBtn");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authToggleBtn = document.getElementById("authToggleBtn");
const authToggleText = document.getElementById("authToggleText");
const authSubtext = document.getElementById("authSubtext");
const authError = document.getElementById("authError");

let authMode = "login"; // or "signup"

// --------------------------------------------------------------
// Auth modal open/close
// --------------------------------------------------------------
function openAuthModal() {
  authError.classList.add("hidden");
  authOverlay.classList.remove("hidden");
}

function closeAuthModal() {
  authOverlay.classList.add("hidden");
}

openAuthBtn.addEventListener("click", openAuthModal);
closeAuthBtn.addEventListener("click", closeAuthModal);
authOverlay.addEventListener("click", (event) => {
  if (event.target === authOverlay) closeAuthModal();
});

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

// --------------------------------------------------------------
// Show/hide password
// --------------------------------------------------------------
togglePasswordBtn.addEventListener("click", () => {
  const isPassword = authPassword.type === "password";
  authPassword.type = isPassword ? "text" : "password";
  togglePasswordBtn.textContent = isPassword ? "🙈" : "👁";
  togglePasswordBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
});

// --------------------------------------------------------------
// Friendlier copy for Supabase's raw auth error messages
// --------------------------------------------------------------
function friendlyAuthError(message) {
  const map = {
    "Invalid login credentials": "That email or password doesn't look right. Please try again.",
    "User already registered": "An account with that email already exists — try logging in instead.",
    "Email not confirmed": "Please confirm your email before logging in.",
    "Password should be at least 6 characters.": "Your password needs to be at least 6 characters."
  };
  return map[message] || message;
}

// --------------------------------------------------------------
// Email/password submit
// --------------------------------------------------------------
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authError.classList.add("hidden");
  authSubmitBtn.disabled = true;

  const email = authEmail.value.trim();
  const password = authPassword.value;
  const wasSignup = authMode === "signup";

  try {
    const { error } =
      authMode === "login"
        ? await supabaseClient.auth.signInWithPassword({ email, password })
        : await supabaseClient.auth.signUp({ email, password });

    if (error) throw error;

    if (wasSignup) {
      notifyBrevoSignup(email, "");
    }
    // On success, onAuthStateChange (below) handles showing the app
    // and closes the modal via onLogin().
  } catch (error) {
    authError.textContent = friendlyAuthError(error.message);
    authError.classList.remove("hidden");
    authForm.classList.add("shake");
    upgradeBtn.classList.remove("hidden");
    setTimeout(() => authForm.classList.remove("shake"), 400);
  } finally {
    authSubmitBtn.disabled = false;
  }
});

// --------------------------------------------------------------
// Google sign-in — its own top-level listener, not nested inside
// the email/password submit handler.
// --------------------------------------------------------------
googleAuthBtn.addEventListener("click", async () => {
  authError.classList.add("hidden");
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin }
  });
  if (error) {
    authError.textContent = friendlyAuthError(error.message);
    authError.classList.remove("hidden");
  }
  // On success, the page redirects to Google then back — onAuthStateChange
  // below picks it up automatically once the user returns.
});

function notifyBrevoSignup(email, name) {
  fetch(BREVO_SIGNUP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name })
  }).catch((error) => {
    console.error("Brevo signup hook failed:", error);
  });
}

logoutBtn.addEventListener("click", () => supabaseClient.auth.signOut());

// Fires on initial page load (restoring a saved session) AND
// whenever the user logs in or out — one place to react to both.
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session && session.user) {
    onLogin(session.user);
  } else {
    showGuestMode();
  }
});

// --------------------------------------------------------------
// Logged-in state (single definition — do not duplicate this
// function elsewhere in the file, or the second one silently wins)
// --------------------------------------------------------------
async function onLogin(user) {
  isGuest = false;
  closeAuthModal();

  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
  userEmail.textContent = fullName ? `${fullName} · ${user.email}` : user.email;

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";
  if (avatarUrl) {
    userAvatarImg.src = avatarUrl;
    userAvatarImg.classList.remove("hidden");
    userAvatarInitial.classList.add("hidden");
  } else {
    userAvatarImg.classList.add("hidden");
    userAvatarInitial.classList.remove("hidden");
    userAvatarInitial.textContent = (fullName || user.email).charAt(0).toUpperCase();
  }

  guestBlock.classList.add("hidden");
  accountBlock.classList.remove("hidden");

  // Was this account created moments ago? Covers Google sign-in, which
  // has no separate "signup" button to hook into like the email form does.
  const createdAt = new Date(user.created_at).getTime();
  const lastSignIn = new Date(user.last_sign_in_at).getTime();
  const isFreshAccount = Math.abs(lastSignIn - createdAt) < 15000;
  const isGoogleUser = user.app_metadata?.provider === "google";

  if (isFreshAccount && isGoogleUser) {
    notifyBrevoSignup(user.email, fullName);
  }

  await loadUserData();
  applySettingsToForm();
  activeId = sessions.length > 0 ? sessions[0].id : null;
  renderSidebar();
  renderActiveChat();
}

// --------------------------------------------------------------
// Guest state — chat stays usable, nothing persists across reloads
// --------------------------------------------------------------
function showGuestMode() {
  isGuest = true;
  accountBlock.classList.add("hidden");
  guestBlock.classList.remove("hidden");
  upgradeBtn.classList.add("hidden");

  sessions = [];
  settings = defaultSettings();
  activeId = null;
  applySettingsToForm();
  renderSidebar();
  renderActiveChat();
}

// --------------------------------------------------------------
// Upgrade to Pro
// --------------------------------------------------------------
upgradeBtn.addEventListener("click", () => {
  upgradeError.classList.add("hidden");
  upgradeOverlay.classList.remove("hidden");
});

closeUpgradeBtn.addEventListener("click", () => {
  upgradeOverlay.classList.add("hidden");
});

upgradeOverlay.addEventListener("click", (event) => {
  if (event.target === upgradeOverlay) upgradeOverlay.classList.add("hidden");
});

document.querySelectorAll(".currency-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    upgradeError.classList.add("hidden");
    document.querySelectorAll(".currency-btn").forEach((b) => (b.disabled = true));

    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ currency: btn.dataset.currency })
      });
      const data = await response.json();

      if (!response.ok || !data.link) {
        throw new Error(data.error || "Could not start payment.");
      }

      window.location.href = data.link;
    } catch (error) {
      upgradeError.textContent = error.message;
      upgradeError.classList.remove("hidden");
      document.querySelectorAll(".currency-btn").forEach((b) => (b.disabled = false));
    }
  });
});

// Attaches the logged-in user's access token to a request, so our
// chat function knows who's asking. Guests send no auth header at all.
async function getAuthHeaders() {
  const { data } = await supabaseClient.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ================================================================
// SERVER-SIDE DATA — sessions + settings, only for logged-in users
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
  if (isGuest) return; // nothing to persist for a guest session

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
      const text = await readFileAsText(file);
      pendingAttachment = { kind: "text", name: file.name, data: text };
    }
    renderAttachmentPreview();
  } catch (error) {
    console.error("Failed to read file:", error);
    alert("Couldn't read that file. Try an image or a plain text file.");
  }

  fileInput.value = "";
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
// Typing indicator (top-level function — not nested inside handleSend)
// --------------------------------------------------------------
function addTypingIndicator() {
  const wrapper = document.createElement("div");
  wrapper.className = "message assistant";
  wrapper.id = "typingIndicator";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "✉";

  const body = document.createElement("div");
  body.className = "message-body";

  const bubble = document.createElement("div");
  bubble.className = "bubble typing-indicator";
  bubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;

  body.appendChild(bubble);
  wrapper.appendChild(avatar);
  wrapper.appendChild(body);
  chatLog.appendChild(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;
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

  let content = text;

  if (pendingAttachment) {
    if (pendingAttachment.kind === "image") {
      content = [
        { type: "text", text: text || "What's in this image?" },
        { type: "image_url", image_url: { url: pendingAttachment.data } }
      ];
    } else {
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
  addTypingIndicator();

  try {
    const reply = await callGroqAPI(session.messages);
    session.messages.push({ role: "assistant", content: reply });
    saveUserData();
    renderActiveChat({ typeLast: true });
  } catch (error) {
    console.error(error);

    if (error.code === "GUEST_LIMIT") {
      // Don't show this as a chat error bubble — remove the user's
      // message from the guest's in-memory session and open the
      // signup modal instead, since guests can't retry today anyway.
      session.messages.pop();
      renderActiveChat();
      openAuthModal();
    } else {
      session.messages.push({ role: "assistant", content: "⚠️ " + error.message });
      renderActiveChat();
    }
  } finally {
    setLoading(false);
  }
}

// --------------------------------------------------------------
// API call
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
    const err = new Error(data.error || `Request failed with status ${response.status}`);
    if (data.code) err.code = data.code;
    throw err;
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
function renderActiveChat(options = {}) {
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

  session.messages.forEach((msg, index) => {
    const role = msg.role === "user" ? "user" : "assistant";
    const isLast = index === session.messages.length - 1;
    const shouldType = Boolean(options.typeLast) && isLast && role === "assistant";
    addMessageToDOM(msg.content, role, shouldType);
  });

  chatLog.scrollTop = chatLog.scrollHeight;
}

function addMessageToDOM(content, kind, animate = false) {
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
    if (animate) {
      typeWriterEffect(bubble, textPart);
    } else {
      bubble.innerHTML = renderMarkdown(textPart);
    }
  } else {
    bubble.textContent = textPart;
  }
  body.appendChild(bubble);

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

function typeWriterEffect(el, fullText, speedMs = 16) {
  const tokens = fullText.split(/(\s+)/);
  let i = 0;
  el.innerHTML = "";

  function step() {
    i++;
    el.innerHTML = renderMarkdown(tokens.slice(0, i).join(""));
    chatLog.scrollTop = chatLog.scrollHeight;
    if (i < tokens.length) {
      setTimeout(step, speedMs);
    }
  }

  step();
}

function getUserInitial() {
  if (isGuest) return "G";
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

// --------------------------------------------------------------
// Initial render — greeting shows immediately for guests, before
// onAuthStateChange even resolves.
// --------------------------------------------------------------
renderActiveChat();
