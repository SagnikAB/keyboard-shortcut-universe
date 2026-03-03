import "./style.css";

type OS = "windows" | "mac";

interface Shortcut {
  combo: string;
  description: string;
  category: string;
  os: OS;
}

let currentOS: OS = "windows";

const shortcuts: Shortcut[] = [
  {
    combo: "Control+s",
    description: "Save file",
    category: "File",
    os: "windows",
  },
  { combo: "Control+c", description: "Copy", category: "Edit", os: "windows" },
  { combo: "Control+v", description: "Paste", category: "Edit", os: "windows" },
  { combo: "Control+z", description: "Undo", category: "Edit", os: "windows" },
  {
    combo: "Alt+Tab",
    description: "Switch apps",
    category: "System",
    os: "windows",
  },

  { combo: "Meta+s", description: "Save file", category: "File", os: "mac" },
  { combo: "Meta+c", description: "Copy", category: "Edit", os: "mac" },
  { combo: "Meta+v", description: "Paste", category: "Edit", os: "mac" },
  { combo: "Meta+z", description: "Undo", category: "Edit", os: "mac" },
  {
    combo: "Meta+Tab",
    description: "Switch apps",
    category: "System",
    os: "mac",
  },
];

const layout: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Enter"],
  ["Z", "X", "C", "V", "B", "N", "M"],
  ["Control", "Meta", "Alt", " "],
];

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
<div class="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">

  <h1 class="text-4xl font-bold mb-2">Keyboard Shortcut Universe</h1>
  <p class="text-gray-400 mb-6">Interactive shortcut visualizer</p>

  <div class="flex gap-4 mb-6">
    <button id="windowsBtn" class="osBtn bg-cyan-500 text-black px-4 py-2 rounded-lg">Windows</button>
    <button id="macBtn" class="osBtn bg-gray-800 px-4 py-2 rounded-lg">Mac</button>
  </div>

  <input 
    id="search" 
    placeholder="Search shortcut..." 
    class="mb-6 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 w-72 text-center"
  />

  <div id="keyboard" class="space-y-2 mb-10"></div>

  <div id="infoBox" class="p-6 border border-cyan-400 rounded-xl w-[400px] text-center bg-black">
    <h2 id="combo" class="text-cyan-400 text-xl font-semibold">Press keys</h2>
    <p id="description" class="text-gray-400 text-sm mt-2">Shortcut description</p>
    <p id="category" class="text-xs text-gray-500 mt-1"></p>
  </div>

</div>
`;

const keyboardDiv = document.getElementById("keyboard")!;

layout.forEach((row) => {
  const rowDiv = document.createElement("div");
  rowDiv.className = "flex justify-center gap-2";

  row.forEach((key) => {
    const keyDiv = document.createElement("div");
    keyDiv.textContent = key === " " ? "Space" : key;
    keyDiv.className = `
      key px-4 py-3 bg-gray-900 border border-gray-700 rounded-md
      min-w-[45px] text-center select-none transition-all duration-100
    `;
    keyDiv.setAttribute("data-key", key);
    rowDiv.appendChild(keyDiv);
  });

  keyboardDiv.appendChild(rowDiv);
});

let activeKeys: Set<string> = new Set();

const comboText = document.getElementById("combo")!;
const descriptionText = document.getElementById("description")!;
const categoryText = document.getElementById("category")!;

function playClick() {
  const audio = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3",
  );
  audio.volume = 0.2;
  audio.play();
}

function updateUI() {
  const combo = Array.from(activeKeys).join("+");
  comboText.textContent = combo || "Press keys";

  const match = shortcuts.find((s) => s.combo === combo && s.os === currentOS);

  if (match) {
    descriptionText.textContent = match.description;
    categoryText.textContent = `Category: ${match.category}`;
  } else {
    descriptionText.textContent = "No shortcut mapped";
    categoryText.textContent = "";
  }
}

window.addEventListener("keydown", (e) => {
  const key =
    e.key === " " ? " " : e.key.length === 1 ? e.key.toLowerCase() : e.key;
  activeKeys.add(key);

  document.querySelectorAll(".key").forEach((el) => {
    if (
      el.getAttribute("data-key") === key ||
      el.getAttribute("data-key") === e.key ||
      el.getAttribute("data-key")?.toLowerCase() === key
    ) {
      el.classList.add("bg-cyan-500", "text-black", "scale-110");
    }
  });

  playClick();
  updateUI();
});

window.addEventListener("keyup", (e) => {
  const key =
    e.key === " " ? " " : e.key.length === 1 ? e.key.toLowerCase() : e.key;
  activeKeys.delete(key);

  document.querySelectorAll(".key").forEach((el) => {
    if (
      el.getAttribute("data-key") === key ||
      el.getAttribute("data-key") === e.key ||
      el.getAttribute("data-key")?.toLowerCase() === key
    ) {
      el.classList.remove("bg-cyan-500", "text-black", "scale-110");
    }
  });

  updateUI();
});

document.getElementById("windowsBtn")!.addEventListener("click", () => {
  currentOS = "windows";
  document
    .querySelectorAll(".osBtn")
    .forEach((btn) => btn.classList.remove("bg-cyan-500", "text-black"));
  document
    .getElementById("windowsBtn")!
    .classList.add("bg-cyan-500", "text-black");
});

document.getElementById("macBtn")!.addEventListener("click", () => {
  currentOS = "mac";
  document
    .querySelectorAll(".osBtn")
    .forEach((btn) => btn.classList.remove("bg-cyan-500", "text-black"));
  document.getElementById("macBtn")!.classList.add("bg-cyan-500", "text-black");
});

document.getElementById("search")!.addEventListener("input", (e) => {
  const value = (e.target as HTMLInputElement).value.toLowerCase();

  const match = shortcuts.find(
    (s) => s.description.toLowerCase().includes(value) && s.os === currentOS,
  );

  if (match) {
    comboText.textContent = match.combo;
    descriptionText.textContent = match.description;
    categoryText.textContent = `Category: ${match.category}`;
  }
});
