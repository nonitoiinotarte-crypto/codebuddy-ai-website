const $ = (s) => document.querySelector(s);
const messagesEl = $("#messages");
const welcomeEl = $("#welcome");
const promptEl = $("#prompt");
const sendBtn = $("#sendBtn");
const chatForm = $("#chatForm");
const languageEl = $("#language");
let chat = [];
let mode = "help";
let busy = false;

async function checkStatus() {
  try {
    const r = await fetch("/api/status");
    const data = await r.json();
    $("#statusDot").classList.toggle("ready", data.configured);
    $("#statusText").textContent = data.configured ? "AI connection configured" : "AI API key needed";
  } catch {
    $("#statusText").textContent = "Cannot check AI setup";
  }
}

function escapeHTML(s) {
  return s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
}

// Lightweight Markdown renderer for model replies. HTML is escaped first.
function renderMarkdown(text) {
  let safe = escapeHTML(text);
  safe = safe.replace(/```([\w#+.-]*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><button class="copy-code" type="button">Copy code</button><code>${code.trimEnd()}</code></pre>`);
  safe = safe.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  safe = safe.replace(/^### (.+)$/gm, "<h3>$1</h3>").replace(/^## (.+)$/gm, "<h2>$1</h2>").replace(/^# (.+)$/gm, "<h1>$1</h1>");
  safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  safe = safe.split(/\n{2,}/).map(block => {
    if (/^\s*<(h[1-3]|pre|ul|ol)/.test(block)) return block;
    const lines = block.split("\n");
    if (lines.every(line => /^\s*[-*] /.test(line))) return "<ul>" + lines.map(line => `<li>${line.replace(/^\s*[-*] /, "")}</li>`).join("") + "</ul>";
    if (lines.every(line => /^\s*\d+\. /.test(line))) return "<ol>" + lines.map(line => `<li>${line.replace(/^\s*\d+\. /, "")}</li>`).join("") + "</ol>";
    return "<p>" + block.replace(/\n/g, "<br>") + "</p>";
  }).join("");
  return safe;
}

function addMessage(role, content, isError = false) {
  welcomeEl.classList.add("hidden");
  const row = document.createElement("article");
  row.className = `message ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "Y" : "⌘";
  const body = document.createElement("div");
  body.className = "message-content" + (isError ? " error" : "");
  if (role === "assistant" && !isError) body.innerHTML = renderMarkdown(content);
  else body.textContent = content;
  row.append(avatar, body);
  messagesEl.appendChild(row);
  row.querySelectorAll(".copy-code").forEach(btn => {
    btn.addEventListener("click", async () => {
      const code = btn.parentElement.querySelector("code").innerText;
      try { await navigator.clipboard.writeText(code); btn.textContent = "Copied!"; }
      catch { btn.textContent = "Copy manually"; }
    });
  });
  return row;
}

function selectMode(next) {
  mode = next;
  document.querySelectorAll(".tool").forEach(btn => btn.classList.toggle("active", btn.dataset.mode === mode));
  const hints = {
    help: "Ask CodeBuddy to write, explain, or fix code…",
    generate: "Describe the program or feature you want to build…",
    debug: "Paste your code, error message, and what you expected…",
    explain: "Paste code you want explained step by step…",
    review: "Paste code you want reviewed for bugs and improvements…"
  };
  promptEl.placeholder = hints[mode] || hints.help;
}

async function sendMessage(text) {
  if (busy || !text.trim()) return;
  const content = text.trim();
  chat.push({ role: "user", content });
  addMessage("user", content);
  promptEl.value = "";
  promptEl.style.height = "auto";
  busy = true; sendBtn.disabled = true;
  const loading = addMessage("assistant", "Thinking…");
  loading.querySelector(".message-content").classList.add("typing");
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chat, mode, language: languageEl.value })
    });
    const data = await response.json();
    loading.remove();
    if (!response.ok) {
      addMessage("assistant", data.error || "The request failed. Please try again.", true);
      chat.pop();
    } else {
      chat.push({ role: "assistant", content: data.answer });
      addMessage("assistant", data.answer);
    }
  } catch {
    loading.remove();
    addMessage("assistant", "Could not connect to the server. Check your internet connection and try again.", true);
    chat.pop();
  } finally {
    busy = false; sendBtn.disabled = false; promptEl.focus();
  }
}

chatForm.addEventListener("submit", e => { e.preventDefault(); sendMessage(promptEl.value); });
promptEl.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chatForm.requestSubmit(); }
});
promptEl.addEventListener("input", () => { promptEl.style.height = "auto"; promptEl.style.height = Math.min(promptEl.scrollHeight, 180) + "px"; });
document.querySelectorAll(".tool").forEach(btn => btn.addEventListener("click", () => { selectMode(btn.dataset.mode); $("#sidebar").classList.remove("open"); }));
document.querySelectorAll(".suggestion").forEach(btn => btn.addEventListener("click", () => { promptEl.value = btn.dataset.prompt; promptEl.focus(); promptEl.style.height = "auto"; promptEl.style.height = promptEl.scrollHeight + "px"; }));
function resetChat() { chat = []; messagesEl.innerHTML = ""; welcomeEl.classList.remove("hidden"); }
$("#newChat").addEventListener("click", resetChat);
$("#clearChat").addEventListener("click", resetChat);
$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
checkStatus();