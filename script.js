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

const brandName = document.getElementById("brandName");
const brandIndustry = document.getElementById("brandIndustry");
const brandAudience = document.getElementById("brandAudience");
const brandVoice = document.getElementById("brandVoice");
const brandAvoidWords = document.getElementById("brandAvoidWords");
const brandSampleEmail = document.getElementById("brandSampleEmail");

const projectSwitcherBtn = document.getElementById("projectSwitcherBtn");
const projectSwitcherPopup = document.getElementById("projectSwitcherPopup");
const activeProjectLabel = document.getElementById("activeProjectLabel");
const projectListContainer = document.getElementById("projectListContainer");
const newProjectBtn = document.getElementById("newProjectBtn");
const brandProfileLabel = document.getElementById("brandProfileLabel");
let activeProjectId = null; // null = "General" — the default/legacy bucket

const authOverlay = document.getElementById("authOverlay");
const closeAuthBtn = document.getElementById("closeAuthBtn");

const greetingState = document.getElementById("greetingState");
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const attachmentPreview = document.getElementById("attachmentPreview");
const newChatBtn = document.getElementById("newChatBtn");
const historyList = document.getElementById("historyList");
const historySearchInput = document.getElementById("historySearchInput");
let historyFilter = "";
let campaignMode = false;
let includeLandingPage = false;

historySearchInput.addEventListener("input", () => {
  historyFilter = historySearchInput.value.trim().toLowerCase();
  renderSidebar();
});

// --------------------------------------------------------------
// Voice input — tap-to-record one utterance. Deliberately NOT
// using continuous mode: Safari's continuous recognition is known
// to be unreliable (mic never stops / no result fires), while
// single-utterance mode works consistently across Safari, Chrome
// and Edge.
// --------------------------------------------------------------
const micBtn = document.getElementById("micBtn");
const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecording = false;

if (SpeechRecognitionCtor) {
  recognition = new SpeechRecognitionCtor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = userInput.value ? `${userInput.value} ${transcript}` : transcript;
    autoGrow();
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    stopRecordingUI();
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      alert("Microphone access was blocked. Enable it under Settings > Safari > Microphone for this site.");
    }
  };

  recognition.onend = stopRecordingUI;

  micBtn.addEventListener("click", () => {
    if (isRecording) {
      recognition.stop();
      return;
    }
    isRecording = true;
    micBtn.classList.add("recording");
    try {
      recognition.start();
    } catch (error) {
      console.error("Could not start recognition:", error);
      stopRecordingUI();
    }
  });
} else {
  micBtn.classList.add("hidden"); // browser has no speech recognition (e.g. desktop Firefox)
}

function stopRecordingUI() {
  isRecording = false;
  micBtn.classList.remove("recording");
}

// --------------------------------------------------------------
// Voice output — reads an assistant reply aloud. Cancels any
// currently-playing speech first, so only one reply speaks at once.
// --------------------------------------------------------------
function toggleSpeak(text, btn) {
  if (!("speechSynthesis" in window)) return;

  const wasThisOneSpeaking = btn.textContent === "Stop";
  speechSynthesis.cancel();
  document.querySelectorAll(".message-actions .action-btn").forEach((b) => {
    if (b.textContent === "Stop") b.textContent = "Listen";
  });

  if (wasThisOneSpeaking) return; // this button's own click was the "stop" tap

  const plainText = text.replace(/[*_#`]/g, ""); // strip stray markdown before speaking
  const utterance = new SpeechSynthesisUtterance(plainText);
  utterance.onend = () => { btn.textContent = "Listen"; };
  utterance.onerror = () => { btn.textContent = "Listen"; };

  btn.textContent = "Stop";
  speechSynthesis.speak(utterance);
}

const sidebar = document.getElementById("sidebar");
const sidebarOpenBtn = document.getElementById("sidebarOpenBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");

const settingsBtn = document.getElementById("settingsBtn");
const accountTrigger = document.getElementById("accountTrigger");
const accountPopup = document.getElementById("accountPopup");
const popupSettingsBtn = document.getElementById("popupSettingsBtn");

function closeAccountPopup() {
  accountPopup.classList.add("hidden");
  accountTrigger.setAttribute("aria-expanded", "false");
}

accountTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = accountPopup.classList.contains("hidden");
  accountPopup.classList.toggle("hidden", !willOpen);
  accountTrigger.setAttribute("aria-expanded", String(willOpen));
});

