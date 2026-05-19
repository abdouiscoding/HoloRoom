import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  useGLTF,
  Html,
  useProgress
} from "@react-three/drei";
import * as THREE from "three";
import { ArrowLeft, ArrowRight, View, ShoppingBag, Sparkles, Users } from "lucide-react";
import styles from "./Home.module.css";
import { API, myFetch } from "../api";

// loader
function ModelsLoader() {
  const { progress, active } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className={styles.modelsLoader}>
      <div className={styles.modelsLoaderTrack}>
        <div className={styles.modelsLoaderBar} style={{ width: `${progress}%` }} />
      </div>
      <span className={styles.modelsLoaderText}>
        Loading room... {Math.round(progress)}%
      </span>
    </div>
  );
}

// =============================================================
// ROOM CONFIG
// =============================================================
const ROOMS = {
  living_room: {
    label: "Living Room",
    floor: "wood_warm",
    wallColor: "#efe6d4",
    accentColor: "#d8c8aa",
    camera: { position: [6, 4, 6], target: [0, 1, 0] }, 
    spots: { // living_room
    sofa_main:    { position: [0,    0, -1.5], rotation: Math.PI*0.5,         size: 2.8 },
    coffee_table: { position: [0.2,    0,  0.6], rotation: 0,         size: 1.2 },
    floor_lamp:   { position: [-3,   0, -1.2], rotation: 0,         size: 1.8 },
    accent_chair: { position: [2.6,  0,  0.6], rotation: Math.PI * -0.5,      size: 1.2 },
    tv_stand:     { position: [0.2,    0,  3],   rotation: 0,   size: 1.8 },
    tv_screen:    { position: [0.2,    0.5, 3],   rotation: Math.PI,   size: 1.4, decorative: true, model: "https://avmjxpqdjahnptedhuow.supabase.co/storage/v1/object/public/Products_Models/low_poly_tv.glb" },
    side_table:   { position: [2,    0, -1.5], rotation: 0,         size: 0.7 },
    plant_decor:  { position: [-3,   0,  2.6], rotation: 0,         size: 1.5 },
    carpet: { position: [0.8, 0, 0], rotation: Math.PI*0.5, size: 9 },
  },
  },
  bedroom: {
    label: "Bedroom",
    floor: "carpet",
    wallColor: "#e6dccb",
    accentColor: "#cbbda4",
    camera: { position: [6, 4, 6], target: [0, 1, 0] },
    spots: { // bedroom
    bed_main:         { position: [-1,    0, -4.6],   rotation: 0,        size: 2.5 },
    nightstand_left:  { position: [-3.2, 0, -5.5], rotation: 0,        size: 0.7 },
    nightstand_right: { position: [1.2,  0, -5.5], rotation: 0,        size: 0.7 },
    bedside_lamp:     { position: [1.2,  0.7, -5.5], rotation: 0,     size: 0.5 },
    wardrobe:         { position: [-5.3, 0,  -4.6],   rotation: Math.PI/2, size: 2.4 },
    chair_accent:     { position: [2.5,  0,  0], rotation: Math.PI*1.25,     size: 1.5 },
    carpet: { position: [-1.2, 0, -2.7], rotation: Math.PI*0.5, size: 9},
  },
  },
  kitchen: {
    label: "Kitchen",
    floor: "tile",
    wallColor: "#f6f3ec",
    accentColor: "#dad6cc",
    camera: { position: [6, 4, 6], target: [0, 1, 0] },
    spots: { // kitchen
      dining_table:   { position: [0,    0,  0],    rotation: 0,         size: 4 },
      cabinet:        { position: [0,    0, -5.5],    rotation: Math.PI*1.5,         size: 4 },
      pendant_light:  { position: [0,    2.6, 0],   rotation: 0,         size: 2 },
    },
  },
  office: {
    label: "Home Office",
    floor: "wood_dark",
    wallColor: "#e8dfcc",
    accentColor: "#bfa988",
    camera: { position: [6, 4, 6], target: [0, 1, 0] },
    spots: { // office
      desk_main:    { position: [0,    0, -1.5], rotation: 0,         size: 1.8 },
      office_chair: { position: [0,    0,  -0.8],   rotation: Math.PI,         size: 1.1 },
      desk_lamp:    { position: [-0.6, 0.9, -1.7], rotation: Math.PI*-0.25,      size: 1.0 },
      bookshelf:    { position: [-3.5, 0.01,  0],   rotation: Math.PI/2, size: 2.2 },
      floor_plant:  { position: [3,    0,  2.5], rotation: 0,         size: 1.5 },
      carpet: { position: [0, 0, -0.5], rotation: 0, size: 8 },
    },
  },
};

