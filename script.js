let highestZIndex = 1;
let osState = { windows: {} };

document.addEventListener('DOMContentLoaded', () => {
  initMainThreeJS();
  updateClock(); setInterval(updateClock, 1000);
  if(document.getElementById('term-time')) document.getElementById('term-time').innerText = new Date().toLocaleString();

  const windows = document.querySelectorAll('.window');
  windows.forEach(win => { setupWindowBehaviors(win); restoreWindowState(win); });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#top-bar') && !e.target.closest('.popup-menu')) {
      document.querySelectorAll('.popup-menu').forEach(menu => menu.classList.add('hidden'));
    }
  });

  initStudio();
  fetchWeather();
  initTTT();
  initC4();
});

// ==========================================
// WINDOW MANAGEMENT (With 3D Viewer Fix)
// ==========================================
function setupWindowBehaviors(win) { win.addEventListener('mousedown', () => bringToFront(win)); makeDraggable(win); }
function bringToFront(element) { highestZIndex++; element.style.zIndex = highestZIndex; document.querySelector('.active-app-name').innerText = element.querySelector('.window-title').innerText; }

function openWindow(windowId) {
  const win = document.getElementById(windowId);
  if (win) { 
    win.style.display = 'flex'; 
    bringToFront(win); 
    
    // FIX: Resize canvas/3D elements when window becomes visible
    if(windowId === 'window-studio') resizeStudioCanvas();
    if(windowId === 'window-3d') {
      if(!viewerInitialized) initViewerThreeJS();
      else resizeViewer();
    }
  }
}

function closeWindow(windowId) {
  const win = document.getElementById(windowId);
  if (win) win.style.display = 'none'; 
}

function restoreWindowState(win) {
  win.style.top = win.getAttribute('data-y') + 'px'; 
  win.style.left = win.getAttribute('data-x') + 'px';
  win.style.width = win.getAttribute('data-w') + 'px';
  win.style.height = win.getAttribute('data-h') + 'px';
}

function makeDraggable(element) {
  const header = document.getElementById(element.id + '-header');
  if (!header) return;
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  header.onmousedown = (e) => { if(!e.target.classList.contains('mac-btn')){ e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY; document.onmouseup = closeDrag; document.onmousemove = elementDrag; }};
  function elementDrag(e) { e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY; element.style.top = (element.offsetTop - pos2) + "px"; element.style.left = (element.offsetLeft - pos1) + "px"; }
  function closeDrag() { document.onmouseup = null; document.onmousemove = null; }
}

// ==========================================
// UTILITIES
// ==========================================
function updateClock() { document.getElementById('clock').innerText = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', ''); }
function toggleMenu(menuId) { document.getElementById(menuId).classList.toggle('hidden'); }
function resetState() { location.reload(); }

// Terminal logic
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');
if(termInput) {
  termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const command = this.value.trim();
      termOutput.innerHTML += `<div>tushar@macbook ~ % ${command}</div>`;
      if(command === 'clear') termOutput.innerHTML = '';
      else if(command === 'whoami') termOutput.innerHTML += `<div>Tushar Shah - Dev & Digital Artist</div>`;
      else if(command !== '') termOutput.innerHTML += `<div>zsh: command not found: ${command}</div>`;
      this.value = ''; document.querySelector('.terminal-content').scrollTop = termOutput.scrollHeight;
    }
  });
}

// Calculator logic
let calcVal = '0';
function calcAction(action) {
  const display = document.getElementById('calc-display');
  if (action === 'clear') calcVal = '0';
  else if (action === '=') { try { calcVal = eval(calcVal).toString(); } catch(e) { calcVal = 'Error'; } }
  else { if (calcVal === '0' || calcVal === 'Error') calcVal = action; else calcVal += action; }
  display.innerText = calcVal.substring(0, 10);
}

// Theme
let threeMaterial;
function toggleTheme() {
  const isDark = document.getElementById('theme-toggle').checked;
  if(threeMaterial) threeMaterial.color.setHex(isDark ? 0x92b9e1 : 0xff7b54); 
}

