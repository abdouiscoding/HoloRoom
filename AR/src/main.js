import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

/* =========================
   SCENE
========================= */
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);

/* =========================
   RENDERER
========================= */
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

/* =========================
   LIGHTS
========================= */
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(3, 5, 2);
scene.add(dirLight);

/* =========================
   AR BUTTON
========================= */
document.body.appendChild(
  ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test"],
    optionalFeatures: ["dom-overlay"],
    domOverlay: { root: document.body }
  })
);

/* =========================
   RETICLE (yellow ring)
========================= */
const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.012, 0.02, 32),
  new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide
  })
);

reticle.rotation.x = -Math.PI / 2;
reticle.matrixAutoUpdate = true;
reticle.visible = false;
scene.add(reticle);

/* =========================
   LASER LINE
========================= */
const laserGeo = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(),
  new THREE.Vector3()
]);

const laser = new THREE.Line(
  laserGeo,
  new THREE.LineBasicMaterial({ color: 0xffff00 })
);

scene.add(laser);

/* =========================
   STATE
========================= */
const objects = [];
let selectedObject = null;

const product = {
  colors: ["cyan", "red", "green", "yellow", "white"]
};

let currentColor = 0;

let rotateLeft = false;
let rotateRight = false;

const raycaster = new THREE.Raycaster();

/* =========================
   UI
========================= */
const productBtn = makeBtn("Product");
productBtn.style.top = "10px";
productBtn.style.left = "10px";

const addBtn = makeBtn("Add");
addBtn.style.top = "10px";
addBtn.style.right = "10px";

const rotL = makeBtn("⟲");
rotL.style.left = "10px";
rotL.style.top = "45%";

const rotR = makeBtn("⟳");
rotR.style.left = "10px";
rotR.style.top = "55%";

const delBtn = makeBtn("Delete");
delBtn.style.bottom = "10px";
delBtn.style.left = "10px";

const colorBtn = makeBtn("Color");
colorBtn.style.bottom = "10px";
colorBtn.style.right = "10px";

function makeBtn(text) {
  const b = document.createElement("button");
  b.innerText = text;
  b.style.position = "absolute";
  b.style.zIndex = "999";
  b.style.padding = "14px 18px";
  b.style.border = "none";
  b.style.borderRadius = "12px";
  b.style.background = "#00ffff";
  b.style.fontWeight = "bold";
  b.style.color = "black";
  document.body.appendChild(b);
  return b;
}

/* =========================
   HOLD BUTTONS
========================= */
function hold(btn, start, end) {
  btn.onpointerdown = start;
  btn.onpointerup = end;
  btn.onpointerleave = end;
}

hold(rotL, () => rotateLeft = true, () => rotateLeft = false);
hold(rotR, () => rotateRight = true, () => rotateRight = false);

/* =========================
   MENU PANEL
========================= */
let menuVisible = false;
const menu = createMenu();

productBtn.onclick = () => {
  menuVisible = !menuVisible;

  if (menuVisible) {
    spawnMenu();
    menu.visible = true;
  } else {
    menu.visible = false;
  }
};

function createMenu() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;

  const ctx = canvas.getContext("2d");
  const tex = new THREE.CanvasTexture(canvas);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      transparent: true
    })
  );

  sprite.scale.set(2.5, 1.9, 1);
  sprite.visible = false;

  sprite.userData.ctx = ctx;
  sprite.userData.tex = tex;

  scene.add(sprite);

  return sprite;
}

function spawnMenu() {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  menu.position.copy(camera.position).add(dir.multiplyScalar(4));
  menu.quaternion.copy(camera.quaternion);

  drawMenu();
}

function drawMenu() {
  const ctx = menu.userData.ctx;

  ctx.clearRect(0, 0, 1024, 768);

  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(0, 0, 1024, 768);

  ctx.fillStyle = "white";
  ctx.font = "bold 72px Arial";
  ctx.fillText("MENU", 40, 90);

  ctx.fillStyle = "#ff4444";
  ctx.fillRect(900, 20, 90, 90);

  ctx.fillStyle = "white";
  ctx.fillText("X", 925, 88);

  ctx.fillStyle = "#00ffff";
  ctx.fillRect(80, 180, 860, 120);

  ctx.fillStyle = "black";
  ctx.font = "50px Arial";
  ctx.fillText("Cube Product", 220, 255);

  ctx.fillStyle = "white";
  ctx.fillText("Current Color: " + product.colors[currentColor], 90, 420);

  menu.userData.tex.needsUpdate = true;
}

