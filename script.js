// --------------------------------------------------------------
// Icon set — clean stroke SVGs (feather-icon style), replacing
// emoji everywhere in the UI. Each is a bare <svg> string; callers
// set width/height via the .icon-svg CSS class.
// --------------------------------------------------------------
const ICONS = {
  settings: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  info: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  helpCircle: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  logOut: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  star: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  heart: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  moreHorizontal: `<svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="12" r="1.6"/></svg>`,
  moreVertical: `<svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>`,
  x: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  mail: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>`,
  fileText: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  loader: `<svg class="icon-svg icon-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  alertTriangle: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  checkCircle: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  link: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  tag: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1"/></svg>`,
  cpu: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  activity: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  send: `<svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`
};

// ============================================================
// Beeto — Stage 4 (guest mode + accounts) + hands-free voice mode
//
// Chat is visible immediately, even before logging in. Guests get
// 1 free message per day (tracked by IP, on the server). Once
// that's used, the login/signup modal opens automatically. Logged
// in, chats/settings sync to Supabase as before.
// ============================================================

const CHAT_API_URL = "/api/chat";
const TTS_API_URL = "/api/tts";
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

const supportSidebarBtn = document.getElementById("supportSidebarBtn");
const supportFooterLink = document.getElementById("supportFooterLink");
const supportOverlay = document.getElementById("supportOverlay");
const closeSupportBtn = document.getElementById("closeSupportBtn");
const supportCurrency = document.getElementById("supportCurrency");
const supportAmount = document.getElementById("supportAmount");
const supportSubmitBtn = document.getElementById("supportSubmitBtn");
const supportError = document.getElementById("supportError");
const userEmail = document.getElementById("userEmail");
const userAvatarImg = document.getElementById("userAvatarImg");
const userAvatarInitial = document.getElementById("userAvatarInitial");

const brandName = document.getElementById("brandName");
const brandIndustry = document.getElementById("brandIndustry");
const brandAudience = document.getElementById("brandAudience");
const brandVoice = document.getElementById("brandVoice");
const brandAvoidWords = document.getElementById("brandAvoidWords");
const brandSampleEmail = document.getElementById("brandSampleEmail");

const popupSettingsBtn = document.getElementById("popupSettingsBtn");
const guestTrigger = document.getElementById("guestTrigger");
const guestPopup = document.getElementById("guestPopup");
const guestSettingsBtn = document.getElementById("guestSettingsBtn");

const projectSwitcherBtn = document.getElementById("projectSwitcherBtn");
const projectSwitcherPopup = document.getElementById("projectSwitcherPopup");
const activeProjectLabel = document.getElementById("activeProjectLabel");
const projectListContainer = document.getElementById("projectListContainer");
const newProjectBtn = document.getElementById("newProjectBtn");
const brandProfileLabel = document.getElementById("brandProfileLabel");
let activeProjectId = null; // null = "General" — the default/legacy bucket

const authOverlay = document.getElementById("authOverlay");
const closeAuthBtn = document.getElementById("closeAuthBtn");
const voiceSelect = document.getElementById("voiceSelect");

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
let includeRepurpose = false;
let sequenceMode = false;
let sequenceLength = 3; // 3-5, adjustable via the tools popup stepper

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
  recognition.lang = "en-GB";

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
// Voice output — reads text aloud. speakText() is the shared core
// (used both by the per-message "Listen" button and by voice-mode
// auto-playback below); toggleSpeak() wraps it for the button's
// on/off label behaviour.
//
// Tries Beeto's ElevenLabs voice first via /api/tts (logged-in
// users only, because ElevenLabs bills per character). Guests, and
// anyone whose request fails for any reason, fall back to the
// browser's free built-in SpeechSynthesis instead of going silent.
// --------------------------------------------------------------
let currentTtsAudio = null; // the ElevenLabs <audio> currently playing, if any

// A single, reused <audio> element for all ElevenLabs playback.
// Safari/iOS only lets an <audio> element play from async code if
// that SAME element was already played inside a real tap handler,
// so a fresh `new Audio()` each time gets silently blocked.
let ttsAudioEl = null;

function ensureTtsAudioElement() {
  if (!ttsAudioEl) {
    ttsAudioEl = new Audio();
    ttsAudioEl.setAttribute("playsinline", ""); // avoids iOS trying to full-screen it
  }
  return ttsAudioEl;
}

// Because the <audio> element is reused, handlers from a previous
// playback would otherwise still be attached and could fire for the
// NEXT clip (including the silent "unlock" clip below).
function resetTtsHandlers(el) {
  if (!el) return;
  el.onended = null;
  el.onerror = null;
}

// Call synchronously, inside a real tap handler, before any `await` —
// this is what actually "unlocks" ttsAudioEl for Safari.
function primeTtsAudioElement() {
  try {
    const el = ensureTtsAudioElement();
    resetTtsHandlers(el);
    el.src = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    el.play().catch(() => {});
  } catch (error) {}
}

// Phones almost always have the speaker close to the mic and no
// headphone detection in browsers, so barge-in (listening WHILE
// Beeto talks) is only enabled off iOS. On iOS, listening resumes
// as soon as Beeto finishes speaking instead.
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isMobileDevice = isIOS || /Android/i.test(navigator.userAgent);
const bargeInEnabled = !isMobileDevice; // on phones the mic and speaker fight over the audio session

// The plain text Beeto is currently speaking aloud, if any — used to
// tell a genuine interruption apart from the mic just picking up
// Beeto's own voice through the speaker. See looksLikeEcho() below.
let currentlySpokenText = null;

function looksLikeEcho(transcript) {
  const heard = transcript.trim().toLowerCase();
  if (!currentlySpokenText) return false;
  // Word-by-word overlap rather than an exact substring check, since
  // recognized speech rarely lines up exactly with the source text.
  const spoken = currentlySpokenText.toLowerCase();
  const heardWords = heard.split(/\s+/).filter(w => w.length > 1);
  if (heardWords.length === 0) return true; // nothing substantial to judge — treat as inconclusive
  const matchedWords = heardWords.filter(w => spoken.includes(w));
  return matchedWords.length / heardWords.length > 0.5;
}

// Bumped every time speech is stopped or restarted, so a browser-voice
// queue that is still running knows it was cancelled and stops itself.
let speechToken = 0;

// If the ElevenLabs endpoint fails (out of credits, bad key, outage),
// stop asking it for a few minutes and use the free browser voice
// straight away instead of waiting on a request that will fail again.
let ttsServerDisabledUntil = 0;
const TTS_RETRY_AFTER_MS = 5 * 60 * 1000;

function stopAllSpeech() {
  speechToken++;
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (currentTtsAudio) {
    resetTtsHandlers(currentTtsAudio);
    currentTtsAudio.pause();
    currentTtsAudio.currentTime = 0;
    currentTtsAudio = null;
  }
  currentlySpokenText = null;
}

// Turns a markdown-ish reply into something that sounds natural when
// read aloud: no code blocks, URLs, bullets, pipes, or emoji.
function cleanForSpeech(text) {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/[*_#`>|~]/g, " ")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function speakText(text, onDone) {
  stopAllSpeech();
  const plainText = cleanForSpeech(text);
  if (!plainText) {
    if (onDone) onDone();
    return;
  }
  currentlySpokenText = plainText;

  // Guests would just get a 401 from /api/tts, so skip the round trip
  // and go straight to the free browser voice.
  if (!isGuest && Date.now() >= ttsServerDisabledUntil) {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch(TTS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ text: plainText })
      });

      if (!response.ok) {
        ttsServerDisabledUntil = Date.now() + TTS_RETRY_AFTER_MS;
        throw new Error("TTS request failed: " + response.status);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = ensureTtsAudioElement(); // reuse the primed element
      resetTtsHandlers(audio);
      audio.src = url;
      currentTtsAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (currentTtsAudio === audio) currentTtsAudio = null;
        currentlySpokenText = null;
        if (onDone) onDone();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        if (currentTtsAudio === audio) currentTtsAudio = null;
        speakWithBrowserVoice(plainText, onDone);
      };

      await audio.play();
      return;
    } catch (error) {
      console.error("Beeto voice — ElevenLabs TTS unavailable, falling back to browser voice:", error);
    }
  }

  speakWithBrowserVoice(plainText, onDone);
}

// Voices that exist on some devices but sound like novelties.
const NOVELTY_VOICE_NAMES = new Set([
  "albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos",
  "good news", "jester", "organ", "superstar", "trinoids", "whisper",
  "wobble", "zarvox", "fred", "junior", "kathy", "ralph"
]);

// Picks the most natural-sounding English voice this device offers.
function pickBestBrowserVoice(voices) {
  const english = voices.filter((v) =>
    v.lang && v.lang.toLowerCase().startsWith("en") &&
    !NOVELTY_VOICE_NAMES.has(v.name.toLowerCase())
  );
  const rank = (v) => {
    const name = v.name.toLowerCase();
    if (name.includes("natural")) return 0;   // Edge online neural voices
    if (name.includes("premium")) return 1;   // iOS / macOS
    if (name.includes("enhanced")) return 2;  // iOS / macOS
    if (name.includes("google")) return 3;    // Chrome
    if (name.includes("siri")) return 3;
    return 4;
  };
  return english.slice().sort((a, b) => rank(a) - rank(b))[0] || null;
}

// Splits text into short, sentence-sized pieces. Chrome's built-in
// voices silently stop speaking after roughly 15 seconds on a single
// long utterance, so long replies are spoken piece by piece instead.
function splitIntoSpeechChunks(text, maxLen = 180) {
  const sentences = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [text];
  const chunks = [];
  let current = "";

  const pushLongSafe = (piece) => {
    // A single sentence that is still too long gets split on spaces.
    let remaining = piece.trim();
    while (remaining.length > maxLen * 1.5) {
      let cut = remaining.lastIndexOf(" ", maxLen);
      if (cut < maxLen * 0.5) cut = maxLen;
      chunks.push(remaining.slice(0, cut).trim());
      remaining = remaining.slice(cut).trim();
    }
    if (remaining) chunks.push(remaining);
  };

  for (const sentence of sentences) {
    if (current && (current + sentence).length > maxLen) {
      pushLongSafe(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) pushLongSafe(current);

  return chunks.length > 0 ? chunks : [text];
}

function speakWithBrowserVoice(plainText, onDone) {
  if (!("speechSynthesis" in window)) {
    currentlySpokenText = null;
    if (onDone) onDone();
    return;
  }

  currentlySpokenText = plainText; // re-set in case this was reached via the ElevenLabs error fallback
  const myToken = ++speechToken;

  // A voice picked in Settings always wins. On desktop, otherwise use the
  // best one available. On phones, the device's own default is the safest
  // choice (some listed phone voices are silent or need a download).
  const allVoices = speechSynthesis.getVoices();
  let voice =
    allVoices.find((v) => v.voiceURI === settings.voiceURI) ||
    (isMobileDevice ? null : pickBestBrowserVoice(allVoices));

  try { speechSynthesis.resume(); } catch (error) {} // clears a stuck "paused" state after cancel()

  const chunks = splitIntoSpeechChunks(plainText);
  let index = 0;

  function speakNext() {
    if (myToken !== speechToken) return; // cancelled or replaced by newer speech

    if (index >= chunks.length) {
      currentlySpokenText = null;
      if (onDone) onDone();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index++]);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.onend = speakNext;
    utterance.onerror = (event) => {
      if (myToken !== speechToken) return;
      if (event.error === "canceled" || event.error === "interrupted") return;
      if (voice) {
        voice = null; // that voice failed, retry this same piece with the default voice
        index--;
      }
      speakNext();
    };

    speechSynthesis.speak(utterance);
  }

  speakNext();
}

function toggleSpeak(text, btn) {
  const wasThisOneSpeaking = btn.textContent === "Stop";
  stopAllSpeech();
  document.querySelectorAll(".message-actions .action-btn").forEach((b) => {
    if (b.textContent === "Stop") b.textContent = "Listen";
  });

  if (wasThisOneSpeaking) return; // this button's own click was the "stop" tap

  primeTtsAudioElement(); // synchronous, right inside this tap — required for Safari
  btn.textContent = "Stop";
  speakText(text, () => { btn.textContent = "Listen"; });
}


function populateVoiceOptions() {
  if (!("speechSynthesis" in window) || !voiceSelect) return;
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return; // retries via voiceschanged below

  const currentValue = voiceSelect.value;
  voiceSelect.innerHTML = '<option value="">Auto (best available)</option>';
  voices
    .filter(v => v.lang.startsWith("en"))
    .forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.voiceURI;
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });
  voiceSelect.value = currentValue;
}

