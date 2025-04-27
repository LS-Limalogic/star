const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const anglePi = parseFloat(angleInput.value);
  const lines = parseInt(linesInput.value, 10);
  const length = parseFloat(lengthInput.value);
  if (isNaN(anglePi) || isNaN(lines) || isNaN(length)) {
    alert('Please enter valid numbers for angle, lines, and length.');
    return;
  }
  const angleStep = (1 - anglePi) * Math.PI;
  let x = canvas.width / 2;
  let y = canvas.height / 2;
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  angleInput.value = '';
  linesInput.value = '';
  lengthInput.value = '';
});