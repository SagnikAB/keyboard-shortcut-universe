import "./style.css";
import * as THREE from "three";

/* ======================================================
   SHORTCUT DATABASE
====================================================== */

type Shortcut = {
  keys: string[];
  description: string;
  category: "File" | "Edit" | "System";
};

const shortcuts: Shortcut[] = [
  { keys: ["control", "s"], description: "Save File", category: "File" },
  { keys: ["control", "o"], description: "Open File", category: "File" },
  { keys: ["control", "p"], description: "Print", category: "File" },
  { keys: ["control", "c"], description: "Copy", category: "Edit" },
  { keys: ["control", "v"], description: "Paste", category: "Edit" },
  { keys: ["control", "x"], description: "Cut", category: "Edit" },
  { keys: ["control", "z"], description: "Undo", category: "Edit" },
  { keys: ["control", "y"], description: "Redo", category: "Edit" },
  {
    keys: ["alt", "tab"],
    description: "Switch Applications",
    category: "System",
  },
  {
    keys: ["control", "shift", "escape"],
    description: "Task Manager",
    category: "System",
  },
];

/* ======================================================
   UI STRUCTURE
====================================================== */

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
<div class="relative min-h-screen bg-black text-white overflow-hidden">

  <canvas id="bg" class="absolute inset-0 -z-10"></canvas>

  <div class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

    <div class="lg:col-span-2 flex flex-col items-center">

      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Input / Echo
        </h1>
        <p class="text-gray-400 mt-4">
          Interactive Keyboard Shortcut Visualizer
        </p>
      </div>

      <div id="keyboard" class="space-y-2"></div>
    </div>

    <div class="bg-white/5 backdrop-blur-lg border border-cyan-400/30 rounded-2xl p-6">

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-cyan-400">Shortcut History</h2>
        <div class="flex gap-3">
          <button id="exportHistory" class="text-sm text-gray-400 hover:text-green-400">
            Export
          </button>
          <button id="clearHistory" class="text-sm text-gray-400 hover:text-red-400">
            Clear
          </button>
        </div>
      </div>

      <input
        id="searchHistory"
        placeholder="Search shortcuts..."
        class="w-full mb-4 px-3 py-2 rounded bg-black/40 border border-gray-700 text-sm"
      />

      <p id="historyCount" class="text-xs text-gray-500 mb-4">0 shortcuts used</p>

      <div id="memory" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2"></div>

      <p id="emptyState" class="text-gray-600 text-sm mt-6 text-center">
        No shortcuts triggered yet.
      </p>

    </div>

  </div>
</div>
`;

/* ======================================================
   FULL KEYBOARD LAYOUT
====================================================== */

const keyboardLayout = [
  [
    "Escape",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    "F11",
    "F12",
  ],
  [
    "`",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "-",
    "=",
    "Backspace",
  ],
  ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["CapsLock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter"],
  ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Shift"],
  ["Control", "Meta", "Alt", "Space", "Alt", "Meta", "Control"],
];

const keyboardDiv = document.getElementById("keyboard")!;

keyboardLayout.forEach((row) => {
  const rowDiv = document.createElement("div");
  rowDiv.className = "flex justify-center gap-2";

  row.forEach((key) => {
    const keyDiv = document.createElement("div");
    keyDiv.textContent = key;
    keyDiv.className = `
      key px-3 py-2 bg-gray-900 border border-gray-700
      rounded-md min-w-[40px] text-center text-xs
      transition-all duration-200
    `;
    keyDiv.setAttribute("data-key", key.toLowerCase());
    rowDiv.appendChild(keyDiv);
  });

  keyboardDiv.appendChild(rowDiv);
});

/* ======================================================
   SHORTCUT LOGIC
====================================================== */

let activeKeys = new Set<string>();
let historyData: Shortcut[] = [];

function normalizeCombo(keys: string[]) {
  return [...keys].sort().join("+");
}

function matchShortcut() {
  const current = normalizeCombo(Array.from(activeKeys));

  for (const shortcut of shortcuts) {
    if (normalizeCombo(shortcut.keys) === current) {
      return shortcut;
    }
  }

  return null;
}

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  activeKeys.add(key);

  highlightKey(key);

  const match = matchShortcut();
  if (match) {
    createPulse(match.category);
    addHistory(match);
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  activeKeys.delete(key);
  unhighlightKey(key);
});

function highlightKey(key: string) {
  document.querySelectorAll(".key").forEach((el) => {
    if (el.getAttribute("data-key") === key) {
      el.classList.add("bg-cyan-500", "text-black", "scale-110");
    }
  });
}

function unhighlightKey(key: string) {
  document.querySelectorAll(".key").forEach((el) => {
    if (el.getAttribute("data-key") === key) {
      el.classList.remove("bg-cyan-500", "text-black", "scale-110");
    }
  });
}

/* ======================================================
   HISTORY SYSTEM
====================================================== */

const memoryContainer = document.getElementById("memory")!;
const historyCount = document.getElementById("historyCount")!;
const emptyState = document.getElementById("emptyState")!;
const clearBtn = document.getElementById("clearHistory")!;
const exportBtn = document.getElementById("exportHistory")!;
const searchInput = document.getElementById(
  "searchHistory",
) as HTMLInputElement;

function updateCount() {
  historyCount.textContent = `${historyData.length} shortcuts used`;
}

function addHistory(shortcut: Shortcut) {
  historyData.unshift(shortcut);
  renderHistory();
}

function renderHistory() {
  memoryContainer.innerHTML = "";

  const filtered = historyData.filter((s) =>
    s.description.toLowerCase().includes(searchInput.value.toLowerCase()),
  );

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  filtered.forEach((shortcut) => {
    const card = document.createElement("div");
    card.className = `
      p-4 rounded-xl border
      ${categoryColor(shortcut.category)}
      bg-black/40 backdrop-blur
    `;

    card.innerHTML = `
      <h3 class="font-semibold">${shortcut.keys.join(" + ")}</h3>
      <p class="text-sm mt-1">${shortcut.description}</p>
      <p class="text-xs mt-2 opacity-70">${shortcut.category}</p>
    `;

    memoryContainer.appendChild(card);
  });

  updateCount();
}

function categoryColor(category: string) {
  if (category === "File") return "border-blue-500";
  if (category === "Edit") return "border-green-500";
  return "border-red-500";
}

clearBtn.addEventListener("click", () => {
  historyData = [];
  renderHistory();
});

exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(historyData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shortcut-history.json";
  a.click();
});

searchInput.addEventListener("input", renderHistory);

/* ======================================================
   THREE.JS BACKGROUND
====================================================== */

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

const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

const particlesMat = new THREE.PointsMaterial({
  size: 0.02,
  color: 0x00ffff,
  transparent: true,
  opacity: 0.6,
});

const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

function createPulse(category: string) {
  let color = 0x00ffff;
  if (category === "File") color = 0x3b82f6;
  if (category === "Edit") color = 0x22c55e;
  if (category === "System") color = 0xef4444;

  const ringGeo = new THREE.RingGeometry(0.5, 0.6, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });

  const ring = new THREE.Mesh(ringGeo, ringMat);
  scene.add(ring);

  let scale = 1;

  const animatePulse = () => {
    scale += 0.05;
    ring.scale.set(scale, scale, scale);
    ring.material.opacity -= 0.02;

    if (ring.material.opacity <= 0) {
      scene.remove(ring);
      return;
    }

    requestAnimationFrame(animatePulse);
  };

  animatePulse();
}

function animate() {
  requestAnimationFrame(animate);
  particles.rotation.y += 0.0005;
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
