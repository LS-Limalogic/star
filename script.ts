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

// --- DOM Elements ---
const angleModeFractionRadio = document.getElementById('angleModeFraction') as HTMLInputElement;
const angleModeListRadio = document.getElementById('angleModeList') as HTMLInputElement;
const angleLabel = document.getElementById('angleLabel') as HTMLLabelElement;
const angleInput = document.getElementById('angle') as HTMLInputElement;
const linesInput = document.getElementById('lines') as HTMLInputElement;
const lengthInput = document.getElementById('length') as HTMLInputElement;
const delayInput = document.getElementById('delay') as HTMLInputElement;
const drawBtn = document.getElementById('draw-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

// --- Constants ---
const DEFAULT_DELAY_MS = 50;

// --- State ---
let stopDrawingRequested = false;

// --- Enums ---
enum AngleMode {
  Fraction = 'fraction',
  List = 'list'
}

// --- Interfaces ---
interface DrawingSettings {
  mode: AngleMode;
  angleValue?: number;
  angleSteps?: number[];
  lines: number;
  length: number;
  delayMs: number;
  startX: number;
  startY: number;
}

// --- Utility Functions ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to convert degrees to radians
const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

function getAndValidateSettings(): DrawingSettings | null {
  const modeValue = (document.querySelector('input[name="angleMode"]:checked') as HTMLInputElement).value;
  const mode = modeValue === AngleMode.List ? AngleMode.List : AngleMode.Fraction;
  const lines = parseInt(linesInput.value, 10);
  const length = parseFloat(lengthInput.value);
  const delayMs = parseInt(delayInput.value, 10);

  let angleValue: number | undefined = undefined;
  let angleSteps: number[] | undefined = undefined;
  let commonValidationFailed = isNaN(lines) || isNaN(length) || isNaN(delayMs) || delayMs < 0;
  let angleValidationError = '';

  if (mode === AngleMode.Fraction) {
    angleValue = parseFloat(angleInput.value);
    if (isNaN(angleValue) || angleValue === 0) {
      angleValidationError = 'Invalid Fraction Denominator (must be non-zero number).';
    }
  } else { // mode === AngleMode.List
    const angleString = angleInput.value;
    try {
      angleSteps = angleString.split(';')
        .map(s => s.trim())
        .filter(s => s !== '') // Allow trailing commas or empty segments
        .map(s => {
          const deg = parseFloat(s);
          if (isNaN(deg)) throw new Error('Invalid number in list');
          return degToRad(180 - deg); 
        });
      if (angleSteps.length === 0) {
        throw new Error('Angle list cannot be empty');
      }
    } catch (e: any) {
      angleValidationError = `Invalid Angle List: ${e.message || 'Please use comma-separated numbers.'}`;
    }
  }

  if (commonValidationFailed || angleValidationError) {
    let alertMessage = 'Invalid input:\n';
    if (commonValidationFailed) {
      alertMessage += '- Check Lines, Length, Delay (must be valid numbers, delay >= 0).\n';
    }
    if (angleValidationError) {
      alertMessage += `- ${angleValidationError}\n`;
    }
    alert(alertMessage.trim());
    return null;
  }

  return {
    mode,
    angleValue,
    angleSteps,
    lines,
    length,
    delayMs,
    startX: cssWidth / 4,
    startY: cssHeight / 2,
  };
}

async function drawPattern(ctx: CanvasRenderingContext2D, settings: DrawingSettings): Promise<void> {
  stopDrawingRequested = false;
  const { mode, angleValue, angleSteps, lines, length, delayMs, startX, startY } = settings;
  
  let x = startX;
  let y = startY;
  let currentAngle = 0;

  // Determine angle step calculation based on mode
  let getAngleStep: (index: number) => number;
  if (mode === AngleMode.Fraction && angleValue) {
    const fixedAngleStep = Math.PI - ((2 * Math.PI) / angleValue);
    getAngleStep = () => fixedAngleStep;
  } else if (mode === AngleMode.List && angleSteps && angleSteps.length > 0) {
    getAngleStep = (index: number) => angleSteps[index % angleSteps.length];
  } else {
    console.error("Invalid settings passed to drawPattern");
    return; // Should not happen if validation is correct
  }

  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.moveTo(x, y);

  for (let i = 0; i < lines; i++) {
    if (stopDrawingRequested) {
      console.log("Drawing stopped by user.");
      break;
    }
    const angleStep = getAngleStep(i); // Get the angle step for this line
    x += length * Math.cos(currentAngle);
    y += length * Math.sin(currentAngle);
    ctx.lineTo(x, y);
    currentAngle += angleStep; // Update current angle
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    await delay(delayMs);
  }

  ctx.globalAlpha = 1.0;
  stopDrawingRequested = false;
}

// --- UI Update Functions ---
function updateAngleInputLabel() {
  const mode = angleModeListRadio.checked ? AngleMode.List : AngleMode.Fraction;
  if (mode === AngleMode.List) {
    angleLabel.firstChild!.textContent = 'Angles (semicolon-sep degrees): ';
    angleInput.type = 'text';
    angleInput.placeholder = 'e.g., 90; 30; 60';
    angleInput.step = '';
    angleInput.value = '';
  } else {
    angleLabel.firstChild!.textContent = 'Angle (Fraction Denominator): ';
    angleInput.type = 'number';
    angleInput.placeholder = 'e.g., 4 for 1/4 circle';
    angleInput.step = 'any';
    angleInput.value = '';
  }
}

// --- Event Listeners ---
if (!ctx) {
  throw new Error('Canvas rendering context not available');
}

// Add listeners for mode change
angleModeFractionRadio.addEventListener('change', updateAngleInputLabel);
angleModeListRadio.addEventListener('change', updateAngleInputLabel);

// Initial UI setup based on default checked state
updateAngleInputLabel(); 

drawBtn.addEventListener('click', async () => {
  const settings = getAndValidateSettings();
  if (settings && ctx) {
    drawBtn.disabled = true;
    await drawPattern(ctx, settings);
    drawBtn.disabled = false;
  }
});

resetBtn.addEventListener('click', () => {
  if (!ctx) return;
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  // Reset inputs to defaults (Consider setting defaults directly in HTML or TS)
  angleInput.value = '';
  linesInput.value = '20'; // Keep default visible
  lengthInput.value = '400'; // Keep default visible
  delayInput.value = String(DEFAULT_DELAY_MS);
});

// --- Add Enter key listener to inputs ---
const inputs = [angleInput, linesInput, lengthInput, delayInput];
inputs.forEach(input => {
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission if applicable
      drawBtn.click(); // Simulate click on the draw button
    }
  });
});

// --- Global Listener for Escape Key ---
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && drawBtn.disabled) { // Check if drawing is in progress (button is disabled)
    stopDrawingRequested = true;
  }
});