if ("speechSynthesis" in window) {
  populateVoiceOptions();
  speechSynthesis.addEventListener("voiceschanged", populateVoiceOptions);
}

// --------------------------------------------------------------
// Voice mode — tap once to start a hands-free conversation.
//
// Tap the button once, speak, it sends automatically, the reply is
// read back, and it automatically starts listening again. Only the
// first tap (and the final tap to end the session) are manual. It
// relies only on ordinary single-utterance recognition, looped.
// (A true "Hey Beeto" wake word isn't reliable with the browser's
// built-in recognition; that would need a native app or an
// on-device keyword engine like Picovoice Porcupine.)
//
// Voice mode never persists across reloads or turns on by itself —
// silently re-enabling a live microphone on page load would be a
// bad surprise.
// --------------------------------------------------------------
let voiceModeEnabled = false; // "voice session" active — tap-to-start/stop, not a wake word

let commandProducedResult = false; // tracks whether the current listening pass actually heard something
let commandRecognitionActive = false; // so barge-in and the normal resume flow never both call .start() at once
let lastListenStartedByTap = false; // phones often refuse to restart the mic without a real tap
let lastHeardTranscript = ""; // last words the recognizer heard in this listening pass
let startCommandListening = () => {}; // reassigned below once commandRecognition exists
let commandRecognition = null;
let wakeToggleBtn = null;
let voiceOrbEl = null;
let voiceOrbCircle = null;
let voiceStatusLabelEl = null;

// Real-time mic level metering for the audio-reactive orb, separate
// from commandRecognition (SpeechRecognition never exposes volume).
// Skipped on iOS, where a second live mic stream alongside speech
// recognition commonly breaks recognition or mutes playback.
let micStream = null;
let micAudioContext = null;
let micAnalyser = null;
let micLevelRAF = null;

if (SpeechRecognitionCtor) {
  const voiceStyleTag = document.createElement("style");
  voiceStyleTag.textContent = `
    .voice-orb-wrap {
      position: fixed;
      bottom: 92px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      z-index: 500;
      pointer-events: none;
    }
    .voice-orb-wrap.hidden { display: none; }
    .voice-orb {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #cfeed9, #7DB88A 55%, #4c7a58 100%);
      box-shadow: 0 0 20px 5px rgba(125,184,138,0.5);
      transform: scale(var(--orb-scale, 1));
      transition: transform 70ms linear, background 300ms ease, box-shadow 300ms ease;
    }
    .voice-orb-wrap[data-state="thinking"] .voice-orb {
      background: conic-gradient(from 0deg, #C9962E, #E0765A, #7DB88A, #C9962E);
      animation: voiceOrbSpin 1.1s linear infinite;
      box-shadow: 0 0 20px 5px rgba(200,200,200,0.35);
    }
    .voice-orb-wrap[data-state="speaking"] .voice-orb {
      background: radial-gradient(circle at 35% 30%, #f6c6b4, #E0765A 55%, #a5432c 100%);
      animation: voiceOrbPulse 0.55s ease-in-out infinite;
      box-shadow: 0 0 22px 6px rgba(224,118,90,0.5);
    }
    @keyframes voiceOrbSpin { to { transform: rotate(360deg) scale(var(--orb-scale, 1)); } }
    @keyframes voiceOrbPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.18); }
    }
    .voice-status-label {
      background: rgba(17,17,17,0.85);
      color: #F5F1E8;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 12px;
      white-space: nowrap;
    }
    .voice-orb-wrap[data-state="paused"] { pointer-events: auto; cursor: pointer; }
    .voice-orb-wrap[data-state="paused"] .voice-orb {
      background: radial-gradient(circle at 35% 30%, #e6e6e6, #9aa0ab 55%, #5c6270 100%);
      box-shadow: 0 0 16px 4px rgba(150,150,150,0.4);
    }
    #wakeToggleBtn.active { color: #C9962E; }
  `;
  document.head.appendChild(voiceStyleTag);

  voiceOrbEl = document.createElement("div");
  voiceOrbEl.className = "voice-orb-wrap hidden";
  voiceOrbEl.innerHTML = `<div class="voice-orb"></div><div class="voice-status-label"></div>`;
  document.body.appendChild(voiceOrbEl);
  voiceOrbCircle = voiceOrbEl.querySelector(".voice-orb");
  voiceStatusLabelEl = voiceOrbEl.querySelector(".voice-status-label");

  wakeToggleBtn = document.createElement("button");
  wakeToggleBtn.type = "button";
  wakeToggleBtn.id = "wakeToggleBtn";
  wakeToggleBtn.className = "action-btn";
  wakeToggleBtn.innerHTML = ICONS.activity;
  wakeToggleBtn.setAttribute("aria-pressed", "false");
  wakeToggleBtn.setAttribute("aria-label", "Start a hands-free voice conversation");
  wakeToggleBtn.title = "Tap to start a hands-free voice conversation";
  micBtn.insertAdjacentElement("afterend", wakeToggleBtn);

  commandRecognition = new SpeechRecognitionCtor();
  commandRecognition.continuous = false;
  commandRecognition.interimResults = true; // needed for barge-in: react the instant speech starts
  commandRecognition.lang = "en-GB";

  // Centralizes starting commandRecognition so barge-in and the normal
  // "resume listening" calls never both try to start it at once —
  // Safari/Chrome both throw if .start() is called while running.
  startCommandListening = function (fromTap = false) {
    if (commandRecognitionActive) return;
    lastListenStartedByTap = fromTap;
    lastHeardTranscript = "";
    try {
      commandRecognition.start();
      commandRecognitionActive = true;
    } catch (error) {
      if (error && error.name === "InvalidStateError") {
        commandRecognitionActive = true; // already running, which is what we wanted
        return;
      }
      console.error("Beeto voice mode — could not start listening:", error);
      if (voiceModeEnabled && !fromTap) setVoiceStatus("paused"); // ask for a tap instead of dying
    }
  };

  // Sends what was heard as a normal chat message.
  function submitVoiceTranscript(text) {
    const clean = String(text || "").trim();
    lastHeardTranscript = "";
    if (!clean) return;
    if (isSending) return; // a reply is already in flight; onend will just listen again
    commandProducedResult = true;
    userInput.value = clean;
    autoGrow();
    chatForm.requestSubmit(); // auto-send — this is the "no tapping" part
  }

  commandRecognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript;

    // "Beeto is talking" only counts when Beeto's own reply is playing,
    // not a leftover flag from the silent unlock utterance.
    const isBeetoTalking =
      currentTtsAudio ||
      (currentlySpokenText && "speechSynthesis" in window && speechSynthesis.speaking);

    // Barge-in (desktop only): if real speech is detected while Beeto is
    // talking, cut it off right away. Without headphones the mic can hear
    // Beeto's own voice, so first check whether what was heard matches
    // what's currently being spoken (looksLikeEcho).
    if (bargeInEnabled && isBeetoTalking) {
      const wordsHeardSoFar = transcript.trim().split(/\s+/).filter(Boolean).length;
      if (wordsHeardSoFar < 2) {
        return; // one short fragment is what the start of an echo looks like; wait for more
      }
      if (looksLikeEcho(transcript)) {
        return;
      }
      stopAllSpeech();
      setVoiceStatus("listening");
    }

    // Remember the latest words, and show them live so it's obvious the
    // phone is actually hearing you.
    if (transcript.trim()) {
      lastHeardTranscript = transcript;
      if (voiceOrbEl?.dataset.state === "listening" && voiceStatusLabelEl) {
        voiceStatusLabelEl.textContent = "\u201C" + transcript.trim().slice(-48) + "\u201D";
      }
    }

    if (!result.isFinal) return; // wait for the complete utterance before sending
    submitVoiceTranscript(transcript);
  };

  commandRecognition.onerror = (event) => {
    console.error("Beeto voice mode — recognition error:", event.error);
    commandRecognitionActive = false;
    if (voiceModeEnabled && voiceStatusLabelEl && event.error !== "no-speech" && event.error !== "aborted") {
      voiceStatusLabelEl.textContent = "Mic issue: " + event.error; // phones have no console, so show it
    }
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      if (voiceModeEnabled && !lastListenStartedByTap) {
        // The mic worked at first but the phone refused an automatic
        // restart. Not a permission problem: just ask for a tap.
        setVoiceStatus("paused");
        return;
      }
      voiceModeEnabled = false;
      updateVoiceModeUI();
      setVoiceStatus("idle");
      stopMicLevelMeter();
      alert("Voice input was blocked. Allow the microphone for this site (iPhone: Settings > Safari > Microphone), and on iPhone also turn on Settings > General > Keyboard > Enable Dictation and Settings > Siri & Search > Siri. On Android, allow the microphone in Chrome's site settings.");
    } else if (event.error === "audio-capture") {
      voiceModeEnabled = false;
      updateVoiceModeUI();
      setVoiceStatus("idle");
      stopMicLevelMeter();
      alert("No microphone was found on this device.");
    }
    // "no-speech" / "aborted" are recoverable — onend's retry handles those.
  };

  commandRecognition.onend = () => {
    commandRecognitionActive = false;

    if (commandProducedResult) {
      // A result came in and already triggered chatForm.requestSubmit();
      // handleSend now owns the flow (thinking → speaking → relisten).
      commandProducedResult = false;
      return;
    }

    // Some phones end the session without ever marking the result as
    // final. If words were heard, send them anyway.
    if (voiceModeEnabled && lastHeardTranscript.trim()) {
      submitVoiceTranscript(lastHeardTranscript);
      if (commandProducedResult) {
        commandProducedResult = false;
        return;
      }
    }

    // Ended with nothing heard — if the session is still on, listen
    // again instead of going idle and forcing another tap. While Beeto
    // is speaking on iOS (no barge-in), wait for speech to finish
    // instead; the speech-finished callback restarts listening.
    if (voiceModeEnabled) {
      if (voiceOrbEl?.dataset.state === "paused") return; // waiting for a tap, don't loop
      if (isIOS) {
        setVoiceStatus("paused"); // iPhone can't restart the mic without a tap
        return;
      }
      const beetoIsSpeaking =
        currentTtsAudio ||
        (currentlySpokenText && "speechSynthesis" in window && speechSynthesis.speaking);
      if (!bargeInEnabled && beetoIsSpeaking) return;
      // Small pause so a "heard nothing" ending doesn't restart in a tight loop.
      setTimeout(() => {
        if (voiceModeEnabled && !commandRecognitionActive && voiceOrbEl?.dataset.state !== "paused") {
          startCommandListening();
        }
      }, 300);
    } else {
      setVoiceStatus("idle");
    }
  };

  // --------------------------------------------------------------
  // Audio unlock — iOS Safari (and some Android browsers) only allow
  // starting audio playback from directly within a user-gesture
  // handler. speakText() fires later, after a network round trip, so
  // the shared <audio> element and speech synthesis are primed here,
  // inside the tap that turns voice mode on.
  // --------------------------------------------------------------
  function unlockAudioPlayback() {
    try {
      if ("speechSynthesis" in window) {
        const warm = new SpeechSynthesisUtterance("ok"); // real text: a blank one may not unlock iOS
        warm.volume = 0;
        speechSynthesis.speak(warm);
      }
    } catch (error) {}

    primeTtsAudioElement();
  }

  // If the phone refuses to restart the mic on its own, the orb turns grey
  // and says "Tap to talk". Tapping it is a real gesture, so it always works.
  voiceOrbEl.addEventListener("click", () => {
    if (!voiceModeEnabled || voiceOrbEl.dataset.state !== "paused") return;
    primeTtsAudioElement();
    setVoiceStatus("listening");
    commandProducedResult = false;
    startCommandListening(true);
  });

  wakeToggleBtn.addEventListener("click", () => {
    voiceModeEnabled = !voiceModeEnabled;
    updateVoiceModeUI();

    if (voiceModeEnabled) {
      unlockAudioPlayback(); // must happen synchronously, right inside this tap
      startMicLevelMeter();
      commandProducedResult = false;
      lastHeardTranscript = "";

      if (isIOS) {
        // iPhone Safari only lets the mic start from a real tap, and it
        // also can't listen and speak at the same moment. So on iPhone
        // each turn is: tap the orb, speak, hear the reply.
        setVoiceStatus("paused");
        return;
      }

      setVoiceStatus("listening");
      lastListenStartedByTap = true;
      try {
        commandRecognition.start();
        commandRecognitionActive = true;
      } catch (error) {
        if (error && error.name === "InvalidStateError") {
          // The recognizer is already running (for example it was restarted a
          // moment ago). That is fine, nothing to do.
          commandRecognitionActive = true;
          return;
        }
        console.error("Beeto voice mode — could not start listening:", error);
        voiceModeEnabled = false;
        updateVoiceModeUI();
        setVoiceStatus("idle");
        stopMicLevelMeter();
        alert("Couldn't start voice mode: " + error.message);
      }
    } else {
      setVoiceStatus("idle");
      try { commandRecognition.abort(); } catch (error) {} // abort() ends it immediately, stop() can linger
      commandRecognitionActive = false;
      stopAllSpeech();
      commandProducedResult = false;
      stopMicLevelMeter();
    }
  });
}