document.addEventListener("click", (e) => {
  if (!accountPopup.classList.contains("hidden") && !accountBlock.contains(e.target)) {
    closeAccountPopup();
  }
});

popupSettingsBtn.addEventListener("click", () => {
  closeAccountPopup();
  settingsBtn.click();
});

function closeProjectSwitcher() {
  projectSwitcherPopup.classList.add("hidden");
  projectSwitcherBtn.setAttribute("aria-expanded", "false");
}

projectSwitcherBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = projectSwitcherPopup.classList.contains("hidden");
  renderProjectSwitcher();
  projectSwitcherPopup.classList.toggle("hidden", !willOpen);
  projectSwitcherBtn.setAttribute("aria-expanded", String(willOpen));
});

document.addEventListener("click", (e) => {
  if (!projectSwitcherPopup.classList.contains("hidden") &&
      !projectSwitcherBtn.contains(e.target) &&
      !projectSwitcherPopup.contains(e.target)) {
    closeProjectSwitcher();
  }
});

function renderProjectSwitcher() {
  projectListContainer.innerHTML = "";

  const generalItem = document.createElement("button");
  generalItem.type = "button";
  generalItem.className = "project-popup-item" + (activeProjectId === null ? " active" : "");
  generalItem.textContent = "General";
  generalItem.addEventListener("click", () => switchProject(null));
  projectListContainer.appendChild(generalItem);

  (settings.projects || []).forEach((project) => {
    const row = document.createElement("div");
    row.className = "project-popup-row";

    const item = document.createElement("button");
    item.type = "button";
    item.className = "project-popup-item" + (activeProjectId === project.id ? " active" : "");
    item.textContent = project.name;
    item.addEventListener("click", () => switchProject(project.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "project-popup-delete";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", `Delete ${project.name}`);
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteProject(project.id);
    });

    row.appendChild(item);
    row.appendChild(deleteBtn);
    projectListContainer.appendChild(row);
  });
}

function switchProject(projectId) {
  activeProjectId = projectId;
  activeProjectLabel.textContent = getActiveProjectName();
  activeId = null;
  closeProjectSwitcher();
  renderSidebar();
  renderActiveChat();
}

newProjectBtn.addEventListener("click", () => {
  const name = prompt("Name this brand/project (e.g. a client's business name):");
  if (!name || !name.trim()) return;

  const project = { id: Date.now().toString(), name: name.trim(), brandProfile: emptyBrandProfile() };
  settings.projects = settings.projects || [];
  settings.projects.push(project);
  saveUserData();
  switchProject(project.id);
});

function deleteProject(projectId) {
  const project = (settings.projects || []).find((p) => p.id === projectId);
  if (!project) return;

  if (!confirm(`Delete "${project.name}"? Its chats move to General, they won't be deleted.`)) return;

  settings.projects = settings.projects.filter((p) => p.id !== projectId);
  sessions.forEach((s) => {
    if (s.projectId === projectId) s.projectId = null;
  });

  if (activeProjectId === projectId) {
    activeProjectId = null;
    activeProjectLabel.textContent = "General";
    activeId = null;
  }

  saveUserData();
  renderProjectSwitcher();
  renderSidebar();
  renderActiveChat();
}

// --------------------------------------------------------------
// Tools popup (replaces separate unlabeled icon buttons) — a
// single "+" button that opens a labeled menu, same pattern as
// Claude's attach menu. Lives above the input bar since the input
// sits at the bottom of the screen.
// --------------------------------------------------------------
const toolsBtn = document.getElementById("toolsBtn");
const toolsPopup = document.getElementById("toolsPopup");
const toolsAttachItem = document.getElementById("toolsAttachItem");
const toolsCampaignItem = document.getElementById("toolsCampaignItem");
const toolsLandingItem = document.getElementById("toolsLandingItem");
const toolsWebSearchItem = document.getElementById("toolsWebSearchItem");
let webSearchMode = false;

function closeToolsPopup() {
  toolsPopup.classList.add("hidden");
  toolsBtn.setAttribute("aria-expanded", "false");
}

toolsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = toolsPopup.classList.contains("hidden");
  toolsPopup.classList.toggle("hidden", !willOpen);
  toolsBtn.setAttribute("aria-expanded", String(willOpen));
});