// ==========================================
// GAMES RESTORED
// ==========================================
// Tic Tac Toe
let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttPlayer = 'X'; let tttActive = true;
function initTTT() {
  tttBoard = ['', '', '', '', '', '', '', '', ''];
  tttPlayer = 'X'; tttActive = true;
  document.getElementById('ttt-status').innerText = "Player X's Turn";
  const boardEl = document.getElementById('ttt-board');
  boardEl.innerHTML = '';
  for(let i=0; i<9; i++) {
    const cell = document.createElement('div'); cell.className = 'ttt-cell';
    cell.onclick = () => playTTT(i, cell); boardEl.appendChild(cell);
  }
}
function playTTT(index, cellEl) {
  if(tttBoard[index] !== '' || !tttActive) return;
  tttBoard[index] = tttPlayer; cellEl.innerText = tttPlayer;
  cellEl.style.color = tttPlayer === 'X' ? '#ff3b30' : '#007aff'; checkTTTWin();
}
function checkTTTWin() {
  const winConditions = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
  let won = false;
  for(let i=0; i<winConditions.length; i++) {
    const [a,b,c] = winConditions[i];
    if(tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) { won = true; break; }
  }
  if(won) { document.getElementById('ttt-status').innerText = `Player ${tttPlayer} Wins!`; tttActive = false; } 
  else if(!tttBoard.includes('')) { document.getElementById('ttt-status').innerText = `It's a Draw!`; tttActive = false; } 
  else { tttPlayer = tttPlayer === 'X' ? 'O' : 'X'; document.getElementById('ttt-status').innerText = `Player ${tttPlayer}'s Turn`; }
}

// Connect Four
const ROWS = 6; const COLS = 7;
let c4Board = []; let c4Player = 'red'; let c4Active = true;
function initC4() {
  c4Board = Array.from({length: ROWS}, () => Array(COLS).fill(null));
  c4Player = 'red'; c4Active = true;
  document.getElementById('c4-status').innerText = "Red's Turn"; document.getElementById('c4-status').style.color = "#ff3b30";
  const boardEl = document.getElementById('c4-board'); boardEl.innerHTML = '';
  for(let r=0; r<ROWS; r++) {
    for(let c=0; c<COLS; c++) {
      const cell = document.createElement('div'); cell.className = 'c4-cell'; cell.id = `c4-${r}-${c}`;
      cell.onclick = () => playC4(c); boardEl.appendChild(cell);
    }
  }
}
function playC4(col) {
  if(!c4Active) return;
  let rowToDrop = -1;
  for(let r = ROWS - 1; r >= 0; r--) { if(c4Board[r][col] === null) { rowToDrop = r; break; } }
  if(rowToDrop === -1) return;
  c4Board[rowToDrop][col] = c4Player;
  document.getElementById(`c4-${rowToDrop}-${col}`).classList.add(c4Player);
  if(checkC4Win(rowToDrop, col)) { document.getElementById('c4-status').innerText = `${c4Player.toUpperCase()} Wins!`; c4Active = false; } 
  else { c4Player = c4Player === 'red' ? 'yellow' : 'red'; document.getElementById('c4-status').innerText = `${c4Player.toUpperCase()}'s Turn`; document.getElementById('c4-status').style.color = c4Player === 'red' ? '#ff3b30' : '#ffcc00'; }
}
function checkC4Win(r, c) { return checkDirection(r, c, 1, 0) || checkDirection(r, c, 0, 1) || checkDirection(r, c, 1, 1) || checkDirection(r, c, 1, -1); }
function checkDirection(r, c, rDir, cDir) {
  let count = 0;
  for(let i = -3; i <= 3; i++) {
    const row = r + (i * rDir); const col = c + (i * cDir);
    if(row >= 0 && row < ROWS && col >= 0 && col < COLS && c4Board[row][col] === c4Player) { count++; if(count === 4) return true; } 
    else count = 0;
  }
  return false;
}


// ==========================================
// FIX 1: STUDIO (RELATIVE OFFSETS)
// ==========================================
let canvas, ctx, isDrawing = false;

function resizeStudioCanvas() {
  if(!canvas) return;
  canvas.width = canvas.parentElement.clientWidth;
  // Account for header and toolbar heights
  canvas.height = canvas.parentElement.clientHeight - 40 - 45; 
}

function initStudio() {
  canvas = document.getElementById('studio-canvas');
  ctx = canvas.getContext('2d');
  
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
}

function startDrawing(e) { isDrawing = true; draw(e); }
function draw(e) {
  if (!isDrawing) return;
  // FIX: Using offsetX/offsetY ignores absolute window positions
  const x = e.offsetX;
  const y = e.offsetY;

  ctx.lineWidth = document.getElementById('studio-size').value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = document.getElementById('studio-color').value;

  ctx.lineTo(x, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y);
}
function stopDrawing() { isDrawing = false; ctx.beginPath(); }
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }


