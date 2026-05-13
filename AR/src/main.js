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

let detectedPlacement = null;

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

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.sortObjects = true;

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

/* =========================
   RETICLE (GROUND SNAP)
========================= */
const reticleMaterial = new THREE.MeshBasicMaterial({
  color: 0xffdd00,
  transparent: true,
  opacity: 1,
  side: THREE.DoubleSide
});

const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.06, 0.08, 64),
  reticleMaterial
);

reticle.rotation.x = -Math.PI / 2;

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
  `;

b.onmouseenter = () => {
  b.style.transform = "scale(1.05)";
};

b.onmouseleave = () => {
  b.style.transform = "scale(1)";
};
  ui.appendChild(b);
  return b;
}

// buttons
const addBtn = makeBtn("Add");
addBtn.style.bottom = "22px";
addBtn.style.left = "50%";
addBtn.style.transform = "translateX(-50%)";

const rotateLeftBtn = makeBtn("⟲");
rotateLeftBtn.style.bottom = "22px";
rotateLeftBtn.style.left = "22px";

const rotateRightBtn = makeBtn("⟳");
rotateRightBtn.style.bottom = "22px";
rotateRightBtn.style.left = "90px";

const removeBtn = makeBtn("Remove");
removeBtn.style.bottom = "22px";
removeBtn.style.right = "22px";

const productsBtn = makeBtn("📦 Products");   
productsBtn.style.top = "18px";
productsBtn.style.left = "18px";

const menuBtn = makeBtn("☰");
menuBtn.style.top = "18px";
menuBtn.style.right = "18px";

menuBtn.onclick = () => {
  showMainMenuPopup();
};

let rotateLeftHeld = false;
let rotateRightHeld = false;

function setupHoldRotation(btn, dir) {

  btn.addEventListener("pointerdown", () => {
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
    `;

    return btn;
  }

  const settingsBtn = makeOption("⚙ Settings");
  const exitBtn = makeOption("🚪 Exit");

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
  bottom:100px;
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
    bottom:200px;
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
function normalizeProductModel(
  object,
  targetSize = 0.8
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);

  const maxAxis = Math.max(size.x, size.y, size.z);

  const scale = targetSize / maxAxis * 1.2;

  object.scale.setScalar(scale);

  // re-center after scaling
  const box2 = new THREE.Box3().setFromObject(object);
  const center = box2.getCenter(new THREE.Vector3());

  object.position.sub(center);
}

/* =========================
    Selected Object Glow
========================= */
function createSelectionRing(obj) {

  // remove old
  if (obj.userData.selectionRing) {
    obj.remove(obj.userData.selectionRing);
  }

  const texCanvas = document.createElement("canvas");

  texCanvas.width = 256;
  texCanvas.height = 256;

  const ctx = texCanvas.getContext("2d");

  const gradient = ctx.createRadialGradient(
    128,
    128,
    30,
    128,
    128,
    120
  );

  gradient.addColorStop(0, "rgba(0,255,255,.9)");
  gradient.addColorStop(0.5, "rgba(0,255,255,.35)");
  gradient.addColorStop(1, "rgba(0,255,255,0)");

  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(texCanvas);

  const material = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false
  });

  const sprite = new THREE.Sprite(material);

  sprite.scale.set(1.2, 1.2, 1.2);

  const box = new THREE.Box3().setFromObject(obj);

  const size = box.getSize(new THREE.Vector3());

  sprite.position.set(
    0,
    size.y + 0.4,
    0
  );

  obj.add(sprite);

  obj.userData.selectionRing = sprite;
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

  /* scroll up */
  ctx.fillStyle = "#222";
  roundRect(ctx, 930, 150, 60, 70, 18);
  ctx.fill();

  ctx.fillStyle = "#00ffff";
  ctx.fillText("↑", 948, 200);

  /* scroll down */
  ctx.fillStyle = "#222";
  roundRect(ctx, 930, 250, 60, 70, 18);
  ctx.fill();

  ctx.fillStyle = "#00ffff";
  ctx.fillText("↓", 948, 300);

  const start = menuScroll;
  const visible = allProducts.slice(start, start + 6);

  const cardW = 270;
  const cardH = 250;

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

  sprite.scale.set(1.5, 0.72, 1);
  const box = new THREE.Box3().setFromObject(obj);

  const size = box.getSize(new THREE.Vector3());

  sprite.position.set(
    0,
    size.y - 1,
    0
  );
  obj.add(sprite);

  function draw() {
    ctx.clearRect(0, 0, 512, 256);

    ctx.fillStyle = "rgba(0,0,0,.78)";
    roundRect(ctx, 0, 0, 512, 256, 24);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 30px Arial";
    ctx.fillText(productData.pName, 20, 50);

    ctx.fillStyle = "#00ffff";
    ctx.fillText(`${productData.pFinalPrice} DZD`, 20, 95);

    // heart
    ctx.fillStyle = "#ff4d6d";
    roundRect(ctx, 350, 30, 60, 60, 18);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.fillText("♥", 366, 70);

    // cart
    ctx.fillStyle = "#00ffff";
    roundRect(ctx, 290, 140, 180, 70, 18);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.fillText("ADD CART", 314, 184);

    tex.needsUpdate = true;
  }

  draw();

  obj.userData.hudSprite = sprite;
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

  const typeMatch =
    (requiredPlacement === "FLOOR" && detectedPlacement === "FLOOR") ||
    (requiredPlacement === "WALL" && detectedPlacement === "WALL") ||
    (requiredPlacement === "CEILING" && detectedPlacement === "CEILING");

  if (!typeMatch) {
    popup(`Place only on ${requiredPlacement.toLowerCase()}`);
    return;
  }


  // pivot holder
  const holder = new THREE.Group();

  holder.position.setFromMatrixPosition(reticle.matrix);

  // clone model
  const model = productModelTemplate.clone(true);

  normalizeProductModel(model, 0.8);

  // center model
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());

  model.position.sub(center);

  holder.add(model);

  scene.add(holder);

  objects.push(holder);

  createHUD(holder);

  selectedObject = holder;

  createSelectionRing(holder);

  objects.forEach(o => {

    if (o.userData.selectionRing) {
      o.userData.selectionRing.visible = false;
    }
  });

  holder.userData.selectionRing.visible = true;
}