document.addEventListener("click", (e) => {
  if (!toolsPopup.classList.contains("hidden") &&
      !toolsBtn.contains(e.target) &&
      !toolsPopup.contains(e.target)) {
    closeToolsPopup();
  }
});

function renderToolsPopupState() {
  toolsCampaignItem.classList.toggle("active", campaignMode);
  toolsCampaignItem.setAttribute("aria-pressed", String(campaignMode));

  toolsLandingItem.classList.toggle("hidden", !campaignMode);
  toolsLandingItem.classList.toggle("active", includeLandingPage);
  toolsLandingItem.setAttribute("aria-pressed", String(includeLandingPage));

  toolsWebSearchItem.classList.toggle("active", webSearchMode);
  toolsWebSearchItem.setAttribute("aria-pressed", String(webSearchMode));

  toolsBtn.classList.toggle("has-active", campaignMode || webSearchMode);
}

toolsAttachItem.addEventListener("click", () => {
  closeToolsPopup();
  fileInput.click();
});

toolsCampaignItem.addEventListener("click", () => {
  campaignMode = !campaignMode;
  if (!campaignMode) includeLandingPage = false;
  userInput.placeholder = campaignMode
    ? "Describe the campaign — audience, goal, offer…"
    : "Message ATM Assistant…";
  renderToolsPopupState();
});

toolsLandingItem.addEventListener("click", () => {
  if (!campaignMode) return;
  includeLandingPage = !includeLandingPage;
  renderToolsPopupState();
});

toolsWebSearchItem.addEventListener("click", () => {
  webSearchMode = !webSearchMode;
  renderToolsPopupState();
});

function resetCampaignMode() {
  campaignMode = false;
  includeLandingPage = false;
  userInput.placeholder = "Message ATM Assistant…";
  renderToolsPopupState();
}

const settingsOverlay = document.getElementById("settingsOverlay");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const toneSelect = document.getElementById("toneSelect");
const nigeriaToggle = document.getElementById("nigeriaToggle");
const customInstruction = document.getElementById("customInstruction");
const memoryList = document.getElementById("memoryList");
const memoryInput = document.getElementById("memoryInput");
const addMemoryBtn = document.getElementById("addMemoryBtn");
const clearMemoryBtn = document.getElementById("clearMemoryBtn");
const settingsTabs = document.querySelectorAll(".settings-tab");
const settingsPanels = document.querySelectorAll(".settings-panel");

settingsTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    settingsTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    settingsPanels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.panel !== target);
    });
  });
});

function resetSettingsTabs() {
  settingsTabs.forEach((t) => t.classList.remove("active"));
  settingsPanels.forEach((p) => p.classList.add("hidden"));
  const generalTab = document.querySelector('.settings-tab[data-tab="general"]');
  const generalPanel = document.querySelector('.settings-panel[data-panel="general"]');
  generalTab.classList.add("active");
  generalPanel.classList.remove("hidden");
}

function renderMemoryList() {
  memoryList.innerHTML = "";
  const memories = settings.memories || [];

  if (memories.length === 0) {
    const empty = document.createElement("div");
    empty.className = "memory-empty";
    empty.textContent = "Nothing remembered yet.";
    memoryList.appendChild(empty);
    return;
  }

  memories.forEach((mem) => {
    const row = document.createElement("div");
    row.className = "memory-item";

    const text = document.createElement("span");
    text.className = "memory-item-text";
    text.textContent = mem.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "memory-item-delete";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", "Forget this");
    deleteBtn.addEventListener("click", () => {
      settings.memories = settings.memories.filter((m) => m.id !== mem.id);
      saveUserData();
      renderMemoryList();
    });

    row.appendChild(text);
    row.appendChild(deleteBtn);
    memoryList.appendChild(row);
  });
}

addMemoryBtn.addEventListener("click", () => {
  const text = memoryInput.value.trim();
  if (!text) return;
  settings.memories = settings.memories || [];
  settings.memories.push({ id: Date.now().toString(), text, createdAt: new Date().toISOString() });
  memoryInput.value = "";
  saveUserData();
  renderMemoryList();
});

memoryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addMemoryBtn.click();
  }
});

clearMemoryBtn.addEventListener("click", () => {
  if (!confirm("Forget everything ATM Assistant remembers about you?")) return;
  settings.memories = [];
  saveUserData();
  renderMemoryList();
});

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
    customInstruction: "",
    brandProfile: {
      name: "",
      industry: "",
      audience: "",
      voice: "",
      avoidWords: "",
      sampleEmail: ""
    },
    projects: [],
    memories: []
  };
}

