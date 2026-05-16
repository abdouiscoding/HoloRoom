import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { myFetch } from "./api";

/* =========================
   CONFIG
========================= */
const API = "https://control-parole-grandkid.ngrok-free.dev";

/* =========================
   AUTH / URL PARAMS / OTHER VARS
========================= */
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const userId = params.get("userId");
let currentProductId = params.get("productId");
let selectedProductId = currentProductId;
let cursorMode = "dot";
let cursorColor = "#ffdd00";
// for the placement system
let placementStatus = "SEARCHING"; // SEARCHING | READY
let requiredPlacement = null; // FLOOR | WALL | CEILING
let snapped = false;
let dragOffset = new THREE.Vector3();
let dragPlaneY = 0;

let interactionEnabled = false;

let detectedPlacement = null;

let uiBlocked = false;

const SURFACE_LABEL = { FLOOR: "floor", WALL: "wall", CEILING: "ceiling" };

document.addEventListener("pointerdown", () => {
  uiBlocked = false;
});

document.addEventListener("pointerup", () => {
  uiBlocked = false;
});

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
  document.body.style.webkitTouchCallout = "none";
});

const authHeaders = token
  ? { Authorization: `Bearer ${token}` }
  : {};

// helper methods
function classifySurface(normal) {
  const up = new THREE.Vector3(0, 1, 0);

  const dot = normal.dot(up);

  if (dot > 0.7) return "FLOOR";
  if (dot < -0.7) return "CEILING";
  return "WALL";
}

  /* =====================================================
   LOADING SCREEN
===================================================== */
const loadingScreen = document.createElement("div");
loadingScreen.style.cssText = `
position:fixed;
inset:0;
background:linear-gradient(180deg,#050505,#111);
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
z-index:999999;
font-family:Arial,sans-serif;
color:white;
`;

loadingScreen.innerHTML = `
<div style="width:min(420px,90vw);text-align:center;">
  <h1 style="margin:0 0 10px;font-size:34px;">HoloRoom AR</h1>
  <p id="loadingText" style="margin:0 0 18px;opacity:.8;">Preparing...</p>

  <div style="
      width:100%;
      height:16px;
      background:#1f1f1f;
      border-radius:999px;
      overflow:hidden;
      border:1px solid rgba(255,255,255,.08);
  ">
      <div id="loadingBar" style="
          width:0%;
          height:100%;
          background:linear-gradient(90deg,#00ffff,#0088ff);
          transition:width .2s;
      "></div>
  </div>

  <p id="loadingPercent" style="margin:14px 0 0;font-size:14px;opacity:.7;">0%</p>
</div>
`;

document.body.appendChild(loadingScreen);
loadingScreen.setAttribute("data-ui", "true");

const loadingText = document.getElementById("loadingText");
const loadingBar = document.getElementById("loadingBar");
const loadingPercent = document.getElementById("loadingPercent");

function setLoading(percent, text) {
  const p = Math.max(0, Math.min(100, percent));
  loadingBar.style.width = p + "%";
  loadingPercent.textContent = Math.floor(p) + "%";
  if (text) loadingText.textContent = text;
}

function showLoading(msg = "Loading...") {
  loadingScreen.style.display = "flex";
  loadingScreen.style.opacity = "1";
  setLoading(0, msg);
}

function hideLoading() {
  loadingScreen.style.opacity = "0";
  loadingScreen.style.transition = "opacity .35s";

  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 350);
}

const viewerOverlay = document.createElement("div");

viewerOverlay.style.cssText = `
position:fixed;
inset:0;
background:rgba(0,0,0,.75);
backdrop-filter:blur(10px);
display:none;
justify-content:center;
align-items:center;
z-index:1000000;
`;

viewerOverlay.innerHTML = `
<div style="
  width:75vw;
  height:75vh;
  background:#111;
  border-radius:20px;
  padding:20px;
  display:flex;
  flex-direction:column;
  gap:10px;
">

  <div style="display:flex;justify-content:space-between;align-items:center;">
    <h2 style="color:white;margin:0;">3D Model Viewer</h2>
    <button id="closeViewerBtn" style="
      padding:8px 14px;
      border:none;
      border-radius:10px;
      background:#ff4d6d;
      color:white;
      font-weight:bold;
      cursor:pointer;
    ">X</button>
  </div>

  <model-viewer
    id="modelViewer"
    style="width:100%;height:100%;background:#000;border-radius:12px;"
    camera-controls
    auto-rotate
  ></model-viewer>

</div>
`;

document.body.appendChild(viewerOverlay);
viewerOverlay.setAttribute("data-ui", "true");

function showXRUnsupportedPopup() {
  const overlay = document.createElement("div");

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.6);
    backdrop-filter: blur(12px);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:9999999;
    font-family:Arial;
  `;

  overlay.innerHTML = `
    <div style="
      background:#111;
      padding:30px;
      border-radius:16px;
      text-align:center;
      color:white;
      width:min(400px,90vw);
      border:1px solid rgba(255,255,255,0.1);
    ">
      <h2 style="margin-bottom:10px;">WebXR Not Supported</h2>
      <p style="opacity:0.8; margin-bottom:20px;">
        Your device does not support AR mode.  
        You can still view the 3D model.
      </p>

      <div style="display:flex;justify-content:center;gap:10px;">
        <button id="goBackBtn" style="
          padding:10px 16px;
          border:none;
          border-radius:10px;
          cursor:pointer;
          background:#00ffff;
          color:#000;
          font-weight:bold;
        ">Go Back</button>

        <button id="show3dBtn" style="
          padding:10px 16px;
          border:none;
          border-radius:10px;
          cursor:pointer;
          background:#444;
          color:white;
          font-weight:bold;
        ">View 3D</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const goBackBtn = overlay.querySelector("#goBackBtn");
  const show3dBtn = overlay.querySelector("#show3dBtn");

  goBackBtn.onclick = () => {
    window.location.href = `https://holoroom-front.vercel.app/shop`;
  };

  show3dBtn.onclick = () => {
    overlay.remove();

    modelViewer.src = productData.p3DModel;
    viewerOverlay.style.display = "flex";
  };
}

const closeViewerBtn = document.getElementById("closeViewerBtn");
const modelViewer = document.getElementById("modelViewer");

closeViewerBtn.onclick = () => {
    window.location.href = `https://holoroom-front.vercel.app/shop`;
  };

async function checkWebXR() {
  const supported = await navigator.xr?.isSessionSupported?.("immersive-ar");

  return supported;
}
/* =========================
   STATE
========================= */
const objects = [];
let selectedObject = null;
let dragging = false;

let productCardsVisible = true;
let productData = null;
let productModelTemplate = null;
let currentColorIndex = 0;
let allProducts = [];
let menuScroll = 0;

let hitTestSource = null;
let referenceSpace = null;

/* =========================
   THREE
========================= */
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  70,
  innerWidth / innerHeight,
  0.01,
  100
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(2, 4, 2);
scene.add(dir);

/* =========================
   AR BUTTON
========================= */
const arBtn = ARButton.createButton(renderer, {
  requiredFeatures: ["hit-test"],
  optionalFeatures: ["dom-overlay"],
  domOverlay: { root: document.body }
});
document.body.appendChild(arBtn);

// dark themed body so the page isn't blank
document.body.style.cssText = `
  margin: 0;
  background: radial-gradient(circle at 50% 40%, #1a1a22 0%, #050505 70%);
  min-height: 100vh;
  font-family: Arial, sans-serif;
  overflow: hidden;
`;