// Goes back to listening after a reply. On iPhone the mic can only be
// started by a tap, so it waits for one instead.
function resumeVoiceListening() {
  if (!voiceModeEnabled) return;
  if (isIOS) {
    setVoiceStatus("paused");
    return;
  }
  setVoiceStatus("listening");
  commandProducedResult = false;
  startCommandListening();
}

function updateVoiceModeUI() {
  if (!wakeToggleBtn) return;
  wakeToggleBtn.classList.toggle("active", voiceModeEnabled);
  wakeToggleBtn.setAttribute("aria-pressed", String(voiceModeEnabled));
  wakeToggleBtn.title = voiceModeEnabled
    ? "Voice mode on — tap to end the conversation"
    : "Tap to start a hands-free voice conversation";
  micBtn.disabled = voiceModeEnabled; // voice mode already owns the mic
}

function setVoiceStatus(state) {
  if (!voiceOrbEl) return;
  if (state === "idle") {
    voiceOrbEl.classList.add("hidden");
    return;
  }
  voiceOrbEl.classList.remove("hidden");
  voiceOrbEl.dataset.state = state;
  const labels = {
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Speaking…",
    paused: "Tap to talk"
  };
  if (voiceStatusLabelEl) voiceStatusLabelEl.textContent = labels[state] || "";
}

// --------------------------------------------------------------
// Audio-reactive orb sizing — the orb grows and shrinks with how
// loud you're talking while in the "listening" state. During
// "thinking"/"speaking" the CSS animations take over instead.
// Skipped entirely on iOS (see the note near the top of voice mode).
// --------------------------------------------------------------
async function startMicLevelMeter() {
  if (isMobileDevice) return; // phones only let one thing use the mic at a time
  if (micStream) return; // already running

  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true }
    });
    micAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = micAudioContext.createMediaStreamSource(micStream);
    micAnalyser = micAudioContext.createAnalyser();
    micAnalyser.fftSize = 256;
    source.connect(micAnalyser);

    const data = new Uint8Array(micAnalyser.frequencyBinCount);

    const tick = () => {
      if (!micAnalyser) return; // stopped
      micAnalyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, v) => sum + v, 0) / data.length;

      const state = voiceOrbEl?.dataset.state;
      if (state === "listening") {
        const scale = 1 + Math.min(avg / 90, 1) * 0.5;
        voiceOrbCircle.style.setProperty("--orb-scale", scale.toFixed(2));
      } else {
        voiceOrbCircle.style.setProperty("--orb-scale", "1");
      }
      micLevelRAF = requestAnimationFrame(tick);
    };
    tick();
  } catch (error) {
    // Non-fatal: voice mode still works through SpeechRecognition,
    // the orb just won't react to volume.
    console.error("Beeto voice mode — mic level meter unavailable:", error);
  }
}

function stopMicLevelMeter() {
  if (micLevelRAF) cancelAnimationFrame(micLevelRAF);
  micLevelRAF = null;
  if (micStream) {
    micStream.getTracks().forEach((t) => t.stop());
    micStream = null;
  }
  if (micAudioContext) {
    micAudioContext.close().catch(() => {});
    micAudioContext = null;
  }
  micAnalyser = null;
  if (voiceOrbCircle) voiceOrbCircle.style.setProperty("--orb-scale", "1");
}


const sidebar = document.getElementById("sidebar");
const sidebarOpenBtn = document.getElementById("sidebarOpenBtn");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");

const accountTrigger = document.getElementById("accountTrigger");
const accountPopup = document.getElementById("accountPopup");

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
  generalItem.textContent = "Project";
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
    deleteBtn.innerHTML = ICONS.x;
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
  persistActiveState();
  closeProjectSwitcher();
  renderSidebar();
  renderActiveChat();
}

newProjectBtn.addEventListener("click", () => {
  if (!isActivePro) {
    closeProjectSwitcher();
    upgradeOverlay.classList.remove("hidden");
    return;
  }

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

  if (!confirm(`Delete "${project.name}"? Its chats move to Project, they won't be deleted.`)) return;

  settings.projects = settings.projects.filter((p) => p.id !== projectId);
  sessions.forEach((s) => {
    if (s.projectId === projectId) s.projectId = null;
  });

  if (activeProjectId === projectId) {
    activeProjectId = null;
    activeProjectLabel.textContent = "Project";
    activeId = null;
    persistActiveState();
  }

  saveUserData();
  renderProjectSwitcher();
  renderSidebar();
  renderActiveChat();
}

// --------------------------------------------------------------
// Tools popup — a single "+" button that opens a labeled menu.
// --------------------------------------------------------------
const toolsBtn = document.getElementById("toolsBtn");
const toolsPopup = document.getElementById("toolsPopup");
const toolsAttachItem = document.getElementById("toolsAttachItem");
const toolsCampaignItem = document.getElementById("toolsCampaignItem");
const toolsLandingItem = document.getElementById("toolsLandingItem");
const toolsRepurposeItem = document.getElementById("toolsRepurposeItem");
const toolsSequenceItem = document.getElementById("toolsSequenceItem");
const toolsSequenceLengthRow = document.getElementById("toolsSequenceLengthRow");
const toolsWebSearchItem = document.getElementById("toolsWebSearchItem");
const toolsPrivateItem = document.getElementById("toolsPrivateItem");
const privateModeBanner = document.getElementById("privateModeBanner");
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

  toolsRepurposeItem.classList.toggle("hidden", !campaignMode);
  toolsRepurposeItem.classList.toggle("active", includeRepurpose);
  toolsRepurposeItem.setAttribute("aria-pressed", String(includeRepurpose));

  toolsSequenceItem.classList.toggle("active", sequenceMode);
  toolsSequenceItem.setAttribute("aria-pressed", String(sequenceMode));

  toolsSequenceLengthRow.classList.toggle("hidden", !sequenceMode);
  toolsSequenceLengthRow.querySelectorAll(".sequence-length-btn").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.length) === sequenceLength);
  });

  toolsWebSearchItem.classList.toggle("active", webSearchMode);
  toolsWebSearchItem.setAttribute("aria-pressed", String(webSearchMode));

  toolsPrivateItem.classList.toggle("hidden", isGuest);
  toolsPrivateItem.classList.toggle("active", isPrivateMode);
  toolsPrivateItem.setAttribute("aria-pressed", String(isPrivateMode));

  toolsBtn.classList.toggle("has-active", campaignMode || sequenceMode || webSearchMode || isPrivateMode);

  // Free plan: lock the heavier campaign add-ons and sequence mode,
  // and show a "PRO" badge on them instead of just hiding them.
  const lockedForFree = !isActivePro;
  [toolsSequenceItem, toolsLandingItem, toolsRepurposeItem].forEach((item) => {
    item.classList.toggle("locked", lockedForFree);
  });
}

toolsAttachItem.addEventListener("click", () => {
  closeToolsPopup();
  fileInput.click();
});

toolsCampaignItem.addEventListener("click", () => {
  campaignMode = !campaignMode;
  if (!campaignMode) {
    includeLandingPage = false;
    includeRepurpose = false;
  } else {
    // Campaign and sequence are mutually exclusive.
    sequenceMode = false;
  }
  userInput.placeholder = campaignMode
    ? "Describe the campaign, audience, goal, offer…"
    : "Message Beeto…";
  renderToolsPopupState();
});

toolsLandingItem.addEventListener("click", () => {
  if (!campaignMode) return;
  if (!isActivePro) {
    closeToolsPopup();
    upgradeOverlay.classList.remove("hidden");
    return;
  }
  includeLandingPage = !includeLandingPage;
  renderToolsPopupState();
});

toolsRepurposeItem.addEventListener("click", () => {
  if (!campaignMode) return;
  if (!isActivePro) {
    closeToolsPopup();
    upgradeOverlay.classList.remove("hidden");
    return;
  }
  includeRepurpose = !includeRepurpose;
  renderToolsPopupState();
});

toolsSequenceItem.addEventListener("click", () => {
  if (!isActivePro) {
    closeToolsPopup();
    upgradeOverlay.classList.remove("hidden");
    return;
  }
  sequenceMode = !sequenceMode;
  if (sequenceMode) {
    campaignMode = false;
    includeLandingPage = false;
    includeRepurpose = false;
  }
  userInput.placeholder = sequenceMode
    ? "Describe the sequence, audience, goal, and the arc across emails…"
    : "Message Beeto…";
  renderToolsPopupState();
});