function emptyBrandProfile() {
  return { name: "", industry: "", audience: "", voice: "", avoidWords: "", sampleEmail: "" };
}

function getActiveProject() {
  if (!activeProjectId) return null;
  return (settings.projects || []).find((p) => p.id === activeProjectId) || null;
}

function getActiveBrandProfile() {
  const project = getActiveProject();
  return project ? project.brandProfile : settings.brandProfile;
}

function getActiveProjectName() {
  const project = getActiveProject();
  return project ? project.name : "General";
}

function sessionMatchesActiveProject(session) {
  return (session.projectId || null) === activeProjectId;
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
  togglePasswordBtn.querySelector(".eye-open").classList.toggle("hidden", isPassword);
  togglePasswordBtn.querySelector(".eye-closed").classList.toggle("hidden", !isPassword);
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
// Forgot password
// --------------------------------------------------------------
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

forgotPasswordBtn?.addEventListener("click", async () => {
  const email = authEmail.value.trim();

  if (!email) {
    authError.textContent = 'Enter your email above first, then tap "Forgot password?"';
    authError.classList.remove("hidden");
    authEmail.focus();
    return;
  }

  forgotPasswordBtn.disabled = true;
  forgotPasswordBtn.textContent = "Sending...";

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://assistant.toheebakanni.name.ng/reset-password.html"
  });

  forgotPasswordBtn.disabled = false;
  forgotPasswordBtn.textContent = "Forgot password?";

  if (error) {
    authError.textContent = friendlyAuthError(error.message);
    authError.classList.remove("hidden");
    authError.style.color = "#E0765A";
  } else {
    authError.textContent = "Check your email for a password reset link.";
    authError.classList.remove("hidden");
    authError.style.color = "#7DB88A";
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

logoutBtn.addEventListener("click", () => {
  closeAccountPopup();
  supabaseClient.auth.signOut();
});

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
  upgradeBtn.classList.remove("hidden");

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
  await checkSubscriptionStatus();
  activeProjectId = null;
  activeProjectLabel.textContent = "General";
  applySettingsToForm();
  activeId = null;
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
  activeProjectId = null;
  activeProjectLabel.textContent = "General";
  applySettingsToForm();
  renderMemoryList();
}

// --------------------------------------------------------------
// Upgrade to Pro
// --------------------------------------------------------------
upgradeBtn.addEventListener("click", () => {
  closeAccountPopup();
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

      // Flutterwave hosts the checkout — just send the user there.
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
    settings.projects = settings.projects || [];
    settings.brandProfile = settings.brandProfile || emptyBrandProfile();
    settings.memories = settings.memories || [];
  } catch (error) {
    console.error("Failed to load data:", error);
    sessions = [];
    settings = defaultSettings();
  }
}

// --------------------------------------------------------------
// Reflect Pro status in the UI — checks the subscriptions table
// (the one flutterwave-webhook.js writes to after a successful
// payment) and updates the sidebar button + upgrade modal to match.
// --------------------------------------------------------------
async function checkSubscriptionStatus() {
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const { data: sub, error } = await supabaseClient
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;

    const isActivePro =
      sub &&
      sub.plan === "pro" &&
      sub.status === "active" &&
      sub.current_period_end &&
      new Date(sub.current_period_end) > new Date();

    applyProStatusToUI(isActivePro);
  } catch (error) {
    console.error("Failed to check subscription status:", error);
    // Fail safe: treat as free rather than silently claiming Pro.
    applyProStatusToUI(false);
  }
}