// intro panel
const intro = document.createElement("div");
intro.id = "arIntro";
intro.setAttribute("data-ui", "true");
intro.style.cssText = `
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 24px;
  pointer-events: none;
  z-index: 5;
  color: white; text-align: center;
`;
intro.innerHTML = `
  <h1 style="font-size:clamp(28px,8vw,44px);margin:0 0 12px;background:linear-gradient(135deg,#00ffff,#0088ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">HoloRoom AR</h1>
  <p style="opacity:.6;margin:0 0 28px;max-width:320px;line-height:1.5;font-size:15px;">
    Tap below to place this product in your room.
  </p>
`;
document.body.appendChild(intro);

// move the AR button INTO the intro container
intro.appendChild(arBtn);

// flex child — no absolute positioning fight
arBtn.style.cssText = `
  position: static !important;
  margin: 0 !important;
  padding: 16px 36px !important;
  border: none !important;
  border-radius: 999px !important;
  background: linear-gradient(135deg, #00ffff 0%, #0088ff 100%) !important;
  color: #001218 !important;
  font-size: 17px !important;
  font-weight: 700 !important;
  letter-spacing: .3px !important;
  cursor: pointer !important;
  box-shadow: 0 12px 36px rgba(0,200,255,.45) !important;
  pointer-events: auto !important;
`;

/* =========================
   RETICLE (GROUND SNAP)
========================= */
const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.014, 0.022, 32), // much smaller
  new THREE.MeshBasicMaterial({
    color: cursorColor,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    depthTest: false
  })
);

reticle.rotation.x = -Math.PI / 2;
reticle.renderOrder = 9999;
reticle.matrixAutoUpdate = false;
reticle.visible = false;
scene.add(reticle);

/* =========================
   DOM UI
========================= */
const ui = document.createElement("div");
ui.style.cssText = `
position:fixed;
inset:0;
pointer-events:none;
z-index:9999;
display:none;
font-family:Arial,sans-serif;
`;
document.body.appendChild(ui);
ui.id = "arUi";
ui.setAttribute("data-ui", "true");

function makeBtn(txt) {
  const b = document.createElement("button");
  b.innerText = txt;
  b.style.cssText = `
  position:absolute;
  pointer-events:auto;
  padding:14px 18px;
  border:none;
  border-radius:18px;
  background:rgba(20,20,25,.82);
  backdrop-filter:blur(14px);
  color:#fff;
  font-weight:700;
  display:flex;
  align-items:center;
  gap:10px;
  font-size:15px;
  border:1px solid rgba(255,255,255,.08);
  box-shadow:0 10px 30px rgba(0,0,0,.35);
  transition:.18s;
  transform-origin:center;
  user-select:none;
  -webkit-user-select:none;
  touch-action: manipulation;
  `;
  ui.appendChild(b);
  return b;
}

// chatbotbtn
const chatbotBtn = document.createElement("button");
chatbotBtn.innerHTML = `
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <circle cx="9" cy="10" r="1" fill="currentColor"/>
    <circle cx="12" cy="10" r="1" fill="currentColor"/>
    <circle cx="15" cy="10" r="1" fill="currentColor"/>
  </svg>
`;
chatbotBtn.style.cssText = `
  position:absolute;
  top:80px;
  right:18px;
  width:54px;
  height:54px;
  border:none;
  border-radius:50%;
  background:linear-gradient(135deg,#00ffff 0%,#0088ff 100%);
  color:#001218;
  cursor:pointer;
  pointer-events:auto;
  display:flex;
  justify-content:center;
  align-items:center;
  box-shadow:0 8px 24px rgba(0,200,255,.4), 0 2px 6px rgba(0,0,0,.4);
  z-index:9999;
  transition:transform .15s;
`;
chatbotBtn.onpointerdown = () => (chatbotBtn.style.transform = "scale(.92)");
chatbotBtn.onpointerup = () => (chatbotBtn.style.transform = "scale(1)");
ui.appendChild(chatbotBtn);

/* =========================
   AR CHATBOT + TTS
========================= */
let chatHistory = []; // [{ role, text }, ...]
let ttsEnabled = true;