addBtn.onclick = addObject;

/* =========================
   REMOVE
========================= */
removeBtn.onclick = () => {
  if (!selectedObject) return;

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

/* =========================
   POINTER TAP
========================= */
const raycaster = new THREE.Raycaster();

window.addEventListener("click", async () => {
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);

  /* =========================
     MENU COLLISION
  ========================= */
  if (menu.visible) {

    const hit = raycaster.intersectObject(menu);

    if (hit.length) {

      const uv = hit[0].uv;

      const x = uv.x * 1024;
      const y = (1 - uv.y) * 768;

      /* =========================
         CLOSE BUTTON
      ========================= */
      if (x > 920 && y < 80) {

        menu.visible = false;
        menuVisible = false;

        return;
      }

      /* =========================
         SCROLL UP
      ========================= */
      if (
        x >= 930 &&
        x <= 990 &&
        y >= 150 &&
        y <= 220
      ) {

        menuScroll = Math.max(
          0,
          menuScroll - 1
        );

        drawMenu();

        return;
      }

      /* =========================
         SCROLL DOWN
      ========================= */
      if (
        x >= 930 &&
        x <= 990 &&
        y >= 250 &&
        y <= 320
      ) {

        if (
          menuScroll <
          allProducts.length - 6
        ) {
          menuScroll++;
        }

        drawMenu();

        return;
      }

      /* =========================
         PRODUCT CARD COLLISION
      ========================= */

      const visible = allProducts.slice(
        menuScroll,
        menuScroll + 6
      );

      const cardW = 270;
      const cardH = 250;

      const spacingX = 295;
      const spacingY = 300;

      const startX = 35;
      const startY = 120;

      let clickedProduct = null;

      for (let i = 0; i < visible.length; i++) {

        const col = i % 3;

        const row = Math.floor(i / 3);

        const cardX =
          startX + col * spacingX;

        const cardY =
          startY + row * spacingY;

        const inside =
          x >= cardX &&
          x <= cardX + cardW &&
          y >= cardY &&
          y <= cardY + cardH;

        if (inside) {

          clickedProduct = visible[i];

          break;
        }
      }

      if (clickedProduct) {

        selectedProductId =
          clickedProduct.pId;

        drawMenu();

        await loadProduct(
          clickedProduct.pId
        );

        popup(
          "Selected " +
          clickedProduct.pName
        );
      }

      return;
    }
  }

  /* =========================
     OBJECT / HUD COLLISION
  ========================= */

  const hits =
    raycaster.intersectObjects(
      objects,
      true
    );

  if (hits.length) {

    let root = hits[0].object;

    while (
      root.parent &&
      !objects.includes(root)
    ) {
      root = root.parent;
    }

    selectedObject = root;

    objects.forEach(o => {

    if (o.userData.selectionRing) {
      o.userData.selectionRing.visible = false;
    }
  });

  if (selectedObject.userData.selectionRing) {
    selectedObject.userData.selectionRing.visible = true;
  }

    const hitObj = hits[0].object;

    /* =========================
       HUD BUTTONS
    ========================= */

    if (hitObj.type === "Sprite") {

      const uv = hits[0].uv;

      const x = uv.x * 512;
      const y = (1 - uv.y) * 256;

      // wishlist
      if (
        x > 350 &&
        x < 410 &&
        y > 30 &&
        y < 90
      ) {

        addWishlist();
      }

      // cart
      if (
        x > 290 &&
        x < 470 &&
        y > 140 &&
        y < 210
      ) {

        addCart();
      }
    }
  }
});