function applyProStatusToUI(isActivePro) {
  if (isActivePro) {
    // Already Pro — no need to dangle the upgrade prompt in front of them.
    upgradeBtn.classList.add("hidden");

    // If they ever open the modal via another path, make sure it
    // reflects reality instead of showing Free as current and Pro
    // as purchasable again.
    const freeBtn = document.querySelector(".plan-card:not(.plan-card-pro) .plan-btn");
    const proCurrencyChoice = document.querySelector(".plan-card-pro .currency-choice");
    if (freeBtn) {
      freeBtn.textContent = "Included in Pro";
    }
    if (proCurrencyChoice) {
      proCurrencyChoice.innerHTML = '<button type="button" class="plan-btn plan-btn-current" disabled>Your current plan</button>';
    }
  } else if (!isGuest) {
    upgradeBtn.classList.remove("hidden");
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
  resetSettingsTabs();
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
  settings.tone = toneSelect.value;
  settings.emphasizeNigeria = nigeriaToggle.checked;
  settings.customInstruction = customInstruction.value.trim();

  const newBrandProfile = {
    name: brandName.value.trim(),
    industry: brandIndustry.value.trim(),
    audience: brandAudience.value.trim(),
    voice: brandVoice.value.trim(),
    avoidWords: brandAvoidWords.value.trim(),
    sampleEmail: brandSampleEmail.value.trim()
  };

  const project = getActiveProject();
  if (project) {
    project.brandProfile = newBrandProfile;
  } else {
    settings.brandProfile = newBrandProfile;
  }

  saveUserData();
  settingsOverlay.classList.add("hidden");
});

function applySettingsToForm() {
  toneSelect.value = settings.tone;
  nigeriaToggle.checked = settings.emphasizeNigeria;
  customInstruction.value = settings.customInstruction;

  const bp = getActiveBrandProfile() || emptyBrandProfile();
  brandProfileLabel.textContent = `Brand Profile — ${getActiveProjectName()}`;
  brandName.value = bp.name;
  brandIndustry.value = bp.industry;
  brandAudience.value = bp.audience;
  brandVoice.value = bp.voice;
  brandAvoidWords.value = bp.avoidWords;
  brandSampleEmail.value = bp.sampleEmail;
}

// --------------------------------------------------------------
// Sidebar toggle — works the same way on desktop and mobile now.
// Desktop: collapses the sidebar to width 0 (content stays mounted,
// just visually hidden) and shows a small floating re-open tab.
// Mobile: same off-canvas slide behaviour as before, plus a backdrop.
// --------------------------------------------------------------
// Two toggle buttons that are never visible at the same time by
// construction, not by manual bookkeeping:
//   - sidebarCloseBtn lives INSIDE the sidebar, so it vanishes the
//     instant the sidebar collapses/slides away.
//   - sidebarOpenBtn lives OUTSIDE, fixed in the corner, and JS shows
//     it only while the sidebar is closed.
// That's what fixes the "two buttons stacked" bug — there's no
// longer a state where both can render at once.
function isMobileViewport() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function openSidebar() {
  if (isMobileViewport()) {
    sidebar.classList.add("open");
    sidebarBackdrop.classList.remove("hidden");
  } else {
    sidebar.classList.remove("collapsed");
  }
  sidebarOpenBtn.classList.add("hidden");
}

function closeSidebar() {
  if (isMobileViewport()) {
    sidebar.classList.remove("open");
    sidebarBackdrop.classList.add("hidden");
  } else {
    sidebar.classList.add("collapsed");
  }
  sidebarOpenBtn.classList.remove("hidden");
}