function speak(text) {
  if (!ttsEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05;
  u.pitch = 1;
  u.volume = 1;
  // try to pick an English voice
  const voices = window.speechSynthesis.getVoices();
  const en = voices.find(v => v.lang?.startsWith("en"));
  if (en) u.voice = en;
  window.speechSynthesis.speak(u);
}

async function handleVoiceQuestion(question) {
  popup("🎤 " + question);
  try {
    const res = await myFetch(`${API}/api/chat/ar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        history: chatHistory.slice(-10),
      }),
    });
    const data = await res.json();
    const reply = data.reply || "Sorry, I didn't get that.";
    chatHistory.push({ role: "user", text: question });
    chatHistory.push({ role: "assistant", text: reply });
    speak(reply);
  } catch (e) {
    console.error(e);
  }
}

function rerenderChatIfOpen() {
  const messagesEl = document.getElementById("arChatMessages");
  if (!messagesEl) return;
  messagesEl.innerHTML = chatHistory.map(m => {
    const isUser = m.role === "user";
    return `
      <div style="
        align-self:${isUser ? "flex-end" : "flex-start"};
        max-width:80%;
        background:${isUser ? "#00ffff" : "#1f1f1f"};
        color:${isUser ? "#000" : "#fff"};
        padding:10px 14px; border-radius:14px;
        line-height:1.4; font-size:15px;
        word-wrap:break-word;
      ">${m.text.replace(/</g, "&lt;")}</div>
    `;
  }).join("");
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showChatPopup() {
  const existing = document.getElementById("arChatPopup");
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement("div");
  overlay.id = "arChatPopup";
  overlay.setAttribute("data-ui", "true");
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:99999999;
    background:rgba(0,0,0,.55); backdrop-filter:blur(8px);
    display:flex; align-items:flex-end; justify-content:center;
    font-family:Arial,sans-serif;
  `;

  const card = document.createElement("div");
  card.style.cssText = `
    width:min(560px,96vw);
    height:85dvh;
    max-height:85dvh;
    background:#111;
    border-radius:24px 24px 0 0;
    border:1px solid rgba(255,255,255,.08);
    display:flex; flex-direction:column;
    overflow:hidden;
  `;
  card.onclick = (e) => e.stopPropagation();

  function syncHeight() {
    if (!window.visualViewport) return;
    card.style.height = (window.visualViewport.height - 20) + "px";
  }
  function closePopup() {
    window.speechSynthesis?.cancel();
    window.visualViewport?.removeEventListener("resize", syncHeight);
    window.visualViewport?.removeEventListener("scroll", syncHeight);
    overlay.remove();
  }
  overlay.onclick = closePopup;

  window.visualViewport?.addEventListener("resize", syncHeight);
  window.visualViewport?.addEventListener("scroll", syncHeight);
  syncHeight();

  const header = document.createElement("div");
  header.style.cssText = `
    display:flex; justify-content:space-between; align-items:center;
    padding:16px 20px; border-bottom:1px solid rgba(255,255,255,.06);
    color:white; flex-shrink:0;
  `;
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#00ffff,#0088ff);display:flex;justify-content:center;align-items:center;color:#001218;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div>
        <div style="font-weight:700;">HoloRoom Assistant</div>
        <div style="font-size:12px;opacity:.6;">Tap the mic to speak, or type below</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;">
      <button id="arTtsToggle" style="
        padding:8px 12px;border:none;border-radius:10px;
        background:${ttsEnabled ? "#00ffff" : "#333"};
        color:${ttsEnabled ? "#000" : "#fff"};font-weight:700;cursor:pointer;
      ">${ttsEnabled ? "🔊" : "🔇"}</button>
      <button id="arChatClose" style="
        width:38px;height:38px;border:none;border-radius:10px;
        background:#ff4d6d;color:white;cursor:pointer;font-weight:bold;
      ">✕</button>
    </div>
  `;

  const messages = document.createElement("div");
  messages.id = "arChatMessages";
  messages.style.cssText = `
    flex:1; overflow-y:auto; padding:18px;
    display:flex; flex-direction:column; gap:10px;
    color:white; min-height:0;
  `;

  if (chatHistory.length === 0) {
    messages.innerHTML = `
      <div style="text-align:center;opacity:.6;padding:40px 20px;">
        Ask me how to place items, get design tips, or anything about this product.
      </div>
    `;
  }

  const inputBar = document.createElement("div");
  inputBar.style.cssText = `
    padding:14px; border-top:1px solid rgba(255,255,255,.06);
    display:flex; gap:10px; flex-shrink:0; background:#111;
  `;
  inputBar.innerHTML = `
    <input id="arChatInput" placeholder="Type your question..." style="
      flex:1; padding:12px 16px; border-radius:14px;
      border:1px solid rgba(255,255,255,.1);
      background:#1a1a1a; color:white; font-size:15px; outline:none;
    "/>
    <button id="arChatSend" style="
      padding:12px 22px; border:none; border-radius:14px;
      background:#00ffff; color:#000; font-weight:700; cursor:pointer;
    ">Send</button>
  `;

  card.appendChild(header);
  card.appendChild(messages);
  card.appendChild(inputBar);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Now that elements are in DOM, wire them up
  const input = document.getElementById("arChatInput");
  const sendBtn = document.getElementById("arChatSend");
  const closeBtn = document.getElementById("arChatClose");
  const ttsBtn = document.getElementById("arTtsToggle");

  closeBtn.onclick = closePopup;

  ttsBtn.onclick = () => {
    ttsEnabled = !ttsEnabled;
    ttsBtn.style.background = ttsEnabled ? "#00ffff" : "#333";
    ttsBtn.style.color = ttsEnabled ? "#000" : "#fff";
    ttsBtn.textContent = ttsEnabled ? "🔊" : "🔇";
    if (!ttsEnabled) window.speechSynthesis?.cancel();
  };

  rerenderChatIfOpen();

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    chatHistory.push({ role: "user", text });
    input.value = "";
    rerenderChatIfOpen();

    const typing = document.createElement("div");
    typing.style.cssText = `align-self:flex-start;background:#1f1f1f;color:#aaa;padding:10px 14px;border-radius:14px;font-size:15px;`;
    typing.textContent = "...";
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await myFetch(`${API}/api/chat/ar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: chatHistory.slice(-10, -1) }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I didn't get that.";
      typing.remove();
      chatHistory.push({ role: "assistant", text: reply });
      rerenderChatIfOpen();
      speak(reply);
    } catch (e) {
      console.error(e);
      typing.remove();
      chatHistory.push({ role: "assistant", text: "Couldn't reach the assistant." });
      rerenderChatIfOpen();
    }
  }

  sendBtn.onclick = send;
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
}

// hook the existing button
chatbotBtn.onclick = showChatPopup;

/* =========================
   MIC PUSH-TO-TALK
========================= */
const MIC_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="2" width="6" height="13" rx="3"/>
    <path d="M19 11v1a7 7 0 0 1-14 0v-1"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
`;
const STOP_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
`;

// pulse animation style
const micStyle = document.createElement("style");
micStyle.textContent = `
  @keyframes micPulse {
    0%, 100% { box-shadow: 0 6px 18px rgba(255,77,109,.5); }
    50%      { box-shadow: 0 6px 18px rgba(255,77,109,.95), 0 0 0 8px rgba(255,77,109,.18); }
  }
`;
document.head.appendChild(micStyle);

const micBtn = document.createElement("button");
micBtn.innerHTML = MIC_SVG;
micBtn.style.cssText = `
  position:absolute;
  top:144px;
  right:24px;
  width:42px;
  height:42px;
  border:none;
  border-radius:50%;
  background:linear-gradient(135deg,#ff6b8a 0%,#ff4d6d 100%);
  color:white;
  cursor:pointer;
  pointer-events:auto;
  display:flex;
  justify-content:center;
  align-items:center;
  box-shadow:0 6px 18px rgba(255,77,109,.5), 0 2px 4px rgba(0,0,0,.3);
  z-index:9999;
  transition:transform .15s, background .15s;
`;
ui.appendChild(micBtn);

let recordRecognition = null;
let isRecording = false;
let silenceTimer = null;
let lastSpeechTime = 0;
let accumulatedText = "";

function setMicState(recording) {
  isRecording = recording;
  micBtn.innerHTML = recording ? STOP_SVG : MIC_SVG;
  if (recording) {
    micBtn.style.background = "linear-gradient(135deg,#ff0040 0%,#cc0033 100%)";
    micBtn.style.animation = "micPulse 1.4s infinite";
  } else {
    micBtn.style.background = "linear-gradient(135deg,#ff6b8a 0%,#ff4d6d 100%)";
    micBtn.style.animation = "none";
  }
}

function startRecording() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    popup("Voice not supported on this device");
    return;
  }

  recordRecognition = new SR();
  recordRecognition.continuous = true;
  recordRecognition.interimResults = true;
  recordRecognition.lang = "en-US";

  accumulatedText = "";
  lastSpeechTime = Date.now();

  recordRecognition.onresult = (event) => {
    lastSpeechTime = Date.now();
    let finalText = "";
    for (let i = 0; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript + " ";
      }
    }
    accumulatedText = finalText.trim();
  };

  recordRecognition.onerror = (e) => {
    console.log("rec error:", e.error);
    if (e.error === "not-allowed") popup("Microphone permission denied");
    cleanupRecording();
  };

  recordRecognition.onend = () => {
    cleanupRecording();
    const text = accumulatedText.trim();
    if (text.length > 0) sendVoiceMessage(text);
  };

  try {
    recordRecognition.start();
    setMicState(true);

    // auto-stop after 2.5s of silence
    silenceTimer = setInterval(() => {
      if (Date.now() - lastSpeechTime > 2500) {
        stopRecording();
      }
    }, 300);
  } catch (e) {
    console.error(e);
    cleanupRecording();
  }
}

function stopRecording() {
  if (recordRecognition) {
    try { recordRecognition.stop(); } catch (e) {}
  }
}

function cleanupRecording() {
  setMicState(false);
  if (silenceTimer) { clearInterval(silenceTimer); silenceTimer = null; }
  recordRecognition = null;
}

micBtn.onclick = (e) => {
  e.stopPropagation();
  if (isRecording) stopRecording();
  else startRecording();
};

async function sendVoiceMessage(text) {
  popup("🎤 " + text);
  chatHistory.push({ role: "user", text });
  rerenderChatIfOpen();

  // show typing indicator if popup is open
  const messagesEl = document.getElementById("arChatMessages");
  let typing = null;
  if (messagesEl) {
    typing = document.createElement("div");
    typing.style.cssText = `align-self:flex-start;background:#1f1f1f;color:#aaa;padding:10px 14px;border-radius:14px;font-size:15px;`;
    typing.textContent = "...";
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  try {
    const res = await myFetch(`${API}/api/chat/ar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: chatHistory.slice(-10, -1) }),
    });
    const data = await res.json();
    const reply = data.reply || "Sorry, I didn't get that.";
    typing?.remove();
    chatHistory.push({ role: "assistant", text: reply });
    rerenderChatIfOpen();
    speak(reply);
  } catch (e) {
    console.error(e);
    typing?.remove();
    chatHistory.push({ role: "assistant", text: "Couldn't reach the assistant." });
    rerenderChatIfOpen();
  }
}

// buttons
const addBtn = makeBtn("Add");
addBtn.style.bottom = "30px";
addBtn.style.left = "50%";
addBtn.style.transform = "translateX(-50%)";

const toggleCardsBtn = makeBtn("!");
toggleCardsBtn.style.bottom = "120px";
toggleCardsBtn.style.right = "18px";

toggleCardsBtn.title = "Show / hide product cards";

const rotateLeftBtn = makeBtn("⟲");
rotateLeftBtn.style.bottom = "120px";
rotateLeftBtn.style.left = "18px";

const rotateRightBtn = makeBtn("⟳");
rotateRightBtn.style.bottom = "180px";
rotateRightBtn.style.left = "18px";

const dragBtn = makeBtn("Drag");
dragBtn.style.bottom = "240px";
dragBtn.style.left = "18px";

dragBtn.title = "Hold to drag the selected product";

const removeBtn = makeBtn("Remove");
removeBtn.style.bottom = "300px";
removeBtn.style.left = "18px";

const productsBtn = makeBtn("Products");   
productsBtn.style.top = "18px";
productsBtn.style.left = "18px";

const menuBtn = makeBtn("☰");
menuBtn.style.top = "18px";
menuBtn.style.right = "18px";

menuBtn.onclick = () => {
  showMainMenuPopup();
};

toggleCardsBtn.onclick = () => {
  productCardsVisible = !productCardsVisible;
  updateHUDVisibility();
  popup(
    productCardsVisible
      ? "Displaying product cards"
      : "Hiding product cards"
  );
};

let rotateLeftHeld = false;
let rotateRightHeld = false;

function setupHoldRotation(btn, dir) {

  btn.addEventListener("pointerdown", () => {

  if (!selectedObject) {
    popup("Select an object first");
    return;
  }

  if (dir === "left") rotateLeftHeld = true;
  else rotateRightHeld = true;
});

  btn.addEventListener("pointerup", () => {
    rotateLeftHeld = false;
    rotateRightHeld = false;
  });

  btn.addEventListener("pointerleave", () => {
    rotateLeftHeld = false;
    rotateRightHeld = false;
  });
}

setupHoldRotation(rotateLeftBtn, "left");
setupHoldRotation(rotateRightBtn, "right");

dragBtn.addEventListener("pointerdown", (event) => {

  event.stopPropagation();

  if (!selectedObject) {
    popup("Select an object first");
    return;
  }

  dragOffset.set(
    selectedObject.position.x - reticle.position.x,
    0,
    selectedObject.position.z - reticle.position.z
  );

  dragging = true;
});

["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
  dragBtn.addEventListener(evt, () => {
    dragging = false;
  });
});

/* =========================
   UNIVERSAL POPUP
========================= */
function showPopup({
  mode = "ok", // ok | confirm
  title = "Popup",
  text = "",
  onConfirm = null
}) {
  // remove old popup if exists
  const old = document.getElementById("arPopupOverlay");

  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "arPopupOverlay";
  overlay.setAttribute("data-ui", "true");

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.6);
    backdrop-filter:blur(10px);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:99999999;
    font-family:Arial,sans-serif;
  `;

  const card = document.createElement("div");

  card.style.cssText = `
    width:min(420px,90vw);
    background:#111;
    border-radius:22px;
    padding:28px;
    color:white;
    border:1px solid rgba(255,255,255,.08);
    box-shadow:0 20px 60px rgba(0,0,0,.45);
    animation:popupShow .18s ease;
  `;

  /* TITLE */
  const h = document.createElement("h2");

  h.innerText = title;

  h.style.cssText = `
    margin:0 0 14px;
    font-size:28px;
  `;

  /* TEXT */
  const p = document.createElement("p");

  p.innerText = text;

  p.style.cssText = `
    margin:0;
    opacity:.82;
    line-height:1.5;
    font-size:16px;
  `;

  /* ACTIONS */
  const actions = document.createElement("div");

  actions.style.cssText = `
    display:flex;
    gap:12px;
    margin-top:28px;
    justify-content:center;
  `;

  /* BUTTON HELPER */
  function makePopupBtn(label, bg, color = "#fff") {
    const btn = document.createElement("button");

    btn.innerText = label;

    btn.style.cssText = `
      padding:12px 22px;
      border:none;
      border-radius:14px;
      background:${bg};
      color:${color};
      font-weight:700;
      cursor:pointer;
      min-width:110px;
      transition:.15s;
      user-select:none;
      -webkit-user-select:none;
      touch-action: manipulation;
    `;

    btn.onmouseenter = () => {
      btn.style.transform = "scale(1.04)";
    };

    btn.onmouseleave = () => {
      btn.style.transform = "scale(1)";
    };

    return btn;
  }

  /* =========================
     OK MODE
  ========================= */
  if (mode === "ok") {
    const okBtn = makePopupBtn(
      "OK",
      "#00ffff",
      "#000"
    );

    okBtn.onclick = () => {
      overlay.remove();
    };

    actions.appendChild(okBtn);
  }

  /* =========================
     CONFIRM MODE
  ========================= */
  if (mode === "confirm") {
    const confirmBtn = makePopupBtn(
      "Confirm",
      "#00ffff",
      "#000"
    );

    const cancelBtn = makePopupBtn(
      "Cancel",
      "#2b2b2b"
    );

    confirmBtn.onclick = () => {
      overlay.remove();

      if (onConfirm) {
        onConfirm();
      }
    };

    cancelBtn.onclick = () => {
      overlay.remove();
    };

    actions.appendChild(confirmBtn);
    actions.appendChild(cancelBtn);
  }

  card.appendChild(h);
  card.appendChild(p);
  card.appendChild(actions);

  overlay.appendChild(card);

  document.body.appendChild(overlay);
}

/* =========================
    MAIN MENU POPUP
========================= */
function showMainMenuPopup() {

  const old = document.getElementById("mainMenuPopup");

  if (old) old.remove();

  const overlay = document.createElement("div");

  overlay.id = "mainMenuPopup";
  overlay.setAttribute("data-ui", "true");

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.6);
    backdrop-filter:blur(10px);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:99999999;
  `;

  const card = document.createElement("div");

  card.style.cssText = `
    width:min(340px,90vw);
    background:#111;
    border-radius:24px;
    padding:24px;
    display:flex;
    flex-direction:column;
    gap:14px;
    border:1px solid rgba(255,255,255,.08);
  `;

  overlay.onclick = () => {
    overlay.remove();
  };

  card.onclick = (e) => {
    e.stopPropagation();
  };

  function makeOption(label) {

    const btn = document.createElement("button");

    btn.innerText = label;

    btn.style.cssText = `
      padding:18px;
      border:none;
      border-radius:16px;
      background:#1f1f1f;
      color:white;
      font-size:17px;
      font-weight:700;
      cursor:pointer;
      user-select:none;
      -webkit-user-select:none;
      touch-action: manipulation;
    `;

    return btn;
  }

  const settingsBtn = makeOption("Settings");
  const exitBtn = makeOption("Exit");

  settingsBtn.onclick = () => {
    overlay.remove();
    showSettingsPopup();
  };

  exitBtn.onclick = () => {

    overlay.remove();

    showPopup({
      mode: "confirm",
      title: "Exit AR",
      text: "Are you sure you want to leave AR mode?",
      onConfirm: () => {
        window.location.href =
          "https://holoroom-front.vercel.app/shop";
      }
    });
  };

  card.appendChild(settingsBtn);
  card.appendChild(exitBtn);

  overlay.appendChild(card);

  document.body.appendChild(overlay);
}

/* =========================
    SETTINGS POPUP
========================= */

function showSettingsPopup() {

  const old = document.getElementById("settingsPopup");

  if (old) old.remove();

  const overlay = document.createElement("div");

  overlay.id = "settingsPopup";
  overlay.setAttribute("data-ui", "true");

  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.7);
    backdrop-filter:blur(12px);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:999999999;
    font-family:Arial;
    padding:18px;
  `;

  // CLOSE WHEN CLICKING OUTSIDE
  overlay.onclick = () => {
    overlay.remove();
  };

  const card = document.createElement("div");

  card.style.cssText = `
    width:min(95vw,520px);
    background:#111;
    border-radius:24px;
    overflow:hidden;
    border:1px solid rgba(255,255,255,.08);
    color:white;
  `;

  // STOP OUTSIDE CLICK
  card.onclick = (e) => {
    e.stopPropagation();
  };

  /* =========================
      TOP BAR
  ========================= */
  const topBar = document.createElement("div");

  topBar.style.cssText = `
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:18px;
    border-bottom:1px solid rgba(255,255,255,.06);
  `;

  const tabs = document.createElement("div");

  tabs.style.cssText = `
    display:flex;
    gap:10px;
  `;

  function createTab(name) {
    const btn = document.createElement("button");

    btn.innerText = name;

    btn.style.cssText = `
      padding:10px 14px;
      border:none;
      border-radius:12px;
      background:#1f1f1f;
      color:white;
      cursor:pointer;
      font-weight:700;
    `;

    return btn;
  }

  const cursorTab = createTab("Cursor");
  const chatbotTab = createTab("Chatbot");

  const closeBtn = document.createElement("button");

  closeBtn.innerText = "✕";

  closeBtn.style.cssText = `
    width:42px;
    height:42px;
    border:none;
    border-radius:12px;
    background:#ff4d6d;
    color:white;
    font-size:18px;
    cursor:pointer;
    font-weight:bold;
  `;

  closeBtn.onclick = () => {
    overlay.remove();
  };

  tabs.appendChild(cursorTab);
  tabs.appendChild(chatbotTab);

  topBar.appendChild(tabs);
  topBar.appendChild(closeBtn);

  /* =========================
      CONTENT
  ========================= */
  const content = document.createElement("div");

  content.style.cssText = `
    padding:22px;
  `;

  function renderCursorSettings() {

    content.innerHTML = `
      <h2 style="margin-top:0;">Cursor Settings</h2>
    `;

    /* CURSOR TYPE */
    const modeTitle = document.createElement("div");

    modeTitle.innerText = "Cursor";

    modeTitle.style.cssText = `
      margin-top:20px;
      margin-bottom:12px;
      font-weight:bold;
      opacity:.9;
    `;

    content.appendChild(modeTitle);

    const modes = document.createElement("div");

    modes.style.cssText = `
      display:flex;
      gap:10px;
      flex-wrap:wrap;
    `;

    function modeBtn(label, mode) {

      const b = document.createElement("button");

      b.innerText = label;

      b.style.cssText = `
        padding:12px 18px;
        border:none;
        border-radius:14px;
        background:#1f1f1f;
        color:white;
        cursor:pointer;
        font-weight:700;
      `;

      b.onclick = () => {

        cursorMode = mode;

        reticle.geometry.dispose();

        if (mode === "dot") {

          reticle.geometry =
            new THREE.SphereGeometry(0.01, 32, 32);

        } else {

          reticle.geometry =
            new THREE.RingGeometry(0.014, 0.022, 32);

          reticle.rotation.x = -Math.PI / 2;
        }
      };

      return b;
    }

    modes.appendChild(modeBtn("Dot", "dot"));
    modes.appendChild(modeBtn("Circle", "circle"));

    content.appendChild(modes);

    /* COLOR */
    const colorTitle = document.createElement("div");

    colorTitle.innerText = "Color";

    colorTitle.style.cssText = `
      margin-top:24px;
      margin-bottom:12px;
      font-weight:bold;
      opacity:.9;
    `;

    content.appendChild(colorTitle);

    const colorInput = document.createElement("input");

    colorInput.type = "color";

    colorInput.value = cursorColor;

    colorInput.style.cssText = `
      width:80px;
      height:50px;
      border:none;
      background:none;
      cursor:pointer;
    `;

    colorInput.oninput = (e) => {

      cursorColor = e.target.value;

      reticle.material.color.set(cursorColor);
    };

    content.appendChild(colorInput);
  }

  function renderChatbotSettings() {

    content.innerHTML = `
      <h2 style="margin-top:0;">Chatbot Settings</h2>

      <p style="opacity:.7;">
        Coming soon...
      </p>
    `;
  }

  cursorTab.onclick = renderCursorSettings;
  chatbotTab.onclick = renderChatbotSettings;

  card.appendChild(topBar);
  card.appendChild(content);

  overlay.appendChild(card);

  document.body.appendChild(overlay);

  renderCursorSettings();
}

/* =========================
   TOAST POPUP
========================= */
function popup(msg) {
  const d = document.createElement("div");
  d.innerText = msg;
  d.style.cssText = `
  position:absolute;
  left:50%;
  bottom:90px;
  transform:translateX(-50%);
  background:rgba(0,0,0,.82);
  color:#fff;
  padding:14px 22px;
  border-radius:30px;
  pointer-events:none;
  font-weight:700;
  border:1px solid #00ffff;
  `;
  ui.appendChild(d);

  setTimeout(() => {
    d.remove();
  }, 2200);
}

let placementToast = null;

function showPlacementToast(text) {
  if (placementToast) placementToast.remove();

  placementToast = document.createElement("div");
  placementToast.innerText = text;

  placementToast.style.cssText = `
    position:absolute;
    left:50%;
    top:150px;
    transform:translateX(-50%);
    background:rgba(0,0,0,.75);
    color:#00ffff;
    padding:12px 18px;
    border-radius:20px;
    font-weight:700;
    z-index:999999999;
    font-family:Arial;
    border:1px solid #00ffff;
  `;

  document.body.appendChild(placementToast);
}

/* =========================
    Product Scaler
========================= */
function applyProductSize(object, targetHeight, targetWidth) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (size.y <= 0) return;

  let scale;
  const wDim = Math.max(size.x, size.z); // model width = bigger of x/z

  if (targetHeight > 0 && targetWidth > 0) {
    // fit both — pick the smaller scale to honor both constraints
    scale = Math.min(targetHeight / size.y, targetWidth / wDim);
  } else if (targetHeight > 0) {
    scale = targetHeight / size.y;
  } else if (targetWidth > 0) {
    scale = targetWidth / wDim;
  } else {
    // fallback default — 1m tall, reasonable for most furniture
    scale = 1.0 / size.y;
  }

  object.scale.setScalar(scale);

  // re-measure, put bottom at y=0, center on xz
  const newBox = new THREE.Box3().setFromObject(object);
  object.position.x -= (newBox.max.x + newBox.min.x) / 2;
  object.position.y -= newBox.min.y;
  object.position.z -= (newBox.max.z + newBox.min.z) / 2;
}

/* =========================
    Selected Object Glow
========================= */

const selectorDot = document.createElement("div");
selectorDot.style.cssText = `
  position:fixed;
  width:14px; height:14px;
  border-radius:50%;
  background:#00ffff;
  box-shadow:0 0 14px #00ffff, 0 0 6px rgba(255,255,255,.5) inset;
  transform:translate(-50%,-50%);
  pointer-events:none;
  z-index:999999999;
  display:none;
`;
document.body.appendChild(selectorDot);

function updateSelectorDot(obj, camera) {
  if (!obj) {
    selectorDot.style.display = "none";
    return;
  }

  const pos = new THREE.Vector3();
  obj.getWorldPosition(pos);

  // anchor between the model top and the HUD card
  const h = obj.userData.modelHeight || 1;
  pos.y += h + 0.01;

  pos.project(camera);

  if (pos.z > 1 || pos.z < -1 || Math.abs(pos.x) > 1.2 || Math.abs(pos.y) > 1.2) {
    selectorDot.style.display = "none";
    return;
  }

  selectorDot.style.left = ((pos.x * 0.8 + 0.5) * innerWidth) + "px";
  selectorDot.style.top = ((-pos.y * 0.8 + 0.5) * innerHeight) + "px";
  selectorDot.style.display = "block";
}


/* =========================
   PRODUCT MENU (3D CANVAS)
========================= */
const menu = createMenuSprite();
let menuVisible = false;

function createMenuSprite() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;

  const tex = new THREE.CanvasTexture(canvas);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      transparent: true
    })
  );

  sprite.scale.set(2.4, 1.8, 1);
  sprite.visible = false;
  sprite.userData = {
    canvas,
    ctx: canvas.getContext("2d"),
    tex
  };

  scene.add(sprite);
  return sprite;
}

function spawnMenu() {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  menu.position.copy(camera.position).add(dir.multiplyScalar(2));
  menu.quaternion.copy(camera.quaternion);
}

function drawMenu() {
  const ctx = menu.userData.ctx;
  ctx.clearRect(0, 0, 1024, 768);

  ctx.fillStyle = "rgba(15,15,20,.95)";
  roundRect(ctx, 0, 0, 1024, 768, 40);
  ctx.fill();

  ctx.fillStyle = "#00ffff";
  ctx.font = "bold 52px Arial";
  ctx.fillText("Products", 40, 70);

  /* close */
  ctx.fillStyle = "#ff4d6d";
  roundRect(ctx, 920, 20, 80, 60, 18);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.fillText("X", 948, 64);

  /* SCROLLBAR */
  const totalItems = allProducts.length;
  const maxScroll = Math.max(0, totalItems - 6);
  const trackX = 935;
  const trackY = 100;
  const trackW = 28;
  const trackH = 600;

  // track
  ctx.fillStyle = "rgba(40,40,55,.9)";
  roundRect(ctx, trackX, trackY, trackW, trackH, 14);
  ctx.fill();

  if (totalItems > 6) {
    // thumb
    const thumbH = Math.max(70, (6 / totalItems) * trackH);
    const thumbY = trackY + (menuScroll / maxScroll) * (trackH - thumbH);
    ctx.fillStyle = "#00ffff";
    roundRect(ctx, trackX + 3, thumbY, trackW - 6, thumbH, 11);
    ctx.fill();
  }

  visible.forEach((p, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);

    const x = 35 + col * 295;
    const y = 120 + row * 300;

    const active =
      Number(p.pId) === Number(selectedProductId);

    /* card */
    ctx.fillStyle = "#222";
    roundRect(ctx, x, y, cardW, cardH, 22);
    ctx.fill();

    /* selected frame only */
    if (active) {
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#00ffff";
      roundRect(ctx, x, y, cardW, cardH, 22);
      ctx.stroke();
    }

    /* image */
    ctx.fillStyle = "#111";
    roundRect(ctx, x + 14, y + 14, 242, 160, 16);
    ctx.fill();

    if (p._img && p._img.complete) {
      ctx.drawImage(
        p._img,
        x + 20,
        y + 20,
        230,
        148
      );
    }

    /* name */
    ctx.fillStyle = "#fff";
    ctx.font = "bold 23px Arial";
    ctx.fillText(
      (p.pName || "").slice(0, 18),
      x + 16,
      y + 220
    );
  });

  menu.userData.tex.needsUpdate = true;
}


