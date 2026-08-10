// ============================================================
// ATM Assistant — Stage 1 (general chatbot, marketing-leaning)
//
// The key idea in this version: instead of forcing every message
// into a fixed template (like "write subject lines"), we give the
// AI a SYSTEM INSTRUCTION once, at setup. That's a standing rule
// that shapes how it behaves for the whole conversation, no matter
// what the user types — similar to how Claude is generally strong
// at coding without every single question having to mention code.
// ============================================================

// --------------------------------------------------------------
// STEP 0: Put your free Gemini API key here.
// Get one at https://aistudio.google.com  (no credit card needed)
// --------------------------------------------------------------
const API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE";

const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// This shapes the AI's personality and expertise for the whole chat.
// Edit this text any time to change how it behaves.
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

// --------------------------------------------------------------
// Element references
// --------------------------------------------------------------
const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// This array is the conversation's memory. Every message, from
// both the user and the AI, gets pushed in here, and we send the
// whole thing back to Gemini on every turn so it has context.
const conversationHistory = [];

// --------------------------------------------------------------
// Handle sending a message
// --------------------------------------------------------------
chatForm.addEventListener("submit", handleSend);

// Let Enter submit, but Shift+Enter make a new line
userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

async function handleSend(event) {
  event.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  if (API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
    addMessage("Add your free Gemini API key in script.js first (see the comment at the top of the file).", "status error");
    return;
  }

  // Show the user's message immediately, then clear the box
  addMessage(text, "user");
  conversationHistory.push({ role: "user", parts: [{ text }] });
  userInput.value = "";
  autoGrow();

  setLoading(true);
  const statusEl = addMessage("Thinking…", "status");

  try {
    const reply = await callGeminiAPI();
    statusEl.remove();
    addMessage(reply, "assistant");
    conversationHistory.push({ role: "model", parts: [{ text: reply }] });
  } catch (error) {
    console.error(error);
    statusEl.remove();
    addMessage("Something went wrong reaching the AI. Check your API key and internet connection.", "status error");
  } finally {
    setLoading(false);
  }
}

// --------------------------------------------------------------
// The actual API call. Sends the system instruction once, plus
// the full conversation so far, and returns the AI's reply text.
// --------------------------------------------------------------
async function callGeminiAPI() {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents: conversationHistory
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("No text returned from the API.");
  }

  return rawText.trim();
}

// --------------------------------------------------------------
// Rendering helpers
// --------------------------------------------------------------
function addMessage(text, kind) {
  // kind is one of: "user", "assistant", "status", "status error"
  const wrapper = document.createElement("div");
  wrapper.className = `message ${kind}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatLog.appendChild(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;

  return wrapper;
}

function setLoading(isLoading) {
  sendBtn.disabled = isLoading;
  userInput.disabled = isLoading;
}

// Makes the textarea grow as you type, up to the CSS max-height
userInput.addEventListener("input", autoGrow);
function autoGrow() {
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight + "px";
}