/* =========================
   ADD OBJECT
========================= */
addBtn.onclick = () => {
  if (!reticle.visible) return;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.2),
    new THREE.MeshStandardMaterial({
      color: product.colors[currentColor],
      metalness: 0.9,
      roughness: 0.2
    })
  );

  mesh.position.copy(reticle.position);

  scene.add(mesh);
  objects.push(mesh);

  selectObject(mesh);
};

/* =========================
   COLOR CHANGE
========================= */
colorBtn.onclick = () => {
  currentColor++;
  if (currentColor >= product.colors.length) currentColor = 0;

  drawMenu();

  if (selectedObject) {
    selectedObject.material.color.set(product.colors[currentColor]);
  }
};

/* =========================
   DELETE
========================= */
delBtn.onclick = () => {
  if (!selectedObject) return;

  scene.remove(selectedObject);

  const i = objects.indexOf(selectedObject);
  if (i >= 0) objects.splice(i, 1);

  selectedObject = null;
};

/* =========================
   SELECT OBJECT
========================= */
function selectObject(obj) {
  if (selectedObject) {
    selectedObject.scale.setScalar(1);
  }

  selectedObject = obj;

  obj.scale.setScalar(1.08);
}

/* =========================
   TAP SELECT / CLOSE MENU
========================= */
window.addEventListener("click", () => {
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);

  if (menu.visible) {
    const hitMenu = raycaster.intersectObject(menu);

    if (hitMenu.length) {
      const uv = hitMenu[0].uv;

      const x = uv.x * 1024;
      const y = (1 - uv.y) * 768;

      if (x > 900 && y < 110) {
        menu.visible = false;
        menuVisible = false;
        return;
      }
    }
  }

  const hits = raycaster.intersectObjects(objects);

  if (hits.length) {
    selectObject(hits[0].object);
  }
});

/* =========================
   XR HIT TEST
========================= */
let hitTestSource = null;
let hitTestRequested = false;
let referenceSpace = null;

/* =========================
   SESSION RESET
========================= */
renderer.xr.addEventListener("sessionend", () => {
  location.reload();
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
    referenceSpace = await renderer.xr.getReferenceSpace();
    return;
  }

  if (!hitTestRequested) {
    hitTestRequested = true;

    const viewer = await session.requestReferenceSpace("viewer");

    hitTestSource = await session.requestHitTestSource({
      space: viewer
    });
  }

  let worldPoint = null;

  // AR REAL SURFACE HIT
  if (hitTestSource) {
    const hits = frame.getHitTestResults(hitTestSource);

    if (hits.length) {
      const pose = hits[0].getPose(referenceSpace);

      worldPoint = new THREE.Vector3(
        pose.transform.position.x,
        pose.transform.position.y,
        pose.transform.position.z
      );
    }
  }

  // CAMERA CENTER RAYCAST
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  raycaster.set(camera.position, dir);

  const targets = [];

  if (menu.visible) targets.push(menu);
  objects.forEach(o => targets.push(o));

  const hit3D = raycaster.intersectObjects(targets, true);

  let finalPoint = worldPoint;

  if (hit3D.length) {
    finalPoint = hit3D[0].point;
  }

  // RETICLE
  if (finalPoint) {
    reticle.visible = true;

    reticle.position.lerp(finalPoint, 0.35);

    reticle.lookAt(camera.position);

    // laser
    const pts = laser.geometry.attributes.position.array;

    pts[0] = camera.position.x;
    pts[1] = camera.position.y;
    pts[2] = camera.position.z;

    pts[3] = reticle.position.x;
    pts[4] = reticle.position.y;
    pts[5] = reticle.position.z;

    laser.geometry.attributes.position.needsUpdate = true;
  } else {
    reticle.visible = false;
  }

  // ROTATION
  if (selectedObject) {
    if (rotateLeft) selectedObject.rotation.y += 0.03;
    if (rotateRight) selectedObject.rotation.y -= 0.03;
  }

  renderer.render(scene, camera);
});

/* =========================
   RESIZE
========================= */
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});