function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* =========================
   fetch PRODUCTS
========================= */
async function fetchProducts() {
  try {
    const res = await myFetch(
      `${API}/api/products/get`
    );

    const data = await res.json();

    allProducts = (data || []).filter(
      p => p && p.pId && p.pName
    );

    // preload images
    allProducts.forEach((p) => {
      const img = new Image();

      img.crossOrigin = "anonymous";

      img.src =
        p.images?.[0]?.pImageUrl ||
        "/no-image.png";

      img.onload = () => drawMenu();

      p._img = img;
    });

    drawMenu();

  } catch (e) {
    console.error(e);
  }
}

/* =========================
   LOAD PRODUCT
========================= */
async function loadProduct(id = currentProductId) {
  currentProductId = id;

  showLoading("Fetching product...");

  try {
    setLoading(10, "Fetching product...");

    const res = await myFetch(
      `${API}/api/products/get/${id}`
    );

    if (!res.ok) throw new Error("Failed myFetch");

    productData = await res.json();

    setLoading(25, "Preparing model...");

    const modelUrl = encodeURI(productData.p3DModel);

    const loader = new GLTFLoader();

    loader.load(
      modelUrl,

      (gltf) => {
      productModelTemplate = gltf.scene;

      setLoading(100, "Ready");

      setTimeout(() => {
        hideLoading();

        if (!navigator.xr) {
          showXRUnsupportedPopup();
        } else {
          navigator.xr.isSessionSupported("immersive-ar").then(supported => {
            if (!supported) showXRUnsupportedPopup();
          });
        }

        requiredPlacement = (productData.pPlacement || "FLOOR").toUpperCase();
        placementStatus = "SEARCHING";

      }, 400);
    },

      // PROGRESS
      (xhr) => {
        if (xhr.total && xhr.total > 0) {
          const percent =
            25 + (xhr.loaded / xhr.total) * 75;

          setLoading(
            percent,
            "Downloading 3D model..."
          );
        } else {
          // fallback for unknown size
          const pulse =
            30 + ((Date.now() / 80) % 60);

          setLoading(
            pulse,
            "Downloading 3D model..."
          );
        }
      },

      // ERROR
      (err) => {
        console.error(err);
        setLoading(100, "Model failed");
        setTimeout(hideLoading, 1200);
      }
    );

  } catch (e) {
    console.error(e);
    setLoading(100, "Failed loading product");
    setTimeout(hideLoading, 1200);
  }
}