toolsSequenceLengthRow.querySelectorAll(".sequence-length-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // don't let this bubble up and close the popup
    sequenceLength = Number(btn.dataset.length);
    renderToolsPopupState();
  });
});

toolsWebSearchItem.addEventListener("click", () => {
  webSearchMode = !webSearchMode;
  renderToolsPopupState();
});

toolsPrivateItem.addEventListener("click", () => {
  if (isGuest) return;
  togglePrivateMode();
});

function togglePrivateMode() {
  isPrivateMode = !isPrivateMode;
  activeId = null;
  privateSession = null;
  closeToolsPopup();
  renderToolsPopupState();
  renderPrivateBanner();
  renderSidebar();
  renderActiveChat();
}

function renderPrivateBanner() {
  document.body.classList.toggle("private-mode-active", isPrivateMode);
  privateModeBanner.classList.toggle("hidden", !isPrivateMode);
}

function resetCampaignMode() {
  campaignMode = false;
  includeLandingPage = false;
  includeRepurpose = false;
  sequenceMode = false;
  sequenceLength = 3;
  userInput.placeholder = "Message Beeto…";
  renderToolsPopupState();
}

// --------------------------------------------------------------
// Guided onboarding — a 3-step wizard that pre-fills the Brand
// Profile on a brand-new account's first login. Skippable at any
// step.
// --------------------------------------------------------------
const onboardingOverlay = document.getElementById("onboardingOverlay");
const skipOnboardingBtn = document.getElementById("skipOnboardingBtn");
const onboardingBackBtn = document.getElementById("onboardingBackBtn");
const onboardingNextBtn = document.getElementById("onboardingNextBtn");
const onboardingDots = document.querySelectorAll(".onboarding-dot");
const onboardingSteps = document.querySelectorAll(".onboarding-step");

const obBrandName = document.getElementById("obBrandName");
const obBrandIndustry = document.getElementById("obBrandIndustry");
const obBrandAudience = document.getElementById("obBrandAudience");
const obBrandVoice = document.getElementById("obBrandVoice");
const obBrandAvoidWords = document.getElementById("obBrandAvoidWords");
const obBrandSampleEmail = document.getElementById("obBrandSampleEmail");

const ONBOARDING_TOTAL_STEPS = onboardingSteps.length;
let onboardingStep = 1;

function shouldShowOnboarding() {
  if (settings.onboarded) return false;
  const bp = settings.brandProfile || emptyBrandProfile();
  // Only trigger for a genuinely empty profile.
  return !(bp.name || bp.industry || bp.audience || bp.voice || bp.avoidWords || bp.sampleEmail);
}

function openOnboarding() {
  onboardingStep = 1;
  obBrandName.value = "";
  obBrandIndustry.value = "";
  obBrandAudience.value = "";
  obBrandVoice.value = "";
  obBrandAvoidWords.value = "";
  obBrandSampleEmail.value = "";
  renderOnboardingStep();
  onboardingOverlay.classList.remove("hidden");
  obBrandName.focus();
}

function closeOnboarding() {
  onboardingOverlay.classList.add("hidden");
}

function renderOnboardingStep() {
  onboardingSteps.forEach((stepEl) => {
    stepEl.classList.toggle("hidden", Number(stepEl.dataset.step) !== onboardingStep);
  });
  onboardingDots.forEach((dot) => {
    const stepNum = Number(dot.dataset.step);
    dot.classList.toggle("active", stepNum === onboardingStep);
    dot.classList.toggle("done", stepNum < onboardingStep);
  });
  onboardingBackBtn.classList.toggle("hidden", onboardingStep === 1);
  onboardingNextBtn.textContent = onboardingStep === ONBOARDING_TOTAL_STEPS ? "Finish" : "Continue";
}

function finishOnboarding() {
  settings.brandProfile = {
    name: obBrandName.value.trim(),
    industry: obBrandIndustry.value.trim(),
    audience: obBrandAudience.value.trim(),
    voice: obBrandVoice.value.trim(),
    avoidWords: obBrandAvoidWords.value.trim(),
    sampleEmail: obBrandSampleEmail.value.trim()
  };
  settings.onboarded = true;
  saveUserData();
  applySettingsToForm(); // keep the Settings modal's Brand tab in sync
  closeOnboarding();
}

function skipOnboarding() {
  settings.onboarded = true;
  saveUserData();
  closeOnboarding();
}

onboardingNextBtn.addEventListener("click", () => {
  if (onboardingStep < ONBOARDING_TOTAL_STEPS) {
    onboardingStep++;
    renderOnboardingStep();
  } else {
    finishOnboarding();
  }
});

onboardingBackBtn.addEventListener("click", () => {
  if (onboardingStep > 1) {
    onboardingStep--;
    renderOnboardingStep();
  }
});

skipOnboardingBtn.addEventListener("click", skipOnboarding);

const settingsOverlay = document.getElementById("settingsOverlay");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const toneSelect = document.getElementById("toneSelect");
const regionSelect = document.getElementById("regionSelect");
const nigeriaToggle = document.getElementById("nigeriaToggle");
const customInstruction = document.getElementById("customInstruction");
const memoryList = document.getElementById("memoryList");
const memoryInput = document.getElementById("memoryInput");
const addMemoryBtn = document.getElementById("addMemoryBtn");
const clearMemoryBtn = document.getElementById("clearMemoryBtn");
const aiDisclosureToggle = document.getElementById("aiDisclosureToggle");
const settingsTabs = document.querySelectorAll(".settings-tab");
const settingsPanels = document.querySelectorAll(".settings-panel");
const integrationsList = document.getElementById("integrationsList");

const INTEGRATION_PROVIDERS = [
  { id: "klaviyo", label: "Klaviyo", oauth: true },
  { id: "mailchimp", label: "Mailchimp", oauth: true },
  { id: "brevo", label: "Brevo", oauth: false }
];

let userIntegrations = []; // loaded from Supabase when Settings opens

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
    deleteBtn.innerHTML = ICONS.x;
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
  if (!confirm("Forget everything Beeto remembers about you?")) return;
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
let isActivePro = false; // read anywhere in the UI to lock/unlock Pro-only tools
let isPrivateMode = false;
let privateSession = null; // in-memory only — never pushed to `sessions`, never saved
let currentAbortController = null; // lets the stop button cancel an in-flight request

// --------------------------------------------------------------
// Persistence across reloads — iOS Safari reloads background tabs
// from scratch under memory pressure, which wipes in-memory JS
// state. These layers save just enough to localStorage to restore
// "where you were".
// --------------------------------------------------------------
const LAST_ACTIVE_KEY = "atm_last_active";
const DRAFT_KEY = "atm_draft_text";

function persistActiveState() {
  if (isPrivateMode) return; // never leak a private session id into localStorage
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, JSON.stringify({ activeId, activeProjectId }));
  } catch (error) {
    // Losing "resume where I left off" is fine, it should never break the app.
  }
}

function restoreActiveState() {
  // Always start from a clean default.
  activeProjectId = null;
  activeId = null;

  try {
    const raw = localStorage.getItem(LAST_ACTIVE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);

    const projectStillExists = saved.activeProjectId === null ||
      (settings.projects || []).some((p) => p.id === saved.activeProjectId);
    activeProjectId = projectStillExists ? saved.activeProjectId : null;

    const sessionStillExists = saved.activeId && sessions.some((s) => s.id === saved.activeId);
    activeId = sessionStillExists ? saved.activeId : null;
  } catch (error) {
    // Corrupt or unavailable storage falls back to the defaults set above.
  }
}

function persistDraft() {
  if (isPrivateMode) return; // private mode must never write anything typed to localStorage
  try {
    if (userInput.value) {
      localStorage.setItem(DRAFT_KEY, userInput.value);
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  } catch (error) {
    // Draft recovery is a nice-to-have, never something that should break typing.
  }
}

function restoreDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      userInput.value = saved;
      autoGrow();
    }
  } catch (error) {
    // Worst case, the draft just doesn't come back.
  }
}

function defaultSettings() {
  return {
    tone: "friendly and warm",
    emphasizeNigeria: true,
    customInstruction: "",
    voiceURI: "",
    brandProfile: {
      name: "",
      industry: "",
      audience: "",
      voice: "",
      avoidWords: "",
      sampleEmail: ""
    },
    projects: [],
    memories: [],
    aiDisclosure: true,
    onboarded: false,
    region: "us"
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
  return project ? project.name : "Project";
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
    "User already registered": "An account with that email already exists, try logging in instead.",
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
    authError.style.color = ""; // clear any green "reset link sent" colour from before
    authError.classList.remove("hidden");
    authForm.classList.add("shake");
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
    redirectTo: "https://beeto.toheebakanni.name.ng/reset-password.html"
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

const mailchimpAuthBtn = document.getElementById("mailchimpAuthBtn");
const klaviyoAuthBtn = document.getElementById("klaviyoAuthBtn");

mailchimpAuthBtn.addEventListener("click", () => {
  window.location.href = "/api/oauth-start?provider=mailchimp&mode=login";
});

klaviyoAuthBtn.addEventListener("click", () => {
  window.location.href = "/api/oauth-start?provider=klaviyo&mode=login";
});

// --------------------------------------------------------------
// Google sign-in — its own top-level listener.
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
  try {
    localStorage.removeItem(LAST_ACTIVE_KEY);
    localStorage.removeItem(DRAFT_KEY); // don't leak an unsent draft into the next account on this device
  } catch (error) {}
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
  restoreActiveState(); // resume the last chat/project instead of always starting blank
  activeProjectLabel.textContent = getActiveProjectName();
  applySettingsToForm();
  renderSidebar();
  renderActiveChat();

  if (shouldShowOnboarding()) {
    openOnboarding();
  }
}

// --------------------------------------------------------------
// Guest state — chat stays usable, nothing persists across reloads
// --------------------------------------------------------------
function showGuestMode() {
  isGuest = true;
  isActivePro = false;
  isPrivateMode = false;
  privateSession = null;
  accountBlock.classList.add("hidden");
  guestBlock.classList.remove("hidden");
  upgradeBtn.classList.add("hidden");

  sessions = [];
  settings = defaultSettings();
  activeId = null;
  activeProjectId = null;
  activeProjectLabel.textContent = "Project";
  applySettingsToForm();
  renderMemoryList();
  renderPrivateBanner();
  renderToolsPopupState();
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

// --------------------------------------------------------------
// Support this project ("Buy me a coffee") — a one-time, any-amount
// payment via Flutterwave. Open to guests and logged-in users alike.
// --------------------------------------------------------------
function openSupportModal() {
  supportError.classList.add("hidden");
  supportAmount.value = "";
  document.querySelectorAll(".support-preset-btn").forEach((b) => b.classList.remove("active"));
  supportOverlay.classList.remove("hidden");
}

supportSidebarBtn.addEventListener("click", openSupportModal);
supportFooterLink.addEventListener("click", openSupportModal);

closeSupportBtn.addEventListener("click", () => {
  supportOverlay.classList.add("hidden");
});

supportOverlay.addEventListener("click", (event) => {
  if (event.target === supportOverlay) supportOverlay.classList.add("hidden");
});

document.querySelectorAll(".support-preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".support-preset-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    supportAmount.value = btn.dataset.amount;
    supportCurrency.value = "NGN";
  });
});

supportAmount.addEventListener("input", () => {
  document.querySelectorAll(".support-preset-btn").forEach((b) => b.classList.remove("active"));
});

