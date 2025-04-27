const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

// --- High-DPI Canvas Scaling --- 
const dpr = window.devicePixelRatio || 1;
// Get size from HTML attributes (our desired CSS size)
const cssWidth = canvas.width; 
const cssHeight = canvas.height;

// Set the drawing buffer size based on DPR
canvas.width = cssWidth * dpr;
canvas.height = cssHeight * dpr;

// Set the display size using CSS
canvas.style.width = `${cssWidth}px`;
canvas.style.height = `${cssHeight}px`;

// Scale the context to account for the higher resolution buffer
if (ctx) { 
  ctx.scale(dpr, dpr);
}
// --- End High-DPI Scaling ---

const angleInput = document.getElementById('angle') as HTMLInputElement;
const linesInput = document.getElementById('lines') as HTMLInputElement;
const lengthInput = document.getElementById('length') as HTMLInputElement;
const drawBtn = document.getElementById('draw-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

if (!ctx) {
  throw new Error('Canvas rendering context not available');
}

// Helper function for delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

drawBtn.addEventListener('click', async () => {
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  const anglePi = parseFloat(angleInput.value);
  const lines = parseInt(linesInput.value, 10);
  const length = parseFloat(lengthInput.value);
  if (isNaN(anglePi) || isNaN(lines) || isNaN(length)) {
    alert('Please enter valid numbers for angle, lines, and length.');
    return;
  }
  const angleStep = (1 - anglePi) * Math.PI;
  let x = cssWidth / 4;
  let y = cssHeight / 4;
  let currentAngle = 0;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i < lines; i++) {
    x += length * Math.cos(currentAngle);
    y += length * Math.sin(currentAngle);
    ctx.lineTo(x, y);
    currentAngle += angleStep;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    await delay(100);
  }
});

resetBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  angleInput.value = '';
  linesInput.value = '';
  lengthInput.value = '';
});