/* =========================
   HUD HIGHER ABOVE OBJECT
========================= */
function createHUD(obj) {
  const productInfo = obj.userData.productInfo || {
    pName: productData?.pName || "",
    pFinalPrice: productData?.pFinalPrice || ""
  };

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  const tex = new THREE.CanvasTexture(canvas);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      transparent: true
    })
  );

  sprite.scale.set(0.95, 0.45, 1);
  const box = new THREE.Box3().setFromObject(obj);

  const size = box.getSize(new THREE.Vector3());

  sprite.position.set(
    0,
    size.y + 0.1,
    0
  );
  obj.add(sprite);
  sprite.visible = productCardsVisible;

  function draw() {
    const addedCart = obj.userData.addedToCart;
    const addedWishlist = obj.userData.addedToWishlist;

    ctx.clearRect(0, 0, 512, 256);

    ctx.fillStyle = "rgba(0,0,0,.78)";
    roundRect(ctx, 0, 0, 512, 256, 24);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px Arial";
    ctx.fillText(productInfo.pName, 20, 50);

    ctx.fillStyle = "#00ffff";
    ctx.fillText(`${productInfo.pFinalPrice} DZD`, 20, 95);

    // heart
    ctx.fillStyle = addedWishlist ? "rgba(50,50,50,.95)" : "#ff4d6d";
    roundRect(ctx, 350, 30, 60, 60, 18);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.fillText(addedWishlist ? "✓" : "♥", 358, 70);

    // cart
    ctx.fillStyle = addedCart ? "rgba(50,50,50,.95)" : "#00ffff";
    roundRect(ctx, 290, 140, 180, 70, 18);
    ctx.fill();

    ctx.fillStyle = addedCart ? "#ccc" : "#000";
    ctx.fillText(addedCart ? "✓" : "ADD CART", 314, 184);

    tex.needsUpdate = true;
  }

  draw();

  obj.userData.hudSprite = sprite;
  obj.userData.updateHUD = draw;
}