supportSubmitBtn.addEventListener("click", async () => {
  supportError.classList.add("hidden");
  const amount = Number(supportAmount.value);
  const currency = supportCurrency.value;

  if (!amount || amount <= 0) {
    supportError.textContent = "Enter an amount first.";
    supportError.classList.remove("hidden");
    return;
  }

  supportSubmitBtn.disabled = true;
  try {
    // Guests have no session, so this only attaches an auth header
    // when one exists.
    const authHeaders = await getAuthHeaders();
    const response = await fetch("/api/create-support-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ amount, currency })
    });
    const data = await response.json();

    if (!response.ok || !data.link) {
      throw new Error(data.error || "Could not start payment.");
    }

    window.location.href = data.link;
  } catch (error) {
    supportError.textContent = error.message;
    supportError.classList.remove("hidden");
    supportSubmitBtn.disabled = false;
  }
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
    settings.aiDisclosure = settings.aiDisclosure === undefined ? true : settings.aiDisclosure;
    // Older accounts predate this flag. shouldShowOnboarding() also
    // checks whether the brand profile is actually empty, so this
    // default alone won't re-trigger the wizard for anyone who
    // already has brand info saved.
    settings.onboarded = settings.onboarded === undefined ? false : settings.onboarded;
    settings.region = settings.region || "us";
    settings.voiceURI = settings.voiceURI || "";
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

    isActivePro = Boolean(
      sub &&
      sub.plan === "pro" &&
      sub.status === "active" &&
      sub.current_period_end &&
      new Date(sub.current_period_end) > new Date()
    );

    applyProStatusToUI(isActivePro);
    renderToolsPopupState(); // refresh locks now that we know the real plan
  } catch (error) {
    console.error("Failed to check subscription status:", error);
    // Fail safe: treat as free rather than silently claiming Pro.
    isActivePro = false;
    applyProStatusToUI(false);
  }
}

function applyProStatusToUI(isActivePro) {
  if (isActivePro) {
    // Already Pro — no need to dangle the upgrade prompt in front of them.
    upgradeBtn.classList.add("hidden");

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
  if (isGuest || isPrivateMode) return; // nothing to persist for a guest or private session

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
// Integrations tab — Klaviyo/Mailchimp via OAuth connect, Brevo via
// a pasted API key. Loaded fresh each time Settings opens so the
// list reflects the account's current connections.
// --------------------------------------------------------------
async function loadIntegrations() {
  if (isGuest) { userIntegrations = []; return; }
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch("/api/list-integrations", { headers: authHeaders });
    const data = await response.json();
    userIntegrations = Array.isArray(data.integrations) ? data.integrations : [];
  } catch (error) {
    console.error("Failed to load integrations:", error);
    userIntegrations = [];
  }
}

function renderIntegrationsList() {
  if (!integrationsList) return;
  integrationsList.innerHTML = "";

  INTEGRATION_PROVIDERS.forEach((p) => {
    const connected = userIntegrations.find((i) => i.provider === p.id);

    const row = document.createElement("div");
    row.className = "integration-row";

    const label = document.createElement("span");
    label.className = "integration-label";
    label.textContent = p.label + (connected ? " — connected" : "");
    row.appendChild(label);

    if (connected) {
      const disconnectBtn = document.createElement("button");
      disconnectBtn.type = "button";
      disconnectBtn.className = "integration-btn integration-disconnect";
      disconnectBtn.textContent = "Disconnect";
      disconnectBtn.addEventListener("click", () => disconnectIntegration(p.id));
      row.appendChild(disconnectBtn);
    } else if (p.oauth) {
      const connectBtn = document.createElement("button");
      connectBtn.type = "button";
      connectBtn.className = "integration-btn";
      connectBtn.textContent = "Connect " + p.label;
      connectBtn.addEventListener("click", () => {
        window.location.href = `/api/oauth-start?provider=${p.id}&mode=connect`;
      });
      row.appendChild(connectBtn);
    } else {
      // Brevo — no OAuth, just a paste-your-key field
      const keyInput = document.createElement("input");
      keyInput.type = "text";
      keyInput.placeholder = "Paste your Brevo API key";
      keyInput.className = "integration-key-input";

      const saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "integration-btn";
      saveBtn.textContent = "Save";
      saveBtn.addEventListener("click", () => saveBrevoKey(keyInput.value.trim()));

      row.appendChild(keyInput);
      row.appendChild(saveBtn);
    }

    integrationsList.appendChild(row);
  });
}

async function saveBrevoKey(key) {
  if (!key) return;
  try {
    const authHeaders = await getAuthHeaders();
    await fetch("/api/save-integration", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ provider: "brevo", access_token: key })
    });
    await loadIntegrations();
    renderIntegrationsList();
  } catch (error) {
    alert("Couldn't save your Brevo key. Try again.");
  }
}

async function disconnectIntegration(provider) {
  if (!confirm(`Disconnect ${provider}?`)) return;
  try {
    const authHeaders = await getAuthHeaders();
    await fetch("/api/disconnect-integration", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ provider })
    });
    await loadIntegrations();
    renderIntegrationsList();
  } catch (error) {
    alert("Couldn't disconnect. Try again.");
  }
}

// --------------------------------------------------------------
// Send Campaign modal
// --------------------------------------------------------------
const sendCampaignOverlay = document.getElementById("sendCampaignOverlay");
const closeSendCampaignBtn = document.getElementById("closeSendCampaignBtn");
const sendProviderSelect = document.getElementById("sendProviderSelect");
const sendListSelect = document.getElementById("sendListSelect");
const sendSubjectSelect = document.getElementById("sendSubjectSelect");
const sendCampaignError = document.getElementById("sendCampaignError");
const confirmSendCampaignBtn = document.getElementById("confirmSendCampaignBtn");
let campaignToSend = null;

closeSendCampaignBtn.addEventListener("click", () => sendCampaignOverlay.classList.add("hidden"));
sendCampaignOverlay.addEventListener("click", (e) => { if (e.target === sendCampaignOverlay) sendCampaignOverlay.classList.add("hidden"); });

async function openSendCampaignModal(campaign) {
  campaignToSend = campaign;
  sendCampaignError.classList.add("hidden");
  sendListSelect.innerHTML = "";
  sendProviderSelect.innerHTML = "";

  sendSubjectSelect.innerHTML = "";
  (campaign.subject_lines || []).forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    sendSubjectSelect.appendChild(opt);
  });

  await loadIntegrations();
  const connected = userIntegrations.filter((i) => ["brevo", "mailchimp", "klaviyo"].includes(i.provider));

  if (connected.length === 0) {
    sendCampaignError.textContent = "Connect an email platform in Settings first.";
    sendCampaignError.classList.remove("hidden");
    confirmSendCampaignBtn.disabled = true;
    sendCampaignOverlay.classList.remove("hidden");
    return;
  }
  confirmSendCampaignBtn.disabled = false;

  connected.forEach((i) => {
    const opt = document.createElement("option");
    opt.value = i.provider;
    opt.textContent = i.provider.charAt(0).toUpperCase() + i.provider.slice(1);
    sendProviderSelect.appendChild(opt);
  });

  await loadListsForProvider(sendProviderSelect.value);
  sendProviderSelect.onchange = () => loadListsForProvider(sendProviderSelect.value);

  sendCampaignOverlay.classList.remove("hidden");
}

async function loadListsForProvider(provider) {
  sendListSelect.innerHTML = "<option>Loading…</option>";
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`/api/list-esp-lists?provider=${provider}`, { headers: authHeaders });
    const data = await response.json();
    sendListSelect.innerHTML = "";
    (data.lists || []).forEach((l) => {
      const opt = document.createElement("option");
      opt.value = l.id;
      opt.textContent = l.name + (l.count != null ? ` (${l.count})` : "");
      sendListSelect.appendChild(opt);
    });
    if ((data.lists || []).length === 0) {
      sendListSelect.innerHTML = "<option value=''>No lists found</option>";
    }
  } catch (error) {
    sendListSelect.innerHTML = "<option value=''>Couldn't load lists</option>";
  }
}

confirmSendCampaignBtn.addEventListener("click", async () => {
  if (!campaignToSend) return;
  const provider = sendProviderSelect.value;
  const listId = sendListSelect.value;
  const subjectLine = sendSubjectSelect.value;

  if (!listId) {
    sendCampaignError.textContent = "Pick a list first.";
    sendCampaignError.classList.remove("hidden");
    return;
  }

  const confirmed = confirm(`Send this campaign to your ${provider} list now? This cannot be undone.`);
  if (!confirmed) return;

  confirmSendCampaignBtn.disabled = true;
  confirmSendCampaignBtn.textContent = "Sending…";
  sendCampaignError.classList.add("hidden");

  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch("/api/send-campaign", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        provider,
        campaign: campaignToSend,
        listId,
        subjectLine,
        senderName: (getActiveBrandProfile() || {}).name || "Beeto",
        senderEmail: settings.brandProfile?.email || undefined
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Send failed.");

    sendCampaignOverlay.classList.add("hidden");
    alert("Campaign sent!");
  } catch (error) {
    sendCampaignError.textContent = error.message;
    sendCampaignError.classList.remove("hidden");
  } finally {
    confirmSendCampaignBtn.disabled = false;
    confirmSendCampaignBtn.textContent = "Send now";
  }
});

// --------------------------------------------------------------
// Settings panel
// --------------------------------------------------------------

function openSettingsPanel() {
  resetSettingsTabs();
  applySettingsToForm();
  settingsOverlay.classList.remove("hidden");
  loadIntegrations().then(renderIntegrationsList);
}

popupSettingsBtn.addEventListener("click", () => {
  closeAccountPopup();
  openSettingsPanel();
});

function closeGuestPopup() {
  guestPopup.classList.add("hidden");
  guestTrigger.setAttribute("aria-expanded", "false");
}

guestTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = guestPopup.classList.contains("hidden");
  guestPopup.classList.toggle("hidden", !willOpen);
  guestTrigger.setAttribute("aria-expanded", String(willOpen));
});

document.addEventListener("click", (e) => {
  if (!guestPopup.classList.contains("hidden") && !guestBlock.contains(e.target)) {
    closeGuestPopup();
  }
});

guestSettingsBtn.addEventListener("click", () => {
  closeGuestPopup();
  openSettingsPanel();
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
  settings.region = regionSelect.value;
  settings.emphasizeNigeria = nigeriaToggle.checked;
  settings.aiDisclosure = aiDisclosureToggle.checked;
  settings.customInstruction = customInstruction.value.trim();
  settings.voiceURI = voiceSelect.value;

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
  regionSelect.value = settings.region || "us";
  nigeriaToggle.checked = settings.emphasizeNigeria;
  aiDisclosureToggle.checked = settings.aiDisclosure;
  customInstruction.value = settings.customInstruction;

  populateVoiceOptions();
  voiceSelect.value = settings.voiceURI || "";

  const bp = getActiveBrandProfile() || emptyBrandProfile();
  brandProfileLabel.textContent = `Brand Profile, ${getActiveProjectName()}`;
  brandName.value = bp.name;
  brandIndustry.value = bp.industry;
  brandAudience.value = bp.audience;
  brandVoice.value = bp.voice;
  brandAvoidWords.value = bp.avoidWords;
  brandSampleEmail.value = bp.sampleEmail;
}

// --------------------------------------------------------------
// Sidebar toggle — works the same way on desktop and mobile.
// Desktop: collapses the sidebar to width 0 and shows a small
// floating re-open tab. Mobile: off-canvas slide plus a backdrop.
// --------------------------------------------------------------
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

// Initial state: mobile starts closed, desktop starts open.
if (isMobileViewport()) {
  sidebarOpenBtn.classList.remove("hidden");
} else {
  sidebarOpenBtn.classList.add("hidden");
}

// If the viewport crosses the mobile/desktop breakpoint, make sure
// the sidebar doesn't get stuck invisible with no way to reopen it.
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
  persistActiveState();
  renderSidebar();
  renderActiveChat();
  userInput.focus();
  if (isMobileViewport()) closeSidebar();
});

