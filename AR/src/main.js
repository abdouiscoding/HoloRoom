import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/* =========================
   CONFIG
========================= */
const address = "192.168.1.10";

/* =========================
   AUTH / URL PARAMS
========================= */
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const userId = params.get("userId");
let currentProductId = params.get("productId");

const authHeaders = token
  ? { Authorization: `Bearer ${token}` }
  : {};

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
const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.014, 0.022, 32), // much smaller
  new THREE.MeshBasicMaterial({
    color: 0xffdd00,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    depthTest: false
  })
);

reticle.rotation.x = -Math.PI / 2;
reticle.renderOrder = 9999;
reticle.matrixAutoUpdate = true;
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
  padding:12px 18px;
  border:none;
  border-radius:14px;
  background:rgba(0,255,255,.9);
  color:#000;
  font-weight:700;
  box-shadow:0 8px 30px rgba(0,0,0,.3);
  `;
  ui.appendChild(b);
  return b;
}

const addBtn = makeBtn("Add");
addBtn.style.top = "12px";
addBtn.style.right = "12px";

const removeBtn = makeBtn("Remove");
removeBtn.style.top = "12px";
removeBtn.style.right = "95px";

const productsBtn = makeBtn("Products");
productsBtn.style.top = "12px";
productsBtn.style.left = "12px";

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
      Number(p.pId) === Number(currentProductId);

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
   FETCH PRODUCTS
========================= */
async function fetchProducts() {
  try {
    const res = await fetch(
      `http://${address}:8080/api/products/get`
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

    const res = await fetch(
      `http://${address}:8080/api/products/get/${id}`
    );

    if (!res.ok) throw new Error("Failed fetch");

    productData = await res.json();

    setLoading(25, "Preparing model...");

    const modelUrl = encodeURI(productData.p3DModel);

    const loader = new GLTFLoader();

    loader.load(
      modelUrl,

      // SUCCESS
      (gltf) => {
        productModelTemplate = gltf.scene;

        setLoading(100, "Ready");

        setTimeout(() => {
          hideLoading();
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
   MODEL NORMALIZE
========================= */
function normalizeModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());

  const max = Math.max(size.x, size.y, size.z);
  const scale = 0.7 / max;

  model.scale.setScalar(scale);

  const newBox = new THREE.Box3().setFromObject(model);
  model.position.y -= newBox.min.y;
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

  sprite.scale.set(0.75, 0.36, 1);
  sprite.position.set(0, 1.25, 0); // higher
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
    ctx.fillText(`${productData.pPrice} DZD`, 20, 95);

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

  const obj = productModelTemplate.clone(true);
  normalizeModel(obj);

  obj.position.setFromMatrixPosition(reticle.matrix);

  scene.add(obj);
  objects.push(obj);

  createHUD(obj);

  selectedObject = obj;
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

  await fetch(
    `http://${address}:8080/api/wishlist/add/${userId}/${productData.pId}`,
    {
      method: "POST",
      headers: authHeaders
    }
  );

  popup("Added to wishlist");
}

async function addCart() {
  if (!userId || !token) return popup("Login required");

  const cartRes = await fetch(
    `http://${address}:8080/api/cart/getbyuser/${userId}`,
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

  await fetch(
    `http://${address}:8080/api/cart/additem/${cartData.pCartId}`,
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

  // menu collision
  if (menu.visible) {
    const hit = raycaster.intersectObject(menu);

    if (hit.length) {
      const uv = hit[0].uv;
      const x = uv.x * 1024;
      const y = (1 - uv.y) * 768;

      // close
      if (x > 920 && y < 80) {
        menu.visible = false;
        menuVisible = false;
        return;
      }

      const col = Math.floor((x - 40) / 320);
      const row = Math.floor((y - 120) / 300);

      const index = row * 3 + col;

      if (index >= 0 && allProducts[index]) {
        await loadProduct(allProducts[index].pId);
        popup("Selected " + allProducts[index].pName);
      }

      return;
    }
  }

  // object / hud collision
  const hits = raycaster.intersectObjects(objects, true);

  if (hits.length) {
    let root = hits[0].object;

    while (root.parent && !objects.includes(root)) {
      root = root.parent;
    }

    selectedObject = root;

    const hitObj = hits[0].object;

    // if sprite hud
    if (hitObj.type === "Sprite") {
      const uv = hits[0].uv;
      const x = uv.x * 512;
      const y = (1 - uv.y) * 256;

      if (x > 350 && x < 410 && y > 30 && y < 90) {
        addWishlist();
      }

      if (x > 290 && x < 470 && y > 140 && y < 210) {
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
});

renderer.xr.addEventListener("sessionend", () => {
  ui.style.display = "none";
});

/* =========================
   LOOP
========================= */
renderer.setAnimationLoop(async (_, frame) => {
  const session = renderer.xr.getSession();

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

  reticle.visible = true;
  let snapped = false;

  /* =====================================
     MENU PRIORITY
  ===================================== */
  if (menu.visible) {
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

      if (hit.face) {
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

  /* =====================================
     GROUND HIT TEST
  ===================================== */
  if (!snapped) {
    const hits =
      frame.getHitTestResults(
        hitTestSource
      );

    if (hits.length) {
      const pose =
        hits[0].getPose(
          referenceSpace
        );

      const matrix =
        new THREE.Matrix4().fromArray(
          pose.transform.matrix
        );

      reticle.position.setFromMatrixPosition(
        matrix
      );

      reticle.rotation.set(
        -Math.PI / 2,
        0,
        0
      );

      applyDynamicScale(
        reticle.position,
        0.032
      );

      snapped = true;
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
  if (
    dragging &&
    selectedObject
  ) {
    selectedObject.position.x +=
      (reticle.position.x -
        selectedObject.position.x) *
      0.25;

    selectedObject.position.z +=
      (reticle.position.z -
        selectedObject.position.z) *
      0.25;
  }

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
fetchProducts();
loadProduct(currentProductId);