function updateHUDVisibility() {

  objects.forEach((obj) => {

    if (obj.userData.hudSprite) {

      obj.userData.hudSprite.visible =
        productCardsVisible;
    }
  });
}

/* =========================
   ADD OBJECT
========================= */
function addObject() {
  if (!reticle.visible || !productModelTemplate) return;

  if (placementStatus !== "READY") {
    popup("Still detecting placement surface...");
    return;
  }

  if (detectedPlacement !== requiredPlacement) {
    popup(`Aim at the ${SURFACE_LABEL[requiredPlacement] || "surface"} to place the product`);
    return;
  }


  // pivot holder
  const holder = new THREE.Group();

  holder.position.copy(reticle.position);
  holder.quaternion.identity();

  const variant = productData?.sizecolorstock?.[0] || {};
  holder.userData.productInfo = {
    pName: productData?.pName || "",
    pFinalPrice: productData?.pFinalPrice || "",
    pId: productData?.pId || "",
    pscsId: variant?.pscsId?.toString?.() || "0",
    pImageId:
      productData?.images?.[0]?.pImageId?.toString?.() || "0"
  };
  holder.userData.addedToCart = false;
  holder.userData.addedToWishlist = false;

  // clone model
  const model = productModelTemplate.clone(true);

  applyProductSize(
    model,
    productData?.pHeight || 0,
    productData?.pWidth || 0
  );

  holder.add(model);

  scene.add(holder);

  objects.push(holder);

  const modelBox = new THREE.Box3().setFromObject(model);
  const modelSize = new THREE.Vector3();
  modelBox.getSize(modelSize);
  holder.userData.modelHeight = modelSize.y;

  createHUD(holder);

  selectedObject = holder;
}