// --------------------------------------------------------------
// File attachments (images and plain text files)
// --------------------------------------------------------------
let pendingAttachments = []; // [{ kind: "image"|"text"|"loading", name, data }]
const MAX_ATTACHMENTS = 8;

// 8MB covers a large brand PDF or subscriber CSV without risking a
// frozen tab on mobile Safari while it reads into memory.
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
// ~10k tokens' worth of text — keeps one attachment from silently
// consuming a huge chunk of a message's cost.
const MAX_EXTRACTED_CHARS = 40000;

fileInput.addEventListener("change", async () => {
  const files = Array.from(fileInput.files || []);
  if (files.length === 0) return;

  for (const file of files) {
    if (pendingAttachments.length >= MAX_ATTACHMENTS) {
      alert(`You can attach up to ${MAX_ATTACHMENTS} files per message.`);
      break;
    }

    if (file.size > MAX_ATTACHMENT_BYTES) {
      alert(`${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please use files under 8MB.`);
      continue;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDocx = file.name.toLowerCase().endsWith(".docx");

    try {
      if (file.type.startsWith("image/")) {
        const dataUrl = await readFileAsDataURL(file);
        pendingAttachments.push({ kind: "image", name: file.name, data: dataUrl });
        renderAttachmentPreview();
      } else if (isPdf || isDocx) {
        // Track the loading state as a real entry in pendingAttachments
        // (not a detached DOM node) so a re-render triggered by another
        // attachment finishing first can't wipe it out.
        const loadingEntry = { kind: "loading", name: file.name };
        pendingAttachments.push(loadingEntry);
        renderAttachmentPreview();

        const text = isPdf ? await extractPdfText(file) : await extractDocxText(file);

        const idx = pendingAttachments.indexOf(loadingEntry);
        if (idx !== -1) {
          pendingAttachments[idx] = { kind: "text", name: file.name, data: truncateExtractedText(text) };
        }
        renderAttachmentPreview();
      } else {
        const text = await readFileAsText(file);
        pendingAttachments.push({ kind: "text", name: file.name, data: truncateExtractedText(text) });
        renderAttachmentPreview();
      }
    } catch (error) {
      console.error("Failed to read file:", error);
      pendingAttachments = pendingAttachments.filter((a) => !(a.kind === "loading" && a.name === file.name));
      renderAttachmentPreview();
      alert(`Couldn't read ${file.name}: ` + (error?.message || error));
    }
  }

  fileInput.value = "";
});

function truncateExtractedText(text) {
  if (text.length <= MAX_EXTRACTED_CHARS) return text;
  return text.slice(0, MAX_EXTRACTED_CHARS) + "\n\n[Content truncated — this file was longer than what a single message can hold.]";
}

async function ensurePdfJsReady() {
  if (window.pdfjsLib) return;

  const PDFJS_LOAD_TIMEOUT_MS = 10000; // don't hang forever on a slow/failed CDN load

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("PDF reader took too long to load — check your connection and try again."));
    }, PDFJS_LOAD_TIMEOUT_MS);

    window.addEventListener("pdfjs-ready", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

async function extractPdfText(file) {
  await ensurePdfJsReady();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  const maxPages = Math.min(pdf.numPages, 30); // guards against a huge PDF hanging the page

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => item.str).join(" ") + "\n\n";
  }

  if (pdf.numPages > maxPages) {
    fullText += `[Only the first ${maxPages} of ${pdf.numPages} pages were read.]`;
  }

  return fullText.trim();
}

async function extractDocxText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

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

  if (pendingAttachments.length === 0) {
    attachmentPreview.classList.add("hidden");
    return;
  }

  attachmentPreview.classList.remove("hidden");

  pendingAttachments.forEach((attachment, index) => {
    if (attachment.kind === "loading") {
      const chip = document.createElement("div");
      chip.className = "attachment-chip";
      chip.innerHTML = ICONS.loader + " Reading " + attachment.name + "…";
      attachmentPreview.appendChild(chip);
      return; // no remove button while it's still loading
    }

    if (attachment.kind === "image") {
      const img = document.createElement("img");
      img.src = attachment.data;
      attachmentPreview.appendChild(img);
    } else {
      const chip = document.createElement("div");
      chip.className = "attachment-chip";
      chip.innerHTML = ICONS.fileText + " " + attachment.name;
      attachmentPreview.appendChild(chip);
    }

    const removeBtn = document.createElement("button");
    removeBtn.className = "attachment-remove";
    removeBtn.innerHTML = ICONS.x;
    removeBtn.addEventListener("click", () => {
      pendingAttachments.splice(index, 1);
      renderAttachmentPreview();
    });
    attachmentPreview.appendChild(removeBtn);
  });
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
  avatar.innerHTML = ICONS.mail;

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

// The send button doubles as a stop button while a request is in
// flight (see setLoading). It's type="button" in the HTML so it
// never auto-submits the form on its own.
sendBtn.addEventListener("click", () => {
  if (isSending) {
    stopResponse();
  } else {
    chatForm.requestSubmit();
  }
});

function stopResponse() {
  if (currentAbortController) {
    currentAbortController.abort();
  }
}

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

userInput.addEventListener("input", () => {
  autoGrow();
  persistDraft();
});

userInput.addEventListener("paste", () => setTimeout(autoGrow, 0));

window.addEventListener("resize", autoGrow);

let isSending = false;

async function handleSend(event) {
  event.preventDefault();

  if (isSending) return; // ignore accidental double-submits while a request is in flight

  if (pendingAttachments.some((a) => a.kind === "loading")) {
    alert("Still reading an attached file — give it a second and try again.");
    return;
  }

  const text = userInput.value.trim();
  if (!text && pendingAttachments.length === 0) return;

  if (activeId === null) {
    const newSession = {
      id: Date.now().toString(),
      title: (text || pendingAttachments[0].name).slice(0, 40),
      messages: [],
      projectId: activeProjectId
    };

    if (isPrivateMode) {
      privateSession = newSession;
    } else {
      sessions.unshift(newSession);
    }
    activeId = newSession.id;
    persistActiveState();
  }

  let content = text;
  const attachmentSummary = pendingAttachments.map((a) => ({ kind: a.kind, name: a.name }));

  if (pendingAttachments.length > 0) {
    const imageParts = pendingAttachments
      .filter((a) => a.kind === "image")
      .map((a) => ({ type: "image_url", image_url: { url: a.data } }));

    const textAttachments = pendingAttachments
      .filter((a) => a.kind === "text")
      .map((a) => `[Attached file: ${a.name}]\n${a.data}`)
      .join("\n\n");

    const combinedText = [text, textAttachments].filter(Boolean).join("\n\n");

    content = imageParts.length > 0
      ? [{ type: "text", text: combinedText || "What's in this?" }, ...imageParts]
      : combinedText;
  }

  const session = getActiveSession();
  session.messages.push({ role: "user", content, displayText: text, attachments: attachmentSummary });
  saveUserData();
  renderSidebar();
  renderActiveChat();

  userInput.value = "";
  persistDraft(); // clears the saved draft now that it's been sent
  pendingAttachments = [];
  renderAttachmentPreview();
  autoGrow();

  isSending = true;
  currentAbortController = new AbortController();
  setLoading(true);
  addTypingIndicator();
  if (voiceModeEnabled) setVoiceStatus("thinking");

  const mode = campaignMode ? "campaign" : (sequenceMode ? "sequence" : undefined);
  const useWebSearch = webSearchMode;
  let voiceWillRespond = false; // set true once speakText() has been kicked off, so `finally` knows not to resume listening early

  try {
    const result = await callGroqAPI(session.messages, mode, useWebSearch, undefined, currentAbortController.signal);

    if (mode === "campaign") {
      session.messages.push({
        role: "assistant",
        content: campaignToText(result.campaign),
        campaignData: result.campaign,
        warnings: result.warnings,
        aiDisclosure: result.aiDisclosure,
        kind: "campaign"
      });

      saveUserData();
      renderActiveChat();
    } else if (mode === "sequence") {
      session.messages.push({
        role: "assistant",
        content: sequenceToText(result.sequence),
        sequenceData: result.sequence,
        warnings: result.warnings,
        aiDisclosure: result.aiDisclosure,
        kind: "sequence"
      });

      saveUserData();
      renderActiveChat();
    } else {
      session.messages.push({ role: "assistant", content: result.reply, sources: result.sources, suggestions: result.suggestions });

      if (result.memory) {
        settings.memories = settings.memories || [];
        const FREE_MEMORY_CAP = 10;
        if (isActivePro || settings.memories.length < FREE_MEMORY_CAP) {
          settings.memories.push({ id: Date.now().toString(), text: result.memory, createdAt: new Date().toISOString() });
        }
      }

      saveUserData();
      renderActiveChat({ typeLast: true });

      if (voiceModeEnabled) {
        voiceWillRespond = true;
        setVoiceStatus("speaking");

        // Barge-in (off on iOS): start listening in parallel with
        // playback so commandRecognition's onresult can notice you
        // talking over Beeto and cut it off.
        commandProducedResult = false;
        if (bargeInEnabled) startCommandListening();

        speakText(result.reply, () => {
          if (voiceModeEnabled) {
            // startCommandListening() is a no-op if barge-in already
            // has recognition running. On iPhone this waits for a tap.
            resumeVoiceListening();
          } else {
            setVoiceStatus("idle");
          }
        });
      }
    }
  } catch (error) {
    console.error(error);

    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) typingIndicator.remove();

    if (error.name === "AbortError") {
      // User hit stop — nothing more to do, the request is simply discarded.
    } else if (error.code === "GUEST_LIMIT") {
      session.messages.pop();
      renderActiveChat();
      openAuthModal();
    } else if (error.code === "PRO_REQUIRED") {
      session.messages.pop();
      renderActiveChat();
      upgradeOverlay.classList.remove("hidden");
    } else {
      session.messages.push({ role: "assistant", content: "⚠️ " + error.message });
      renderActiveChat();
    }
  } finally {
    setLoading(false);
    resetCampaignMode();
    isSending = false;
    currentAbortController = null;

    // Campaign/sequence replies, errors, and aborts never trigger
    // speakText() above, so nothing will resume listening on its own
    // in those cases — do it here instead.
    if (voiceModeEnabled && !voiceWillRespond) {
      resumeVoiceListening();
    }
  }
}