function toggleSidebar() {
  const isCurrentlyOpen = isMobileViewport()
    ? sidebar.classList.contains("open")
    : !sidebar.classList.contains("collapsed");
  if (isCurrentlyOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

sidebarCloseBtn.addEventListener("click", closeSidebar);
sidebarOpenBtn.addEventListener("click", openSidebar);
sidebarBackdrop.addEventListener("click", closeSidebar);

// Initial state: mobile starts closed (sidebar off-canvas by default
// CSS, so show the open button); desktop starts open (sidebar has
// neither "open" nor "collapsed" yet, so hide the open button).
if (isMobileViewport()) {
  sidebarOpenBtn.classList.remove("hidden");
} else {
  sidebarOpenBtn.classList.add("hidden");
}

// If the viewport crosses the mobile/desktop breakpoint while the
// sidebar happens to be in the "off" state for the other mode, make
// sure it doesn't get stuck invisible with no way to reopen it.
window.addEventListener("resize", () => {
  if (isMobileViewport()) {
    sidebar.classList.remove("collapsed");
    if (!sidebar.classList.contains("open")) sidebarOpenBtn.classList.remove("hidden");
  } else {
    sidebar.classList.remove("open");
    sidebarBackdrop.classList.add("hidden");
    if (sidebar.classList.contains("collapsed")) sidebarOpenBtn.classList.remove("hidden");
    else sidebarOpenBtn.classList.add("hidden");
  }
});

// --------------------------------------------------------------
// New chat
// --------------------------------------------------------------
newChatBtn.addEventListener("click", () => {
  activeId = null;
  renderSidebar();
  renderActiveChat();
  userInput.focus();
  if (isMobileViewport()) closeSidebar();
});

// --------------------------------------------------------------
// File attachments (images and plain text files)
// --------------------------------------------------------------
let pendingAttachment = null; // { kind: "image"|"text", name, data }

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
  scrollChatToBottomIfNearBottom(true);
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
      messages: [],
      projectId: activeProjectId
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

  const mode = campaignMode ? "campaign" : undefined;
  const useWebSearch = webSearchMode;

  try {
    const result = await callGroqAPI(session.messages, mode, useWebSearch);

    if (mode === "campaign") {
      session.messages.push({
        role: "assistant",
        content: campaignToText(result.campaign),
        campaignData: result.campaign,
        warnings: result.warnings,
        kind: "campaign"
      });
      saveUserData();
      renderActiveChat();
        } else {
      session.messages.push({ role: "assistant", content: result.reply, sources: result.sources });

      if (result.memory) {
        settings.memories = settings.memories || [];
        settings.memories.push({ id: Date.now().toString(), text: result.memory, createdAt: new Date().toISOString() });
      }

      saveUserData();
      renderActiveChat({ typeLast: true });
    }
    
  } catch (error) {
    console.error(error);

    if (error.code === "GUEST_LIMIT") {
      session.messages.pop();
      renderActiveChat();
      openAuthModal();
    } else {
      session.messages.push({ role: "assistant", content: "⚠️ " + error.message });
      renderActiveChat();
    }
  } finally {
    setLoading(false);
    resetCampaignMode();
  }
}

// --------------------------------------------------------------
// API call
// --------------------------------------------------------------

  async function callGroqAPI(messages, mode, useWebSearch) {
  const authHeaders = await getAuthHeaders();

  const cleanMessages = messages.map((msg) => ({ role: msg.role, content: msg.content }));
  const settingsForRequest = { ...settings, brandProfile: getActiveBrandProfile() };

  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({
      messages: cleanMessages,
      settings: settingsForRequest,
      mode,
      includeLandingPage: mode === "campaign" ? includeLandingPage : undefined,
      webSearch: mode === "campaign" ? undefined : Boolean(useWebSearch)
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error || `Request failed with status ${response.status}`);
    if (data.code) err.code = data.code;
    throw err;
  }

  if (mode === "campaign") {
    if (!data.campaign) throw new Error("No campaign data returned from the API.");
    return { campaign: data.campaign, warnings: data.warnings || [] };
  }

    if (!data.reply) throw new Error("No text returned from the API.");
  return { reply: data.reply.trim(), sources: data.sources || [], memory: data.memory || null };
}

// --------------------------------------------------------------
// Rendering — sidebar
// --------------------------------------------------------------
function renderSidebar() {
  historyList.innerHTML = "";

  const projectSessions = sessions.filter(sessionMatchesActiveProject);

  const visibleSessions = historyFilter
    ? projectSessions.filter(s => (s.title || "New chat").toLowerCase().includes(historyFilter))
    : projectSessions;

  if (historyFilter && visibleSessions.length === 0) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "No chats found";
    historyList.appendChild(empty);
    return;
  }

  visibleSessions.forEach(session => {
    const item = document.createElement("div");
    item.className = "history-item" + (session.id === activeId ? " active" : "");

    // Click handler lives on `item` — the same element that carries the
    // :hover CSS rule — rather than on the inner label span. iOS Safari
    // requires a tap-to-click target to match its hover target, or the
    // first tap only "hovers" and a second tap is needed to actually
    // fire the click. This is what fixes "double tap to open a chat".
    item.addEventListener("click", () => {
      activeId = session.id;
      renderSidebar();
      renderActiveChat();
      if (isMobileViewport()) closeSidebar();
    });

    const label = document.createElement("span");
    label.className = "history-item-label";
    label.textContent = session.title || "New chat";

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

// How close to the bottom (in px) counts as "still at the bottom",
// so a forced scroll never fires while the user has scrolled up to
// read earlier messages — this is what fixes "can't scroll up while
// the AI is typing".
const SCROLL_NEAR_BOTTOM_PX = 80;

function isChatNearBottom() {
  return chatLog.scrollHeight - chatLog.scrollTop - chatLog.clientHeight < SCROLL_NEAR_BOTTOM_PX;
}

function scrollChatToBottomIfNearBottom(force = false) {
  if (force || isChatNearBottom()) {
    chatLog.scrollTop = chatLog.scrollHeight;
  }
}

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
    if (msg.kind === "campaign") {
      addCampaignCardToDOM(msg.campaignData, msg.warnings);
      return;
    }
    const role = msg.role === "user" ? "user" : "assistant";
    const isLast = index === session.messages.length - 1;
    const shouldType = Boolean(options.typeLast) && isLast && role === "assistant";
    addMessageToDOM(msg.content, role, shouldType, msg.sources);
  });

  // Always jump to bottom the first time a chat is opened / re-rendered
  // in full (switching sessions, sending a new message) — the "stay put
  // while typing" behaviour only applies to the token-by-token effect.
  chatLog.scrollTop = chatLog.scrollHeight;
}

