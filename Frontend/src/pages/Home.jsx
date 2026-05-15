import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  useGLTF,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { ArrowLeft, ArrowRight, View, ShoppingBag, Sparkles, Users } from "lucide-react";
import styles from "./Home.module.css";
import { API } from "../api";

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
    spots: {
      sofa_main:    { position: [0,    0, -1.5], rotation: 0 },
      coffee_table: { position: [0,    0,  0.6], rotation: 0 },
      floor_lamp:   { position: [-3,   0, -1.2], rotation: 0 },
      accent_chair: { position: [2.6,  0,  0.6], rotation: -0.6 },
      tv_stand:     { position: [0,    0,  3],   rotation: Math.PI },
      side_table:   { position: [2,    0, -1.5], rotation: 0 },
      plant_decor:  { position: [-3,   0,  2.6], rotation: 0 },
    },
  },
  bedroom: {
    label: "Bedroom",
    floor: "carpet",
    wallColor: "#e6dccb",
    accentColor: "#cbbda4",
    camera: { position: [6, 4, 6], target: [0, 1, 0] },
    spots: {
      bed_main:         { position: [0,    0, -1],   rotation: 0 },
      nightstand_left:  { position: [-2.2, 0, -1.5], rotation: 0 },
      nightstand_right: { position: [2.2,  0, -1.5], rotation: 0 },
      bedside_lamp:     { position: [2.2,  0.55, -1.5], rotation: 0 },
      wardrobe:         { position: [-3.5, 0,  2],   rotation: Math.PI / 2 },
      chair_accent:     { position: [2.5,  0,  2.5], rotation: -0.9 },
    },
  },
  kitchen: {
    label: "Kitchen",
    floor: "tile",
    wallColor: "#f6f3ec",
    accentColor: "#dad6cc",
    camera: { position: [6, 4, 6], target: [0, 1, 0] },
    spots: {
      dining_table:   { position: [0,    0,  0],    rotation: 0 },
      dining_chair_1: { position: [-1.6, 0,  0],    rotation: Math.PI / 2 },
      dining_chair_2: { position: [1.6,  0,  0],    rotation: -Math.PI / 2 },
      bar_stool:      { position: [-3,   0,  2.5],  rotation: 0 },
      cabinet:        { position: [0,    0, -3],    rotation: 0 },
      pendant_light:  { position: [0,    2.6, 0],   rotation: 0 },
    },
  },
  office: {
    label: "Home Office",
    floor: "wood_dark",
    wallColor: "#e8dfcc",
    accentColor: "#bfa988",
    camera: { position: [6, 4, 6], target: [0, 1, 0] },
    spots: {
      desk_main:    { position: [0,    0, -1.5], rotation: 0 },
      office_chair: { position: [0,    0,  0],   rotation: 0 },
      desk_lamp:    { position: [-0.8, 0.75, -1.8], rotation: 0 },
      bookshelf:    { position: [-3.5, 0,  0],   rotation: Math.PI / 2 },
      monitor:      { position: [0,    0.75, -1.8], rotation: 0, decorative: true },
      floor_plant:  { position: [3,    0,  2.5], rotation: 0 },
    },
  },
};

const ROOM_ORDER = ["living_room", "bedroom", "kitchen", "office"];

// Room bounds — floor 12x12, walls on -x and -z, height 8
const ROOM_HALF = 6;
const WALL_H = 8;

// =============================================================
// PROCEDURAL FLOOR TEXTURES (per room)
// =============================================================
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
  const floorRoughness = config.floor === "tile" ? 0.35 : 0.85;

  return (
    <group>
      {/* floor as a thin box (matches wall footprint) */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[ROOM_HALF * 2, 0.1, ROOM_HALF * 2]} />
        <meshStandardMaterial map={floorTex} roughness={floorRoughness} />
      </mesh>

      {/* back wall (z = -ROOM_HALF) */}
      <mesh position={[0, WALL_H / 2, -ROOM_HALF]} receiveShadow>
        <planeGeometry args={[ROOM_HALF * 2, WALL_H]} />
        <meshStandardMaterial color={config.wallColor} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* left wall (x = -ROOM_HALF) */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_HALF, WALL_H / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_HALF * 2, WALL_H]} />
        <meshStandardMaterial color={config.accentColor} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* baseboards */}
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
function ProductModel({ url, position, rotation, interactive, onClick, hovered, onHover }) {
  const safeUrl = url?.startsWith("http") ? url : `${API}/${url}`;
  const { scene } = useGLTF(safeUrl);
  const cloned = useMemo(() => scene.clone(true), [scene]);

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
// ROOM SCENE
// =============================================================
function RoomScene({ roomKey, items, focused, onProductClick, onBack }) {
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
      <Canvas shadows camera={{ position: config.camera.position, fov: 45 }}>
        <color attach="background" args={["#f4ede0"]} />

        <ambientLight intensity={0.55} />
        <directionalLight
          position={[6, 9, 4]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-4, 5, -3]} intensity={0.25} />

        <Suspense fallback={null}>
          <Environment preset="apartment" />
        </Suspense>

        <RoomEnvironment config={config} />
        <ContactShadows position={[0, 0.02, 0]} opacity={0.45} scale={14} blur={2.5} far={4} />

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
          target={config.camera.target}
        />
        <CameraRig
          targetView={targetView}
          controlsRef={controlsRef}
          transitionKey={transitionKey}
        />
      </Canvas>

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
            {focused.item.product.pFinalPrice} DZD
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

  const activeRoomKey = ROOM_ORDER[activeRoomIdx];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/featured/lists`);
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
              <h3>Ayoub</h3>
              <p>Founder · Engineering</p>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.teamAvatar}>A</div>
              <h3>Ayoub</h3>
              <p>Founder · Engineering</p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default Home;