// --------------------------------------------------------------
// API call
// --------------------------------------------------------------
async function callGroqAPI(messages, mode, useWebSearch, campaignOverrides, signal) {
  const authHeaders = await getAuthHeaders();

  const cleanMessages = messages.map((msg) => ({ role: msg.role, content: msg.content }));

  const settingsForRequest = isPrivateMode
    ? {
        tone: "friendly and warm",
        region: settings.region || "us",
        emphasizeNigeria: false,
        customInstruction: "",
        brandProfile: emptyBrandProfile(),
        memories: [],
        aiDisclosure: settings.aiDisclosure,
        onboarded: true
      }
    : { ...settings, brandProfile: getActiveBrandProfile() };

  // campaignOverrides lets a refine-in-place call pin the exact add-ons
  // of the campaign it's regenerating, instead of reading current UI
  // toggle state (which may have moved on since the original send).
  const landingFlag = campaignOverrides?.includeLandingPage !== undefined
    ? campaignOverrides.includeLandingPage
    : includeLandingPage;
  const repurposeFlag = campaignOverrides?.includeRepurpose !== undefined
    ? campaignOverrides.includeRepurpose
    : includeRepurpose;

  const isStructuredMode = mode === "campaign" || mode === "sequence";

  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    body: JSON.stringify({
      messages: cleanMessages,
      settings: settingsForRequest,
      mode,
      includeLandingPage: mode === "campaign" ? landingFlag : undefined,
      includeRepurpose: mode === "campaign" ? repurposeFlag : undefined,
      sequenceLength: mode === "sequence" ? sequenceLength : undefined,
      webSearch: isStructuredMode ? undefined : Boolean(useWebSearch),
      privateMode: Boolean(isPrivateMode),
      // Tells the server to answer in short, speakable sentences.
      voiceMode: !isStructuredMode && Boolean(voiceModeEnabled)
    }),
    signal
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error || `Request failed with status ${response.status}`);
    if (data.code) err.code = data.code;
    throw err;
  }

  if (mode === "campaign") {
    if (!data.campaign) throw new Error("No campaign data returned from the API.");
    return { campaign: data.campaign, warnings: data.warnings || [], aiDisclosure: Boolean(data.aiDisclosure) };
  }

  if (mode === "sequence") {
    if (!data.sequence) throw new Error("No sequence data returned from the API.");
    return { sequence: data.sequence, warnings: data.warnings || [], aiDisclosure: Boolean(data.aiDisclosure) };
  }

  if (!data.reply) throw new Error("No text returned from the API.");
  return { reply: data.reply.trim(), sources: data.sources || [], memory: data.memory || null, suggestions: Array.isArray(data.suggestions) ? data.suggestions : [] };
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
    // :hover CSS rule. iOS Safari needs a tap target to match its hover
    // target, or the first tap only "hovers" and a second is needed.
    item.addEventListener("click", () => {
      activeId = session.id;
      persistActiveState();
      renderSidebar();
      renderActiveChat();
      if (isMobileViewport()) closeSidebar();
    });

    const label = document.createElement("span");
    label.className = "history-item-label";
    label.textContent = session.title || "New chat";

    const menuBtn = document.createElement("button");
    menuBtn.className = "history-item-menu";
    menuBtn.innerHTML = ICONS.moreVertical;
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
      persistActiveState();
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
// read earlier messages.
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
      const isLastCampaign = index === session.messages.length - 1;
      addCampaignCardToDOM(msg.campaignData, msg.warnings, msg.aiDisclosure, index, isLastCampaign);
      return;
    }
    if (msg.kind === "sequence") {
      addSequenceCardToDOM(msg.sequenceData, msg.warnings, msg.aiDisclosure);
      return;
    }
    const role = msg.role === "user" ? "user" : "assistant";
    const isLast = index === session.messages.length - 1;
    const shouldType = Boolean(options.typeLast) && isLast && role === "assistant";
    addMessageToDOM(msg, role, shouldType, isLast);
  });

  // Always jump to bottom the first time a chat is opened / re-rendered
  // in full — the "stay put while typing" behaviour only applies to the
  // token-by-token effect.
  chatLog.scrollTop = chatLog.scrollHeight;
}

function addMessageToDOM(msg, kind, animate = false, isLast = false) {
  const content = msg.content;
  const sources = msg.sources || [];
  const suggestions = msg.suggestions || [];
  const hasOwnDisplayText = kind === "user" && Array.isArray(msg.attachments);

  const textPart = hasOwnDisplayText
    ? msg.displayText
    : (Array.isArray(content) ? (content.find(p => p.type === "text")?.text || "") : content);

  const imageParts = Array.isArray(content) ? content.filter(p => p.type === "image_url") : [];

  const wrapper = document.createElement("div");
  wrapper.className = `message ${kind}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  if (kind === "assistant") { avatar.innerHTML = ICONS.mail; } else { avatar.textContent = getUserInitial(); }
  
  const body = document.createElement("div");
  body.className = "message-body";

  imageParts.forEach((imagePart) => {
    const img = document.createElement("img");
    img.className = "message-image";
    img.src = imagePart.image_url.url;
    body.appendChild(img);
  });

  if (kind === "user" && msg.attachments) {
    msg.attachments.filter(a => a.kind === "text").forEach((a) => {
      const chip = document.createElement("div");
      chip.className = "attachment-chip";
      chip.innerHTML = ICONS.fileText + " " + a.name;
      body.appendChild(chip);
    });
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (kind === "assistant") {
    if (animate) {
      typeWriterEffect(bubble, textPart);
    } else {
      bubble.innerHTML = renderMarkdown(textPart);
      renderMathIn(bubble);
    }
  } else {
    bubble.textContent = textPart;
  }
  if (textPart) body.appendChild(bubble);

  if (kind === "assistant" && sources && sources.length > 0) {
    body.appendChild(buildSourcesRow(sources));
  }
  if (kind === "assistant" && isLast && suggestions.length > 0 && !isSending) {
    body.appendChild(buildSuggestionsRow(suggestions));
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

    // A malformed/relative URL from a search result shouldn't crash the
    // whole reply — fall back to the raw URL string if it can't be parsed.
    let displayText = src.title;
    if (!displayText) {
      try {
        displayText = new URL(src.url).hostname;
      } catch (error) {
        displayText = src.url || "source";
      }
    }
    link.textContent = displayText;

    row.appendChild(link);
  });

  return row;
}

// Tappable follow-up suggestions under the most recent assistant reply.
// Only shown on the last message so old suggestions don't linger.
function buildSuggestionsRow(suggestions) {
  const row = document.createElement("div");
  row.className = "suggestions-row";

  suggestions.forEach((text) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "suggestion-chip";
    chip.textContent = text;
    chip.addEventListener("click", () => {
      userInput.value = text;
      chatForm.requestSubmit();
    });
    row.appendChild(chip);
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

  if (campaign.sms) {
    parts.push(
      "",
      "--- SMS ---",
      campaign.sms.message || ""
    );
  }

  if (campaign.social) {
    const s = campaign.social;
    parts.push(
      "",
      "--- Social captions ---",
      "Instagram: " + (s.instagram_caption || ""),
      "",
      "LinkedIn: " + (s.linkedin_caption || ""),
      "",
      "X: " + (s.x_caption || ""),
      "",
      "Hashtags: " + (s.hashtags || []).join(" ")
    );
  }

  return parts.join("\n");
}

// Client-side file download — no backend involved.
function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Turns a subject line (or fallback) into a safe filename.
function slugifyFilename(text, fallback) {
  const base = (text || fallback || "download").slice(0, 40);
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
}

// Flattens a sequence into copyable plain text — each email in full,
// separated by its step number and send delay.
function sequenceToText(sequence) {
  const parts = [sequence.sequence_name || "Email sequence", ""];

  (sequence.emails || []).forEach((email, i) => {
    if (i > 0) parts.push("", "===================", "");
    parts.push(
      `Email ${email.step_number}, ${email.purpose || ""} (${email.send_delay || ""})`,
      "",
      "Subject line options:",
      ...(email.subject_lines || []).map((s) => "- " + s),
      "",
      "Preheader: " + (email.preheader || ""),
      "",
      email.body || "",
      "",
      "CTA: " + (email.cta_text || "")
    );
  });

  return parts.join("\n");
}

function addCampaignCardToDOM(campaign, warnings, aiDisclosure, messageIndex, isLast) {
  const wrapper = document.createElement("div");
  wrapper.className = "message assistant";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.innerHTML = ICONS.mail;

  const body = document.createElement("div");
  body.className = "message-body";

  const card = document.createElement("div");
  card.className = "campaign-card";

  if (aiDisclosure) {
    const badge = document.createElement("div");
    badge.className = "ai-disclosure-badge";
    badge.textContent = "AI-assisted";
    card.appendChild(badge);
  }

  const subjectSection = document.createElement("div");
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

  if (campaign.sms || campaign.social) {
    const repurposeDivider = document.createElement("div");
    repurposeDivider.className = "campaign-lp-divider";
    repurposeDivider.textContent = "Repurposed for other channels";
    card.appendChild(repurposeDivider);

    if (campaign.sms) {
      const overLimit = (campaign.sms.character_count || campaign.sms.message.length) > 160;
      const smsLabel = `SMS (${campaign.sms.character_count || campaign.sms.message.length} chars${overLimit ? ", over limit" : ""})`;
      card.appendChild(campaignField(smsLabel, campaign.sms.message));
    }

    if (campaign.social) {
      card.appendChild(campaignField("Instagram caption", campaign.social.instagram_caption));
      card.appendChild(campaignField("LinkedIn caption", campaign.social.linkedin_caption));
      card.appendChild(campaignField("X caption", campaign.social.x_caption));
      if (campaign.social.hashtags && campaign.social.hashtags.length > 0) {
        card.appendChild(campaignField("Hashtags", campaign.social.hashtags.join(" ")));
      }
    }
  }

  if (warnings && warnings.length > 0) {
    const warnSection = document.createElement("div");
    warnSection.className = "campaign-warnings";

    const warnLabel = document.createElement("div");
    warnLabel.className = "campaign-warnings-label";
    warnLabel.innerHTML = ICONS.alertTriangle + ` ${warnings.length} deliverability flag${warnings.length > 1 ? "s" : ""}`;warnSection.appendChild(warnLabel);

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
    okMsg.innerHTML = ICONS.checkCircle + " No deliverability flags";
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

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "campaign-copy-btn";
  downloadBtn.textContent = "Download";
  downloadBtn.addEventListener("click", () => {
    const filename = slugifyFilename(campaign.subject_lines?.[0], "campaign") + ".txt";
    downloadTextFile(filename, campaignToText(campaign));
  });
  card.appendChild(downloadBtn);

  if (!isGuest) {
    const sendBtn2 = document.createElement("button");
    sendBtn2.className = "campaign-copy-btn";
    sendBtn2.innerHTML = ICONS.send + " Send campaign";
    sendBtn2.addEventListener("click", () => openSendCampaignModal(campaign));
    card.appendChild(sendBtn2);
  }

  // --------------------------------------------------------------
  // In-place refinement — only on the most recent campaign card, so
  // there's never ambiguity about which version is "current."
  // --------------------------------------------------------------
  if (isLast && typeof messageIndex === "number") {
    const refineRow = document.createElement("div");
    refineRow.className = "campaign-refine-row";

    const refineError = document.createElement("div");
    refineError.className = "campaign-refine-error hidden";

    const refineOptions = [
      { label: "Make it shorter", instruction: "Make it noticeably shorter and tighter, cut anything that isn't pulling its weight, while keeping the core message and CTA intact." },
      { label: "Make it punchier", instruction: "Make it punchier and more energetic, sharper hooks, more active language, stronger urgency in the CTA, without resorting to spammy phrasing." }
    ];

    refineOptions.forEach(({ label, instruction }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "campaign-refine-btn";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        refineCampaign(messageIndex, instruction, btn, refineRow, refineError);
      });
      refineRow.appendChild(btn);
    });

    card.appendChild(refineRow);
    card.appendChild(refineError);
  }

  body.appendChild(card);
  wrapper.appendChild(avatar);
  wrapper.appendChild(body);
  chatLog.appendChild(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// --------------------------------------------------------------
// Re-generates an existing campaign card in place. The refine
// instruction itself is NOT saved into session.messages — only the
// updated campaign fields on the existing message are.
// --------------------------------------------------------------
async function refineCampaign(messageIndex, instruction, clickedBtn, refineRow, refineError) {
  const session = getActiveSession();
  const targetMsg = session?.messages[messageIndex];
  if (!targetMsg || !targetMsg.campaignData) return;

  refineError.classList.add("hidden");

  const buttons = Array.from(refineRow.querySelectorAll(".campaign-refine-btn"));
  const originalLabels = buttons.map((b) => b.textContent);
  buttons.forEach((b) => { b.disabled = true; });
  clickedBtn.textContent = "Refining…";

  try {
    const contextMessages = session.messages
      .slice(0, messageIndex + 1)
      .map((m) => ({ role: m.role, content: m.content }));

    contextMessages.push({
      role: "user",
      content: `Refine the email campaign above. ${instruction} Keep it consistent with the brand profile and everything else about the campaign that the instruction doesn't ask you to change. Return the complete revised campaign.`
    });

    const campaignOverrides = {
      includeLandingPage: Boolean(targetMsg.campaignData.landing_page),
      includeRepurpose: Boolean(targetMsg.campaignData.sms || targetMsg.campaignData.social)
    };
    const result = await callGroqAPI(contextMessages, "campaign", false, campaignOverrides);

    if (!result.campaign) throw new Error("No campaign data returned from the API.");

    targetMsg.content = campaignToText(result.campaign);
    targetMsg.campaignData = result.campaign;
    targetMsg.warnings = result.warnings;
    targetMsg.aiDisclosure = result.aiDisclosure;

    saveUserData();
    renderActiveChat();
  } catch (error) {
    console.error(error);

    if (error.code === "GUEST_LIMIT") {
      openAuthModal();
    } else {
      refineError.textContent = "⚠ " + error.message;
      refineError.classList.remove("hidden");
    }

    buttons.forEach((b, i) => {
      b.disabled = false;
      b.textContent = originalLabels[i];
    });
  }
}