function addMessageToDOM(content, kind, animate = false, sources = []) {
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

  if (kind === "assistant" && sources && sources.length > 0) {
    body.appendChild(buildSourcesRow(sources));
  }

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

    if ("speechSynthesis" in window) {
      const listenBtn = document.createElement("button");
      listenBtn.className = "action-btn";
      listenBtn.textContent = "Listen";
      listenBtn.addEventListener("click", () => toggleSpeak(textPart, listenBtn));
      actions.appendChild(listenBtn);
    }

    body.appendChild(actions);
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(body);
  chatLog.appendChild(wrapper);
}

// Small "Sources" row under a web-search-backed reply — expects
// sources as [{ title, url }], returned by the backend.
function buildSourcesRow(sources) {
  const row = document.createElement("div");
  row.className = "sources-row";

  const label = document.createElement("span");
  label.className = "sources-label";
  label.textContent = "Sources:";
  row.appendChild(label);

  sources.slice(0, 5).forEach((src) => {
    const link = document.createElement("a");
    link.className = "source-chip";
    link.href = src.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = src.title || new URL(src.url).hostname;
    row.appendChild(link);
  });

  return row;
}

function campaignToText(campaign) {
  const parts = [
    "Subject line options:",
    ...(campaign.subject_lines || []).map((s) => "- " + s),
    "",
    "Preheader: " + (campaign.preheader || ""),
    "",
    campaign.body || "",
    "",
    "CTA: " + (campaign.cta_text || "")
  ];

  if (campaign.landing_page) {
    const lp = campaign.landing_page;
    parts.push(
      "",
      "--- Landing page ---",
      "Headline: " + (lp.headline || ""),
      "Subheadline: " + (lp.subheadline || ""),
      "",
      ...(lp.sections || []),
      "",
      "Landing page CTA: " + (lp.landing_cta_text || "")
    );
  }

  return parts.join("\n");
}

function addCampaignCardToDOM(campaign, warnings) {
  const wrapper = document.createElement("div");
  wrapper.className = "message assistant";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "✉";

  const body = document.createElement("div");
  body.className = "message-body";

  const card = document.createElement("div");
  card.className = "campaign-card";

  const subjectSection = document.createElement("div");
  subjectSection.className = "campaign-section";
  const subjectLabel = document.createElement("div");
  subjectLabel.className = "campaign-label";
  subjectLabel.textContent = "Subject lines";
  subjectSection.appendChild(subjectLabel);

  const subjectList = document.createElement("ul");
  subjectList.className = "campaign-subject-list";
  (campaign.subject_lines || []).forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    subjectList.appendChild(li);
  });
  subjectSection.appendChild(subjectList);
  card.appendChild(subjectSection);

  card.appendChild(campaignField("Preheader", campaign.preheader));
  card.appendChild(campaignField("Body", campaign.body, true));