const ROOM_ORDER = ["living_room", "bedroom", "kitchen", "office"];

// Room bounds — floor 12x12, walls on -x and -z, height 8
const ROOM_HALF = 6;
const WALL_H = 8;

// =============================================================
// PROCEDURAL FLOOR/WALL TEXTURES (per room)
// =============================================================
function makeWallTexture(baseColor) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // subtle vertical paint streaks
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
    const x = Math.random() * 512;
    ctx.fillRect(x, 0, 1, 512);
  }
  // micro-grain
  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.025})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function useWallTexture(color) {
  return useMemo(() => makeWallTexture(color), [color]);
}
function makeFloorTexture(type) {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const ctx = c.getContext("2d");

  if (type === "wood_warm" || type === "wood_dark") {
    const base = type === "wood_warm" ? "#9c7549" : "#5b4530";
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 1024, 1024);
    const plankH = 96;
    for (let y = 0; y < 1024; y += plankH) {
      // shading
      const g = ctx.createLinearGradient(0, y, 0, y + plankH);
      g.addColorStop(0,   "rgba(0,0,0,0.10)");
      g.addColorStop(0.5, "rgba(255,255,255,0.04)");
      g.addColorStop(1,   "rgba(0,0,0,0.10)");
      ctx.fillStyle = g;
      ctx.fillRect(0, y, 1024, plankH);
      // gap
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, y, 1024, 2);
      // grain streaks
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`;
        ctx.fillRect(Math.random() * 1024, y + Math.random() * plankH, Math.random() * 100 + 40, 1);
      }
    }
  } else if (type === "carpet") {
    ctx.fillStyle = "#c9a98a";
    ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 18000; i++) {
      const a = Math.random() * 0.08;
      const v = Math.random() < 0.5 ? 0 : 255;
      ctx.fillStyle = `rgba(${v},${v},${v},${a})`;
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }
  } else if (type === "tile") {
    ctx.fillStyle = "#ece9e2";
    ctx.fillRect(0, 0, 1024, 1024);
    const t = 128;
    for (let x = 0; x < 1024; x += t) {
      for (let y = 0; y < 1024; y += t) {
        const g = ctx.createLinearGradient(x, y, x + t, y + t);
        g.addColorStop(0, "rgba(255,255,255,0.07)");
        g.addColorStop(1, "rgba(0,0,0,0.07)");
        ctx.fillStyle = g;
        ctx.fillRect(x, y, t, t);
      }
    }
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    for (let x = 0; x <= 1024; x += t) ctx.fillRect(x - 1, 0, 2, 1024);
    for (let y = 0; y <= 1024; y += t) ctx.fillRect(0, y - 1, 1024, 2);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function useFloorTexture(type) {
  return useMemo(() => makeFloorTexture(type), [type]);
}

// =============================================================
// ROOM ENVIRONMENT — floor + 2 walls, properly sized
// =============================================================
function RoomEnvironment({ config }) {
  const floorTex = useFloorTexture(config.floor);
  const wallTex = useWallTexture(config.wallColor);
  const accentTex = useWallTexture(config.accentColor);
  const floorRoughness = config.floor === "tile" ? 0.35 : 0.85;

  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[ROOM_HALF * 2, 0.1, ROOM_HALF * 2]} />
        <meshStandardMaterial map={floorTex} roughness={floorRoughness} />
      </mesh>

      <mesh position={[0, WALL_H / 2, -ROOM_HALF]} receiveShadow>
        <planeGeometry args={[ROOM_HALF * 2, WALL_H]} />
        <meshStandardMaterial map={wallTex} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_HALF, WALL_H / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_HALF * 2, WALL_H]} />
        <meshStandardMaterial map={accentTex} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.05, -ROOM_HALF + 0.01]}>
        <boxGeometry args={[ROOM_HALF * 2, 0.12, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-ROOM_HALF + 0.01, 0.05, 0]}>
        <boxGeometry args={[0.02, 0.12, ROOM_HALF * 2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
// =============================================================
// PRODUCTS
// =============================================================
function ProductModel({ url, position, rotation, targetSize, interactive, onClick, hovered, onHover }) {
  const safeUrl = url?.startsWith("http") ? url : `${API}/${url}`;
  const { scene } = useGLTF(safeUrl);

  const cloned = useMemo(() => {
    const c = scene.clone(true);

    if (targetSize) {
      // measure raw size
      const box = new THREE.Box3().setFromObject(c);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);

      if (maxDim > 0) {
        c.scale.setScalar(targetSize / maxDim);

        // re-measure after scale, then sit bottom at y=0 and center on x/z
        const newBox = new THREE.Box3().setFromObject(c);
        c.position.set(
          -(newBox.max.x + newBox.min.x) / 2,
          -newBox.min.y,
          -(newBox.max.z + newBox.min.z) / 2
        );
      }
    }
    return c;
  }, [scene, targetSize]);

  const handlers = interactive
    ? {
        onClick: (e) => { e.stopPropagation(); onClick(); },
        onPointerOver: (e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; },
        onPointerOut: () => { onHover(false); document.body.style.cursor = "default"; },
      }
    : {};

  return (
    <group
      position={position}
      rotation={[0, rotation || 0, 0]}
      scale={interactive && hovered ? 1.04 : 1}
      {...handlers}
    >
      <primitive object={cloned} castShadow receiveShadow />
    </group>
  );
}

function FallbackBox({ position, label, interactive, onClick, onHover, hovered }) {
  const handlers = interactive
    ? {
        onClick: (e) => { e.stopPropagation(); onClick(); },
        onPointerOver: (e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; },
        onPointerOut: () => { onHover(false); document.body.style.cursor = "default"; },
      }
    : {};

  return (
    <group position={position}>
      <mesh {...handlers}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? "#e69100" : "#bbbbbb"} />
      </mesh>
      {interactive && (
        <Html position={[0, 1, 0]} center distanceFactor={8} zIndexRange={[1, 0]}>
          <div className={styles.spotLabel}>{label}</div>
        </Html>
      )}
    </group>
  );
}

function SpotProduct({ spotKey, spotConfig, item, onClick }) {
  const [hovered, setHovered] = useState(false);
  const product = item?.product;
  const interactive = !spotConfig.decorative;

    if (spotConfig.model) {
    return (
      <Suspense fallback={null}>
        <ProductModel
          url={spotConfig.model}
          position={spotConfig.position}
          rotation={spotConfig.rotation}
          targetSize={spotConfig.size}
          interactive={interactive}
          hovered={hovered}
          onHover={setHovered}
          onClick={() => {}}
        />
      </Suspense>
    );
  }

  // empty spot: always render a placeholder for interactive room positions
  if (!product || !product.p3DModel) {
    if (!interactive) return null;
    return (
      <FallbackBox
        position={[spotConfig.position[0], spotConfig.position[1] + 0.5, spotConfig.position[2]]}
        label={spotKey}
        interactive={true}
        hovered={hovered}
        onHover={setHovered}
        onClick={() => product && onClick(item, spotConfig)}
      />
    );
  }

  return (
    <Suspense fallback={null}>
      <ProductModel
        url={product.p3DModel}
        position={spotConfig.position}
        rotation={spotConfig.rotation}
        targetSize={spotConfig.size}
        interactive={interactive}
        hovered={hovered}
        onHover={setHovered}
        onClick={() => onClick(item, spotConfig)}
      />
    </Suspense>
  );
}

// =============================================================
// CAMERA RIG — animates only during transitions, then releases
// =============================================================
function CameraRig({ targetView, controlsRef, transitionKey }) {
  const { camera } = useThree();
  const animatingRef = useRef(true);
  const lastKey = useRef(null);

  useEffect(() => {
    if (lastKey.current !== transitionKey) {
      animatingRef.current = true;
      lastKey.current = transitionKey;
    }
  }, [transitionKey]);

  useFrame(() => {
    if (!animatingRef.current || !targetView) return;

    const tp = new THREE.Vector3(...targetView.position);
    const tt = new THREE.Vector3(...targetView.target);

    camera.position.lerp(tp, 0.09);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(tt, 0.09);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(tp) < 0.04 &&
        controlsRef.current.target.distanceTo(tt) < 0.04
      ) {
        camera.position.copy(tp);
        controlsRef.current.target.copy(tt);
        controlsRef.current.update();
        animatingRef.current = false; // release control to OrbitControls
      }
    }
  });
  return null;
}

// =============================================================
// CEILING LAMPS 
// =============================================================
function CeilingLamp() {
  const lampPosition = [0, 7.2, 0];

  return (
    <group>
      {/* lamp visual */}
      <group position={lampPosition}>
        {/* cord */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* shade */}
        <mesh position={[0, -0.05, 0]}>
          <coneGeometry args={[0.45, 0.4, 24, 1, true]} />
          <meshStandardMaterial
            color="#2a2a2a"
            side={THREE.DoubleSide}
            roughness={0.6}
          />
        </mesh>

        {/* glowing bulb */}
        <mesh position={[0, -0.22, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            emissive="#ffe2b3"
            emissiveIntensity={2.5}
            color="#fff5dc"
          />
        </mesh>
      </group>

      {/* main room spotlight */}
      <spotLight
        position={lampPosition}
        angle={1.05} // wide enough for whole room
        penumbra={0.65}
        intensity={160}
        distance={30}
        decay={1.8}
        castShadow
        color="#fff1d6"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* soft fill so corners don't die */}
      <ambientLight intensity={0.12} />

      {/* subtle warm bounce */}
      <pointLight
        position={[0, 3, 0]}
        intensity={3}
        distance={20}
        decay={2}
        color="#ffe7c0"
      />
    </group>
  );
}

// =============================================================
// ROOM SCENE
// =============================================================
function RoomScene({ roomKey, items, focused, onProductClick, onBack, calctotaldis }) {
  const config = ROOMS[roomKey];
  const controlsRef = useRef();

  const targetView = focused
    ? {
        position: [
          focused.spotConfig.position[0] + 2.2,
          focused.spotConfig.position[1] + 1.4,
          focused.spotConfig.position[2] + 2.2,
        ],
        target: [
          focused.spotConfig.position[0],
          focused.spotConfig.position[1] + 0.6,
          focused.spotConfig.position[2],
        ],
      }
    : config.camera;

  const transitionKey = focused
    ? `f-${roomKey}-${focused.spotConfig.position.join(",")}`
    : `r-${roomKey}`;

  const itemsBySpot = useMemo(() => {
    const m = {};
    (items || []).forEach((it) => { if (it.spot) m[it.spot] = it; });
    return m;
  }, [items]);

  return (
    <div className={styles.canvasShell}>
      <Canvas
        shadows
        camera={{ position: config.camera.position, fov: 45 }}
        gl={{ shadowMapType: THREE.PCFSoftShadowMap }}
      >
        <color attach="background" args={["#0a0807"]} />

        <ambientLight intensity={0.15} />
        <CeilingLamp />

        <RoomEnvironment config={config} />
        <ContactShadows position={[0, 0.02, 0]} opacity={0.55} scale={14} blur={2.5} far={4} />

        {Object.entries(config.spots).map(([spotKey, spotConfig]) => (
          <SpotProduct
            key={spotKey}
            spotKey={spotKey}
            spotConfig={spotConfig}
            item={itemsBySpot[spotKey]}
            onClick={(item, sc) => onProductClick({ item, spotConfig: sc })}
          />
        ))}

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={focused ? 1.5 : 4}
          maxDistance={focused ? 6 : 11}
        />
        <CameraRig
          targetView={targetView}
          controlsRef={controlsRef}
          transitionKey={transitionKey}
        />
      </Canvas>
      <ModelsLoader />

      {focused && (
        <button className={styles.backToRoomBtn} onClick={onBack}>
          <ArrowLeft size={16} /> Back to room
        </button>
      )}

      {focused?.item?.product && (
        <div className={styles.focusedProductCard}>
          <div className={styles.focusedProductName}>{focused.item.product.pName}</div>
          {focused.item.product.pBrand && (
            <div className={styles.focusedProductBrand}>{focused.item.product.pBrand}</div>
          )}
          <div className={styles.focusedProductPrice}>
            {calctotaldis(focused.item.product.pDiscount) > 0 ? (
              <>
                <span className={styles.priceMain}>
                  {focused.item.product.pPrice - (focused.item.product.pPrice * (calctotaldis(focused.item.product.pDiscount) / 100))} DZD
                </span>
                <span className={styles.priceOld}>
                  {focused.item.product.pPrice} DZD
                </span>
                <span className={styles.priceBadge}>
                  -{calctotaldis(focused.item.product.pDiscount)}%
                </span>
              </>
            ) : (
              <span className={styles.priceMain}>
                {focused.item.product.pPrice} DZD
              </span>
            )}
          </div>
          <Link
            to={`/product/${encodeURIComponent(focused.item.product.pName)}`}
            className={styles.focusedProductBtn}
            onClick={() => localStorage.setItem("selectedProductId", focused.item.product.pId)}
          >
            More info <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

// =============================================================
// SCROLL REVEAL
// =============================================================
function useReveal() {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}
function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.revealVisible : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// =============================================================
// MAIN
// =============================================================
const Home = () => {
  const [rooms, setRooms] = useState({});
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);
  const [focused, setFocused] = useState(null);

  const [globalDiscount, setGlobalDiscount] = useState(0);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await myFetch(`${API}/api/discounts/active`);
        const data = await res.json();
        const total = Math.min(
          (data || [])
            .filter(d => d.active && d.productId == null)
            .reduce((sum, d) => sum + (d.percentage || 0), 0),
          80
        );
        setGlobalDiscount(total);
      } catch (e) {
        console.error("Discounts fetch failed:", e);
        setGlobalDiscount(0);
      }
    };
    fetchDiscounts();
  }, []);

  const calctotaldis = (productDiscount) =>
    Math.min((productDiscount || 0) + globalDiscount, 80);

  const activeRoomKey = ROOM_ORDER[activeRoomIdx];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await myFetch(`${API}/api/featured/lists`);
        const lists = await res.json();
        const byName = {};
        lists.forEach((l) => (byName[l.name] = l.items || []));
        setRooms(byName);
      } catch (e) {
        console.error("Featured rooms fetch failed:", e);
      }
    };
    load();
  }, []);

  const nextRoom = () => { setFocused(null); setActiveRoomIdx((i) => (i + 1) % ROOM_ORDER.length); };
  const prevRoom = () => { setFocused(null); setActiveRoomIdx((i) => (i - 1 + ROOM_ORDER.length) % ROOM_ORDER.length); };

  return (
    <div className={styles.homeContainer}>
      <section className={styles.roomsHero}>
        <div className={styles.roomsHeader}>
          <div>
            <span className={styles.roomsKicker}>
              <Sparkles size={14} /> Step inside
            </span>
            <h1 className={styles.roomsTitle}>{ROOMS[activeRoomKey].label}</h1>
            <p className={styles.roomsSubtitle}>Drag to look around · Click any piece to inspect</p>
          </div>

          <div className={styles.roomsNav}>
            <button className={styles.roomNavBtn} onClick={prevRoom}><ArrowLeft size={18} /></button>
            <div className={styles.roomDots}>
              {ROOM_ORDER.map((k, i) => (
                <button
                  key={k}
                  className={`${styles.roomDot} ${i === activeRoomIdx ? styles.roomDotActive : ""}`}
                  onClick={() => { setFocused(null); setActiveRoomIdx(i); }}
                />
              ))}
            </div>
            <button className={styles.roomNavBtn} onClick={nextRoom}><ArrowRight size={18} /></button>
          </div>
        </div>

        <RoomScene
          roomKey={activeRoomKey}
          items={rooms[activeRoomKey] || []}
          focused={focused}
          onProductClick={setFocused}
          onBack={() => setFocused(null)}
          calctotaldis={calctotaldis}
        />
      </section>

      <section className={styles.aboutSection}>
        <Reveal><h2 className={styles.sectionH2}>Furniture, <span className="text-gradient">tried before bought.</span></h2></Reveal>
        <Reveal delay={120}>
          <p className={styles.aboutLead}>
            HoloRoom lets you place real furniture inside your real home before you buy
            anything. No more guessing if a sofa fits. No more returns. Just see it,
            move it, decide.
          </p>
        </Reveal>

        <div className={styles.featureGrid}>
          <Reveal><div className={styles.featureCard}><View size={28} /><h3>AR Preview</h3><p>Aim your phone at the floor. Watch furniture appear at real scale, exactly where you'd put it.</p></div></Reveal>
          <Reveal delay={120}><div className={styles.featureCard}><Sparkles size={28} /><h3>3D Showrooms</h3><p>Browse fully staged rooms in your browser. Click any piece to inspect it from every angle.</p></div></Reveal>
          <Reveal delay={240}><div className={styles.featureCard}><ShoppingBag size={28} /><h3>Order in one tap</h3><p>Like what you see? Cash on delivery anywhere in Algeria, or pay by card at checkout.</p></div></Reveal>
        </div>

        <Reveal delay={120}>
          <div className={styles.aboutCta}>
            <Link to="/shop" className={styles.ctaBtn}>Browse the catalog <ArrowRight size={18} /></Link>
          </div>
        </Reveal>
      </section>

      <section className={styles.teamSection}>
        <Reveal>
          <h2 className={styles.sectionH2}>
            <Users size={22} style={{ verticalAlign: "-4px", marginRight: 8 }} />
            The team
          </h2>
        </Reveal>
        <div className={styles.teamGrid}>
          <Reveal delay={120}>
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>A</div>
              <h3>Ayoub Guermache</h3>
              <p>Tester and Memory writer</p>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>A</div>
              <h3>Abderrahim Ferdi</h3>
              <p>Developer · Backend</p>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>B</div>
              <h3>Anis Ben Abderrahmane</h3>
              <p>Developer · Frontend</p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;