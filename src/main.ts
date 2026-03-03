import "./style.css";
import * as THREE from "three";

/* ===========================
   SHORTCUT DATABASE
=========================== */

type Shortcut = {
  combo: string;
  description: string;
  category: string;
};

const shortcuts: Shortcut[] = [
  { combo: "Control+s", description: "Save file", category: "File" },
  { combo: "Control+o", description: "Open file", category: "File" },
  { combo: "Control+p", description: "Print", category: "File" },
  { combo: "Control+c", description: "Copy", category: "Edit" },
  { combo: "Control+v", description: "Paste", category: "Edit" },
  { combo: "Control+x", description: "Cut", category: "Edit" },
  { combo: "Control+z", description: "Undo", category: "Edit" },
  { combo: "Control+y", description: "Redo", category: "Edit" },
  { combo: "Alt+Tab", description: "Switch Applications", category: "System" },
  {
    combo: "Control+Shift+Escape",
    description: "Open Task Manager",
    category: "System",
  },
];

/* ===========================
   UI STRUCTURE
=========================== */

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
<div class="relative min-h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center px-6">

  <canvas id="bg" class="absolute inset-0 -z-10"></canvas>

  <div class="text-center mb-14">
    <h1 class="text-5xl font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
      Input / Echo
    </h1>
    <p class="text-gray-400 mt-4 text-lg">
      Every shortcut leaves a trace in digital space
    </p>
  </div>

  <div id="keyboard" class="space-y-3 mb-12"></div>

  <div id="memory" class="fixed right-6 bottom-6 w-[320px] space-y-4 max-h-[60vh] overflow-y-auto"></div>

</div>
`;

/* ===========================
   KEYBOARD UI
=========================== */

const layout = [
  ["Control", "Shift", "Alt", "Meta"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const keyboardDiv = document.getElementById("keyboard")!;

layout.forEach((row) => {
  const rowDiv = document.createElement("div");
  rowDiv.className = "flex justify-center gap-3";

  row.forEach((key) => {
    const keyDiv = document.createElement("div");
    keyDiv.textContent = key;
    keyDiv.className = `
      key px-5 py-3 bg-gray-900/80 border border-gray-700
      rounded-lg min-w-[60px] text-center
      transition-all duration-200 cursor-pointer
      hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]
    `;
    keyDiv.setAttribute("data-key", key);
    rowDiv.appendChild(keyDiv);
  });

  keyboardDiv.appendChild(rowDiv);
});

/* ===========================
   MEMORY SYSTEM
=========================== */

const memoryContainer = document.getElementById("memory")!;

function createMemoryCard(shortcut: Shortcut) {
  const card = document.createElement("div");
  card.className = `
    backdrop-blur-md bg-white/5 border border-cyan-400/40
    rounded-xl p-4 shadow-[0_0_25px_rgba(0,255,255,0.15)]
    animate-fadeIn
  `;

  card.innerHTML = `
    <h3 class="text-cyan-400 font-semibold">${shortcut.combo}</h3>
    <p class="text-gray-200 text-sm mt-1">${shortcut.description}</p>
    <p class="text-xs text-gray-500 mt-2">${shortcut.category}</p>
  `;

  memoryContainer.prepend(card);
}

/* ===========================
   SHORTCUT LOGIC
=========================== */

let activeKeys = new Set<string>();

window.addEventListener("keydown", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  activeKeys.add(key);

  document.querySelectorAll(".key").forEach((el) => {
    if (el.getAttribute("data-key")?.toLowerCase() === key.toLowerCase()) {
      el.classList.add(
        "bg-cyan-500",
        "text-black",
        "scale-110",
        "shadow-[0_0_20px_rgba(0,255,255,0.8)]",
      );
    }
  });

  const combo = Array.from(activeKeys).join("+");
  const match = shortcuts.find((s) => s.combo === combo);

  if (match) {
    createPulse();
    createMemoryCard(match);
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  activeKeys.delete(key);

  document.querySelectorAll(".key").forEach((el) => {
    if (el.getAttribute("data-key")?.toLowerCase() === key.toLowerCase()) {
      el.classList.remove(
        "bg-cyan-500",
        "text-black",
        "scale-110",
        "shadow-[0_0_20px_rgba(0,255,255,0.8)]",
      );
    }
  });
});

/* ===========================
   THREE.JS INTERACTIVE FIELD
=========================== */

const canvas = document.getElementById("bg") as HTMLCanvasElement;
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.z = 6;

// PARTICLE FIELD

const particleCount = 2000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 15;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  size: 0.03,
  color: 0x00ffff,
  transparent: true,
  opacity: 0.6,
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// ENERGY PULSE

function createPulse() {
  const ringGeo = new THREE.RingGeometry(0.5, 0.6, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });

  const ring = new THREE.Mesh(ringGeo, ringMat);
  scene.add(ring);

  let scale = 1;

  const pulse = () => {
    scale += 0.05;
    ring.scale.set(scale, scale, scale);
    ring.material.opacity -= 0.02;

    if (ring.material.opacity <= 0) {
      scene.remove(ring);
      return;
    }

    requestAnimationFrame(pulse);
  };

  pulse();
}

// AMBIENT CAMERA FLOAT

function animate() {
  requestAnimationFrame(animate);

  particles.rotation.y += 0.0007;
  particles.rotation.x += 0.0002;

  camera.position.x = Math.sin(Date.now() * 0.0003) * 0.3;
  camera.position.y = Math.cos(Date.now() * 0.0002) * 0.3;

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