card.appendChild(campaignField("Call to action", campaign.cta_text));

  if (campaign.landing_page) {
    const lp = campaign.landing_page;
    const lpDivider = document.createElement("div");
    lpDivider.className = "campaign-lp-divider";
    lpDivider.textContent = "Landing page";
    card.appendChild(lpDivider);

    card.appendChild(campaignField("Headline", lp.headline));
    card.appendChild(campaignField("Subheadline", lp.subheadline));
    card.appendChild(campaignField("Page sections", (lp.sections || []).join("\n\n"), true));
    card.appendChild(campaignField("Landing page CTA", lp.landing_cta_text));
  }

  if (warnings && warnings.length > 0) {
    const warnSection = document.createElement("div");
    warnSection.className = "campaign-warnings";

    const warnLabel = document.createElement("div");
    warnLabel.className = "campaign-warnings-label";
    warnLabel.textContent = `⚠ ${warnings.length} deliverability flag${warnings.length > 1 ? "s" : ""}`;
    warnSection.appendChild(warnLabel);

    const warnList = document.createElement("ul");
    warnings.forEach((w) => {
      const li = document.createElement("li");
      li.textContent = w;
      warnList.appendChild(li);
    });
    warnSection.appendChild(warnList);
    card.appendChild(warnSection);
  } else {
    const okMsg = document.createElement("div");
    okMsg.className = "campaign-warnings-ok";
    okMsg.textContent = "✓ No deliverability flags";
    card.appendChild(okMsg);
  }

  const copyBtn = document.createElement("button");
  
  copyBtn.className = "campaign-copy-btn";
  copyBtn.textContent = "Copy full campaign";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(campaignToText(campaign));

    copyBtn.textContent = "Copied";
    setTimeout(() => { copyBtn.textContent = "Copy full campaign"; }, 1200);
  });
  card.appendChild(copyBtn);

  body.appendChild(card);
  wrapper.appendChild(avatar);
  wrapper.appendChild(body);
  chatLog.appendChild(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function campaignField(label, value, isBody = false) {
  const section = document.createElement("div");
  section.className = "campaign-section";
  const labelEl = document.createElement("div");
  labelEl.className = "campaign-label";
  labelEl.textContent = label;
  const valueEl = document.createElement("div");
  valueEl.className = isBody ? "campaign-body-text" : "campaign-value";
  if (isBody) {
    valueEl.innerHTML = renderMarkdown(value || "");
  } else {
    valueEl.textContent = value || "";
  }
  section.appendChild(labelEl);
  section.appendChild(valueEl);
  return section;
}

// --------------------------------------------------------------
// Typewriter effect — only auto-scrolls while the user is already
// at (or near) the bottom of the chat log, so scrolling up to read
// older messages while the AI is still "typing" is never fought.
// --------------------------------------------------------------
function typeWriterEffect(el, fullText, speedMs = 16) {
  const tokens = fullText.split(/(\s+)/);
  let i = 0;
  el.innerHTML = "";

  function step() {
    const wasNearBottom = isChatNearBottom();
    i++;
    el.innerHTML = renderMarkdown(tokens.slice(0, i).join(""));
    if (wasNearBottom) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
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
// A small, purpose-built markdown renderer — bold, headings, lists,
// tables, and paragraphs. Not a full markdown spec, just what the
// assistant actually tends to send back.
// --------------------------------------------------------------
function isTableSeparatorLine(line) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}

function splitTableCells(line) {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
  return trimmed.split("|").map(cell => cell.trim());
}

function renderMarkdown(text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // The model sometimes writes a literal "<br>" inside table cells to
  // force a line break — restore it now that stray < > elsewhere are
  // already safely escaped above.
  const withBreaks = escaped.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  const withBold = withBreaks.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const lines = withBold.split("\n");
  let html = "";
  let listType = null;

  function closeList() {
    if (listType) {
      html += listType === "ol" ? "</ol>" : "</ul>";
      listType = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table: a "| a | b |" row immediately followed by a "|---|---|" line
    if (line.trim().startsWith("|") && isTableSeparatorLine(lines[i + 1] || "")) {
      closeList();
      const headerCells = splitTableCells(line);
      html += "<table><thead><tr>";
      headerCells.forEach(cell => (html += `<th>${cell}</th>`));
      html += "</tr></thead><tbody>";

      i += 2; // skip header + separator
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const rowCells = splitTableCells(lines[i]);
        html += "<tr>";
        rowCells.forEach(cell => (html += `<td>${cell}</td>`));
        html += "</tr>";
        i++;
      }
      html += "</tbody></table>";
      i--; // outer loop will i++ again
      continue;
    }

    const headingMatch = line.match(/^\s*(#{1,4})\s+(.*)/);
    const numberedMatch = line.match(/^\s*\d+[\.\)]\s+(.*)/);
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)/);

    if (headingMatch) {
      closeList();
      const level = Math.min(headingMatch[1].length + 2, 4); // ### -> h4, allowing up to h4
      html += `<h${level}>${headingMatch[2]}</h${level}>`;
    } else if (numberedMatch) {
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
  }
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
renderToolsPopupState();