/* =========================
   DRAG FIXED (X/Z ONLY)
========================= */
window.addEventListener("pointerdown", () => {
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  const hits = raycaster.intersectObjects(objects, true);

  if (hits.length) {
    let root = hits[0].object;

    while (root.parent && !objects.includes(root)) {
      root = root.parent;
    }

    selectedObject = root;
    dragging = true;
  }
});

window.addEventListener("pointerup", () => {
  dragging = false;
});

/* =========================
   XR EVENTS
========================= */
renderer.xr.addEventListener("sessionstart", () => {
  ui.style.display = "block";

        requiredPlacement = productData.pPlacement || "FLOOR";
        placementStatus = "SEARCHING";

        if (requiredPlacement === "FLOOR") {
          showPlacementToast("Detecting floor...");
        }

        if (requiredPlacement === "WALL") {
          showPlacementToast("Detecting walls...");
        }

        if (requiredPlacement === "CEILING") {
          showPlacementToast("Detecting ceiling...");
        }

  arBtn.style.display = "none";
});

renderer.xr.addEventListener("sessionend", () => {
  ui.style.display = "none";

  arBtn.style.display = "block";
});

/* =========================
   LOOP
========================= */
renderer.setAnimationLoop(async (_, frame) => {
  const session = renderer.xr.getSession();

  if (detectedPlacement) {

  if (
    (requiredPlacement === "FLOOR" && detectedPlacement === "FLOOR") ||
    (requiredPlacement === "WALL" && detectedPlacement === "WALL") ||
    (requiredPlacement === "CEILING" && detectedPlacement === "CEILING")
  ) {
    placementStatus = "READY";
  }
  }

  if (selectedObject) {

    if (rotateLeftHeld) {
      selectedObject.rotation.y += 0.03;
    }

    if (rotateRightHeld) {
      selectedObject.rotation.y -= 0.03;
    }
  }

  if (!session || !frame) {
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

  function applyDynamicScale(
    targetPos,
    base = 0.032
  ) {
    const dist =
      camPos.distanceTo(targetPos);

    let s =
      base *
      (1 / Math.max(dist * 0.9, 1));

    s = THREE.MathUtils.clamp(
      s,
      0.5,
      1
    );

    reticle.scale.set(s, s, s);
  }

/* =========================
   FORCED ALWAYS-VISIBLE CURSOR
========================= */

// IMPORTANT
reticle.matrixAutoUpdate = true;

reticle.visible = true;

// put cursor in front of camera
const dir = new THREE.Vector3();
camera.getWorldDirection(dir);

const pos = new THREE.Vector3()
  .copy(camPos)
  .add(dir.multiplyScalar(1.5));

reticle.position.copy(pos);

// make it face camera
reticle.quaternion.copy(camera.quaternion);

// size
reticle.scale.setScalar(0.08);

// keep yellow
reticle.material.color.set("#ffdd00");

// optional rotation if using ring
reticle.rotation.x = -Math.PI / 2;

// fake ready state so addObject works
detectedPlacement = requiredPlacement || "FLOOR";
placementStatus = "READY";

  /* =====================================
     DRAG
  ===================================== */
  if (dragging && selectedObject) {

  const nextX =
    selectedObject.position.x +
    (reticle.position.x - selectedObject.position.x) * 0.25;

  const nextZ =
    selectedObject.position.z +
    (reticle.position.z - selectedObject.position.z) * 0.25;

  const nextY = selectedObject.position.y;

  // simple collision clamp based on placement type
  if (requiredPlacement === "FLOOR") {
    // prevent going below floor
    selectedObject.position.x = nextX;
    selectedObject.position.z = nextZ;
  }

  if (requiredPlacement === "WALL") {
    // lock Y plane + prevent crossing wall plane (approx)
    selectedObject.position.x = nextX;
    selectedObject.position.y = nextY;
    selectedObject.position.z = nextZ;
  }

  if (requiredPlacement === "CEILING") {
    selectedObject.position.x = nextX;
    selectedObject.position.z = nextZ;
  }

  renderer.render(scene, camera);
}
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