addBtn.onclick = addObject;

/* =========================
   REMOVE
========================= */
removeBtn.onclick = () => {

  if (!selectedObject) {
    popup("Select an object first");
    return;
  }

  scene.remove(selectedObject);
  const i = objects.indexOf(selectedObject);
  if (i >= 0) objects.splice(i, 1);

  selectedObject = null;
};

/* =========================
   PRODUCTS BUTTON
========================= */
productsBtn.onclick = () => {
  menuVisible = !menuVisible;
  menu.visible = menuVisible;

  if (menuVisible) {
    spawnMenu();
    drawMenu();
  }
};

/* =========================
   API WISHLIST / CART
========================= */
async function addWishlist() {
  if (!userId || !token) return popup("Login required");

  await myFetch(
    `${API}/api/wishlist/add/${userId}/${productData.pId}`,
    {
      method: "POST",
      headers: authHeaders
    }
  );

  popup("Added to wishlist");
}

async function addCart() {
  if (!userId || !token) return popup("Login required");

  const cartRes = await myFetch(
    `${API}/api/cart/getbyuser/${userId}`,
    { headers: authHeaders }
  );

  const cartData = await cartRes.json();

  const variant =
    productData.sizecolorstock?.[0];

  const body = {
    pId: productData.pId.toString(),
    pscsId: variant.pscsId.toString(),
    pImageId:
      productData.images?.[0]?.pImageId?.toString() || "0",
    quantity: "1"
  };

  await myFetch(
    `${API}/api/cart/additem/${cartData.pCartId}`,
    {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  popup("Added to cart");
}

async function addWishlistForObject(obj) {
  if (!userId || !token) return popup("Login required");
  if (!obj?.userData || obj.userData.addedToWishlist) return;

  const id = obj.userData.productInfo?.pId;
  if (!id) return popup("Product information missing");

  await myFetch(
    `${API}/api/wishlist/add/${userId}/${id}`,
    {
      method: "POST",
      headers: authHeaders
    }
  );

  obj.userData.addedToWishlist = true;
  obj.userData.updateHUD?.();
  popup("Added to wishlist");
}

async function addCartForObject(obj) {
  if (!userId || !token) return popup("Login required");
  if (!obj?.userData || obj.userData.addedToCart) return;

  const productInfo = obj.userData.productInfo;
  if (!productInfo?.pId) return popup("Product information missing");

  const cartRes = await myFetch(
    `${API}/api/cart/getbyuser/${userId}`,
    { headers: authHeaders }
  );

  const cartData = await cartRes.json();

  const body = {
    pId: productInfo.pId.toString(),
    pscsId: productInfo.pscsId.toString(),
    pImageId: productInfo.pImageId.toString(),
    quantity: "1"
  };

  await myFetch(
    `${API}/api/cart/additem/${cartData.pCartId}`,
    {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  obj.userData.addedToCart = true;
  obj.userData.updateHUD?.();
  popup("Added to cart");
}

/* =========================
   POINTER TAP
========================= */
const raycaster = new THREE.Raycaster();

window.addEventListener("click", async (event) => {
  if (!interactionEnabled) return;
  const isUI = event.target.closest("[data-ui]");
  if (isUI) return;

  raycaster.setFromCamera({ x: 0, y: 0 }, camera);

  /* ===== MENU ===== */
  if (menu.visible) {
    const hit = raycaster.intersectObject(menu);
    if (hit.length) {
      const uv = hit[0].uv;
      const x = uv.x * 1024;
      const y = (1 - uv.y) * 768;

      if (x > 920 && y < 80) { menu.visible = false; menuVisible = false; return; }
      // SCROLLBAR — tap anywhere on track to jump
      if (x >= 935 && x <= 963 && y >= 100 && y <= 700) {
        const totalItems = allProducts.length;
        const maxScroll = Math.max(0, totalItems - 6);
        if (maxScroll > 0) {
          const trackH = 600;
          const thumbH = Math.max(70, (6 / totalItems) * trackH);
          const ratio = (y - 100 - thumbH / 2) / (trackH - thumbH);
          menuScroll = Math.max(0, Math.min(maxScroll, Math.round(ratio * maxScroll)));
          drawMenu();
        }
        return;
      }

      const visible = allProducts.slice(menuScroll, menuScroll + 6);
      const cardW = 270, cardH = 250, spacingX = 295, spacingY = 300, startX = 35, startY = 120;
      let clickedProduct = null;
      for (let i = 0; i < visible.length; i++) {
        const col = i % 3, row = Math.floor(i / 3);
        const cardX = startX + col * spacingX, cardY = startY + row * spacingY;
        if (x >= cardX && x <= cardX + cardW && y >= cardY && y <= cardY + cardH) {
          clickedProduct = visible[i];
          break;
        }
      }
      if (clickedProduct) {
        selectedProductId = clickedProduct.pId;
        drawMenu();
        await loadProduct(clickedProduct.pId);
        popup("Selected " + clickedProduct.pName);
      }
      return;
    }
  }

  /* ===== OBJECTS / HUD ===== */
  const hits = raycaster.intersectObjects(objects, true);
  if (hits.length) {
    let root = hits[0].object;
    while (root.parent && !objects.includes(root)) root = root.parent;
    selectedObject = root;

    const hitObj = hits[0].object;
    if (hitObj.type === "Sprite") {
      const uv = hits[0].uv;
      const x = uv.x * 512, y = (1 - uv.y) * 256;
      const canWishlist = root?.userData && !root.userData.addedToWishlist;
      const canCart = root?.userData && !root.userData.addedToCart;
      if (x > 350 && x < 410 && y > 30 && y < 90 && canWishlist) await addWishlistForObject(root);
      if (x > 290 && x < 470 && y > 140 && y < 210 && canCart) await addCartForObject(root);
    }
    return; // <- key fix: don't fall through to floor projection
  }

});

/* =========================
   DRAG FIXED (X/Z ONLY)
========================= */
window.addEventListener("pointerdown", (event) => {
  if (!interactionEnabled) return;
  const isUI = event.target.closest("[data-ui]");

  // allow HUD + menu raycast only if NOT UI blocking full scene interaction
  if (isUI) return;
  
  // Use the cursor (center screen) — not the tap location
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  const hits = raycaster.intersectObjects(objects, true);

  if (hits.length) {
    let root = hits[0].object;

    while (root.parent && !objects.includes(root)) {
      root = root.parent;
    }

    selectedObject = root;
    return;
  }

  selectedObject = null;
});

window.addEventListener("pointerup", () => {
  dragging = false;
});

window.addEventListener("pointercancel", () => {
  dragging = false;
});

/* =========================
   XR EVENTS
========================= */
renderer.xr.addEventListener("sessionstart", () => {
  ui.style.display = "block";
  interactionEnabled = true;
  arBtn.style.display = "none";
  document.getElementById("arIntro")?.style.setProperty("display", "none");

  const label = SURFACE_LABEL[requiredPlacement] || "surface";
  showPlacementToast(`Detecting ${label}...`);

  // welcome — only once per session
  if (chatHistory.length === 0) {
    const welcome = "Welcome to HoloRoom AR. If you need help placing or moving anything, tap the chat icon, or hold the mic button to ask me by voice.";
    chatHistory.push({ role: "assistant", text: welcome });
    rerenderChatIfOpen();
    speak(welcome);
  }
});

renderer.xr.addEventListener("sessionend", () => {
  ui.style.display = "none";
  arBtn.style.display = "block";
  document.getElementById("arIntro")?.style.setProperty("display", "flex");
  if (placementToast) { placementToast.remove(); placementToast = null; }
});

/* =========================
   LOOP
========================= */
renderer.setAnimationLoop(async (_, frame) => {
  const session = renderer.xr.getSession();

  if (!snapped) {
    placementStatus = "SEARCHING";
    detectedPlacement = null;
  }

  if (selectedObject) {
    if (rotateLeftHeld) {
      selectedObject.rotation.y += 0.03;
    }

    if (rotateRightHeld) {
      selectedObject.rotation.y -= 0.03;
    }
  }

  objects.forEach((o) => {
    if (o.userData.selectionWrapper) {
      o.userData.selectionWrapper.quaternion.copy(camera.quaternion);
    }
  });

  if (!session || !frame) {
    updateSelectorDot(selectedObject, camera);
    renderer.render(scene, camera);
    return;
  }

  if (!referenceSpace) {
    referenceSpace =
      await renderer.xr.getReferenceSpace();
    return;
  }

  if (!hitTestSource) {
    const viewer =
      await session.requestReferenceSpace(
        "viewer"
      );

    hitTestSource =
      await session.requestHitTestSource({
        space: viewer
      });
  }

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);

  const camPos = new THREE.Vector3();
  camera.getWorldPosition(camPos);

  raycaster.setFromCamera(
    { x: 0, y: 0 },
    camera
  );

  function applyDynamicScale(targetPos) {
    const dist = camPos.distanceTo(targetPos);
    // keep apparent size roughly constant — bigger at distance
    const s = Math.max(dist, 0.5) * 1.8;
    reticle.scale.set(s, s, s);
  }

  reticle.visible = true;
  snapped = false;

  /* =====================================
     MENU PRIORITY
  ===================================== */
  if (!snapped && menu.visible) {
    const menuHits =
      raycaster.intersectObject(menu);

    if (menuHits.length) {
      const hit = menuHits[0];

      reticle.position.copy(hit.point);
      reticle.position.add(
        forward.clone().multiplyScalar(
          0.01
        )
      );

      reticle.quaternion.copy(
        menu.quaternion
      );

      applyDynamicScale(
        reticle.position,
        0.028
      );

      snapped = true;
    }
  }

  /* =====================================
     OBJECT PRIORITY
  ===================================== */
  if (!snapped) {
    const objHits =
      raycaster.intersectObjects(
        objects,
        true
      );

    if (objHits.length) {
      const hit = objHits[0];

      reticle.position.copy(hit.point);

      if (hit.object.type === "Sprite") {
        reticle.quaternion.copy(hit.object.quaternion);
      } else if (hit.face) {
        const normal = hit.face.normal
          .clone()
          .transformDirection(
            hit.object.matrixWorld
          )
          .normalize();

        reticle.position.add(
          normal.clone().multiplyScalar(
            0.01
          )
        );

        reticle.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          normal
        );
      }

      applyDynamicScale(
        reticle.position,
        0.032
      );

      snapped = true;
    }
  }

  /* GROUND HIT TEST */
  if (!snapped) {
    const hits = frame.getHitTestResults(hitTestSource);
    if (hits.length) {
      // find the closest hit matching the required surface
      let matched = null;
      let matchedNormal = null;
      for (const h of hits) {
        const pose = h.getPose(referenceSpace);
        const m = new THREE.Matrix4().fromArray(pose.transform.matrix);
        const n = new THREE.Vector3().setFromMatrixColumn(m, 1).normalize();
        const surface = classifySurface(n);
        if (surface === requiredPlacement) {
          matched = { pose, matrix: m };
          matchedNormal = n;
          break;
        }
      }
      if (matched) {
        reticle.position.setFromMatrixPosition(matched.matrix);
        reticle.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          matchedNormal
        );
        detectedPlacement = requiredPlacement;
        placementStatus = "READY";
        applyDynamicScale(reticle.position);
        snapped = true;
      }
    }
  }

  /* =====================================
     SKY / NO SURFACE FALLBACK
     always visible in front of camera
  ===================================== */
  if (!snapped) {
    reticle.position.copy(camPos).add(
      forward.clone().multiplyScalar(
        1.5
      )
    );

    reticle.quaternion.copy(
      camera.quaternion
    );

    applyDynamicScale(
      reticle.position,
      0.03
    );
  }

  reticle.updateMatrix();
  reticle.updateMatrixWorld(true);

  /* =====================================
     DRAG
  ===================================== */
  if (dragging && selectedObject && detectedPlacement === "FLOOR") {

  selectedObject.position.x =
    reticle.position.x + dragOffset.x;

  selectedObject.position.z =
    reticle.position.z + dragOffset.z;
}

  if (placementStatus === "READY" && placementToast) {
    placementToast.remove();
    placementToast = null;
  }

  if (placementStatus !== "READY" && !placementToast && interactionEnabled) {
    const label = SURFACE_LABEL[requiredPlacement] || "surface";
    const hint = requiredPlacement === "WALL"
      ? "Pan the camera slowly across the wall"
      : requiredPlacement === "CEILING"
      ? "Look up and pan across the ceiling"
      : "Aim at a well-lit floor";
    showPlacementToast(`Detecting ${label}... ${hint}`);
  }

  updateSelectorDot(selectedObject, camera);
  renderer.render(scene, camera);
});

/* =========================
   RESIZE
========================= */
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* =========================
   INIT
========================= */
(async () => {
  const ok = await checkWebXR();
  fetchProducts();
  loadProduct(currentProductId);
})();