// ==========================================
// WEATHER (ASYNC)
// ==========================================
async function fetchWeather() {
  const tempEl = document.getElementById('w-temp');
  const descEl = document.getElementById('w-desc');
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=23.0225&longitude=72.5714&current_weather=true');
    const data = await response.json();
    if(data && data.current_weather) {
      tempEl.innerText = `${Math.round(data.current_weather.temperature)}°C`;
      descEl.innerText = `Wind: ${data.current_weather.windspeed} km/h`;
    }
  } catch (error) {
    tempEl.innerText = "Error"; descEl.innerText = "Check connection";
  }
}


// ==========================================
// FIX 2: TASKS (ADD & DELETE)
// ==========================================
let taskIdCounter = 100;

function addTask() {
  const input = document.getElementById('new-task-input');
  const text = input.value.trim();
  if(text === '') return;
  
  const id = `task${taskIdCounter++}`;
  const taskDiv = document.createElement('div');
  taskDiv.className = 'task-card';
  taskDiv.draggable = true;
  taskDiv.id = id;
  taskDiv.ondragstart = drag;
  
  taskDiv.innerHTML = `${text} <span class="del-btn" onclick="deleteTask('${id}')">✕</span>`;
  document.getElementById('todo').appendChild(taskDiv);
  input.value = '';
}

function deleteTask(id) {
  const task = document.getElementById(id);
  if(task) task.remove();
}

function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }
function drop(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  const draggedElement = document.getElementById(data);
  if (ev.target.classList.contains('kanban-col')) ev.target.appendChild(draggedElement);
  else if (ev.target.parentElement.classList.contains('kanban-col')) ev.target.parentElement.appendChild(draggedElement);
}

// ==========================================
// FIX 3: 3D ENGINES (INIT TIMING)
// ==========================================

function initMainThreeJS() {
  const canvas = document.getElementById('bg-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight); camera.position.z = 50;

  const geometry = new THREE.BufferGeometry();
  const posArray = new Float32Array(4500);
  for(let i = 0; i < 4500; i++) posArray[i] = (Math.random() - 0.5) * 150;

  geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  threeMaterial = new THREE.PointsMaterial({ size: 0.2, color: 0x92b9e1 });
  const particlesMesh = new THREE.Points(geometry, threeMaterial); scene.add(particlesMesh);

  let mouseX = 0; let mouseY = 0;
  document.addEventListener('mousemove', (e) => { mouseX = (e.clientX / window.innerWidth) - 0.5; mouseY = (e.clientY / window.innerHeight) - 0.5; });

  function animate() {
    requestAnimationFrame(animate);
    particlesMesh.rotation.y += 0.001; particlesMesh.rotation.x += 0.0005;
    particlesMesh.position.x += (mouseX * 5 - particlesMesh.position.x) * 0.05;
    particlesMesh.position.y += (-mouseY * 5 - particlesMesh.position.y) * 0.05;
    renderer.render(scene, camera);
  }
  animate();
}


let viewerInitialized = false;
let viewerRenderer, viewerCamera;

function initViewerThreeJS() {
  const container = document.getElementById('viewer-container');
  // Avoid initializing if container still has 0 width
  if(container.clientWidth === 0) return; 
  
  viewerInitialized = true;
  const scene = new THREE.Scene();
  viewerCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  viewerRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  
  viewerRenderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(viewerRenderer.domElement);

  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
  ];
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
  viewerCamera.position.z = 5;

  let isDraggingObj = false; let previousMousePosition = { x: 0, y: 0 };
  viewerRenderer.domElement.addEventListener('mousedown', () => { isDraggingObj = true; });
  viewerRenderer.domElement.addEventListener('mouseup', () => { isDraggingObj = false; });
  viewerRenderer.domElement.addEventListener('mouseout', () => { isDraggingObj = false; });
  viewerRenderer.domElement.addEventListener('mousemove', (e) => {
    if(isDraggingObj) {
      const deltaMove = { x: e.offsetX - previousMousePosition.x, y: e.offsetY - previousMousePosition.y };
      const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(toRadians(deltaMove.y * 1), toRadians(deltaMove.x * 1), 0, 'XYZ'));
      cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);
    }
    previousMousePosition = { x: e.offsetX, y: e.offsetY };
  });

  function toRadians(angle) { return angle * (Math.PI / 180); }
  function animate() {
    requestAnimationFrame(animate);
    if(!isDraggingObj) { cube.rotation.x += 0.005; cube.rotation.y += 0.01; }
    viewerRenderer.render(scene, viewerCamera);
  }
  animate();
}

function resizeViewer() {
  const container = document.getElementById('viewer-container');
  if(viewerRenderer && viewerCamera && container.clientWidth > 0) {
    viewerCamera.aspect = container.clientWidth / container.clientHeight;
    viewerCamera.updateProjectionMatrix();
    viewerRenderer.setSize(container.clientWidth, container.clientHeight);
  }
}