// Renders a full sequence as one card containing a collapsible
// section per email (native <details>) — each with its own
// deliverability warnings.
function addSequenceCardToDOM(sequence, warningsPerEmail, aiDisclosure) {
  const wrapper = document.createElement("div");
  wrapper.className = "message assistant";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.innerHTML = ICONS.mail;

  const body = document.createElement("div");
  body.className = "message-body";

  const card = document.createElement("div");
  card.className = "campaign-card sequence-card";

  if (aiDisclosure) {
    const badge = document.createElement("div");
    badge.className = "ai-disclosure-badge";
    badge.textContent = "AI-assisted";
    card.appendChild(badge);
  }

  const emailCount = (sequence.emails || []).length;
  const title = document.createElement("div");
  title.className = "sequence-title";
  title.textContent = `${sequence.sequence_name || "Email sequence"} (${emailCount} email${emailCount === 1 ? "" : "s"})`;
  card.appendChild(title);

  (sequence.emails || []).forEach((email, i) => {
    const details = document.createElement("details");
    details.className = "sequence-email";
    details.open = i === 0; // first email expanded by default, rest collapsed

    // Built with textContent (not innerHTML) so model output can never inject markup.
    const summary = document.createElement("summary");
    summary.className = "sequence-email-summary";

    const stepBadge = document.createElement("span");
    stepBadge.className = "sequence-step-badge";
    stepBadge.textContent = `Email ${email.step_number}`;

    const delayEl = document.createElement("span");
    delayEl.className = "sequence-delay";
    delayEl.textContent = `· ${email.send_delay || ""}`;

    summary.append(stepBadge, document.createTextNode(` ${email.purpose || ""} `), delayEl);
    details.appendChild(summary);

    const emailBody = document.createElement("div");
    emailBody.className = "sequence-email-body";

    const subjectSection = document.createElement("div");
    const subjectLabel = document.createElement("div");
    subjectLabel.className = "campaign-label";
    subjectLabel.textContent = "Subject lines";
    subjectSection.appendChild(subjectLabel);
    const subjectList = document.createElement("ul");
    subjectList.className = "campaign-subject-list";
    (email.subject_lines || []).forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      subjectList.appendChild(li);
    });
    subjectSection.appendChild(subjectList);
    emailBody.appendChild(subjectSection);

    emailBody.appendChild(campaignField("Preheader", email.preheader));
    emailBody.appendChild(campaignField("Body", email.body, true));
    emailBody.appendChild(campaignField("Call to action", email.cta_text));

    const emailWarnings = (warningsPerEmail && warningsPerEmail[i]) || [];
    if (emailWarnings.length > 0) {
      const warnSection = document.createElement("div");
      warnSection.className = "campaign-warnings";
      const warnLabel = document.createElement("div");
      warnLabel.className = "campaign-warnings-label";
      warnLabel.innerHTML = ICONS.alertTriangle + ` ${emailWarnings.length} deliverability flag${emailWarnings.length > 1 ? "s" : ""}`;
      warnSection.appendChild(warnLabel);
      const warnList = document.createElement("ul");
      emailWarnings.forEach((w) => {
        const li = document.createElement("li");
        li.textContent = w;
        warnList.appendChild(li);
      });
      warnSection.appendChild(warnList);
      emailBody.appendChild(warnSection);
    }

    details.appendChild(emailBody);
    card.appendChild(details);
  });

  const copyBtn = document.createElement("button");
  copyBtn.className = "campaign-copy-btn";
  copyBtn.textContent = "Copy full sequence";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(sequenceToText(sequence));
    copyBtn.textContent = "Copied";
    setTimeout(() => { copyBtn.textContent = "Copy full sequence"; }, 1200);
  });
  card.appendChild(copyBtn);

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "campaign-copy-btn";
  downloadBtn.textContent = "Download";
  downloadBtn.addEventListener("click", () => {
    const filename = slugifyFilename(sequence.sequence_name, "sequence") + ".txt";
    downloadTextFile(filename, sequenceToText(sequence));
  });
  card.appendChild(downloadBtn);

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
    renderMathIn(valueEl);
  } else {
    valueEl.textContent = value || "";
  }
  section.appendChild(labelEl);
  section.appendChild(valueEl);
  return section;
}

// --------------------------------------------------------------
// Typewriter effect — only auto-scrolls while the user is already
// at (or near) the bottom of the chat log.
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
    } else {
      // Only render math once typing is fully done — mid-typing LaTeX
      // is incomplete and would flash broken output.
      renderMathIn(el);
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
// Math rendering — KaTeX auto-render, applied after markdown has
// already turned the raw text into HTML. Safe to call before the
// KaTeX scripts have finished loading; it just does nothing.
// --------------------------------------------------------------
function renderMathIn(el) {
  if (!window.renderMathInElement) return;
  try {
    window.renderMathInElement(el, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
  } catch (error) {
    console.error("KaTeX render failed:", error);
  }
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
  // Pull multi-line display-math blocks ($$...$$ or \[...\]) out before
  // the line-by-line paragraph splitting below runs, otherwise each line
  // gets its own <p> and KaTeX never sees the opening and closing
  // delimiter together. Each block is swapped for a single-line
  // placeholder, then restored right before returning.
  const mathBlocks = [];
  const withPlaceholders = text.replace(
    /\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$/g,
    (match) => {
      mathBlocks.push(match);
      return `@@MATH_BLOCK_${mathBlocks.length - 1}@@`;
    }
  );

  const escaped = withPlaceholders
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const withBreaks = escaped.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  const withBold = withBreaks.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const lines = withBold.split("\n");
  let html = "";
  let listType = null;
  let inQuote = false;

  function closeList() {
    if (listType) {
      html += listType === "ol" ? "</ol>" : "</ul>";
      listType = null;
    }
  }

  function closeQuote() {
    if (inQuote) {
      html += "</blockquote>";
      inQuote = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("|") && isTableSeparatorLine(lines[i + 1] || "")) {
      closeList();
      closeQuote();

      const headerCells = splitTableCells(line);
      html += "<table><thead><tr>";
      headerCells.forEach(cell => { html += `<th>${cell}</th>`; });
      html += "</tr></thead><tbody>";

      i += 2; // skip the header row and the |---|---| separator row
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const rowCells = splitTableCells(lines[i]);
        html += "<tr>";
        rowCells.forEach(cell => { html += `<td>${cell}</td>`; });
        html += "</tr>";
        i++;
      }
      i--; // back up one — the for-loop's own i++ will advance past it

      html += "</tbody></table>";
      continue;
    }

    const headingMatch = line.match(/^\s*(#{1,4})\s+(.*)/);
    const quoteMatch = line.match(/^\s*&gt;\s?(.*)/); // matches &gt; since escaping already ran
    const numberedMatch = line.match(/^\s*\d+[\.\)]\s+(.*)/);
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)/);

    if (headingMatch) {
      closeList();
      closeQuote();
      const level = Math.min(headingMatch[1].length + 2, 4);
      html += `<h${level}>${headingMatch[2]}</h${level}>`;
    } else if (quoteMatch) {
      closeList();
      if (!inQuote) { html += "<blockquote>"; inQuote = true; }
      html += quoteMatch[1] ? `<p>${quoteMatch[1]}</p>` : "<br>";
    } else if (numberedMatch) {
      closeQuote();
      if (listType !== "ol") { closeList(); html += "<ol>"; listType = "ol"; }
      html += `<li>${numberedMatch[1]}</li>`;
    } else if (bulletMatch) {
      closeQuote();
      if (listType !== "ul") { closeList(); html += "<ul>"; listType = "ul"; }
      html += `<li>${bulletMatch[1]}</li>`;
    } else if (line.trim() === "") {
      closeList();
      closeQuote();
    } else {
      closeList();
      closeQuote();
      html += `<p>${line}</p>`;
    }
  }
  closeList();
  closeQuote();

  let result = html;
  mathBlocks.forEach((block, i) => {
    const escapedBlock = block
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    result = result.split(`@@MATH_BLOCK_${i}@@`).join(escapedBlock);
  });

  return result;
}

// --------------------------------------------------------------
// Loading state — the send button doubles as a stop button while a
// request is in flight, with a spinning ring drawn by CSS (see
// #sendBtn.loading in style.css).
// --------------------------------------------------------------
function setLoading(isLoading) {
  userInput.disabled = isLoading;
  sendBtn.classList.toggle("loading", isLoading);
  sendBtn.textContent = isLoading ? "■" : "↑";
  sendBtn.setAttribute("aria-label", isLoading ? "Stop response" : "Send");
}

function autoGrow() {
  userInput.style.height = "auto";
  void userInput.offsetHeight; // forces a reflow so scrollHeight isn't stale on iOS Safari
  const maxHeight = window.innerHeight * 0.4;
  userInput.style.height = Math.min(userInput.scrollHeight, maxHeight) + "px";
}

function getActiveSession() {
  if (isPrivateMode) {
    return (privateSession && privateSession.id === activeId) ? privateSession : null;
  }
  return sessions.find(s => s.id === activeId) || null;
}

// --------------------------------------------------------------
// Initial render — greeting shows immediately for guests, before
// onAuthStateChange even resolves.
// --------------------------------------------------------------
renderActiveChat();
renderToolsPopupState();
restoreDraft();
