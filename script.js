"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const canvas = document.getElementById('canvas');
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
const angleModeFractionRadio = document.getElementById('angleModeFraction');
const angleModeListRadio = document.getElementById('angleModeList');
const angleLabel = document.getElementById('angleLabel');
const angleInput = document.getElementById('angle');
const linesInput = document.getElementById('lines');
const lengthInput = document.getElementById('length');
const delayInput = document.getElementById('delay');
const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
// --- Constants ---
const DEFAULT_DELAY_MS = 50;
// --- State ---
let stopDrawingRequested = false;
// --- Enums ---
var AngleMode;
(function (AngleMode) {
    AngleMode["Fraction"] = "fraction";
    AngleMode["List"] = "list";
})(AngleMode || (AngleMode = {}));
// --- Utility Functions ---
const delay = (ms) => new Promise(res => setTimeout(res, ms));
// Helper to convert degrees to radians
const degToRad = (degrees) => degrees * (Math.PI / 180);
function getAndValidateSettings() {
    const modeValue = document.querySelector('input[name="angleMode"]:checked').value;
    const mode = modeValue === AngleMode.List ? AngleMode.List : AngleMode.Fraction;
    const lines = parseInt(linesInput.value, 10);
    const length = parseFloat(lengthInput.value);
    const delayMs = parseInt(delayInput.value, 10);
    let angleValue = undefined;
    let angleSteps = undefined;
    let commonValidationFailed = isNaN(lines) || isNaN(length) || isNaN(delayMs) || delayMs < 0;
    let angleValidationError = '';
    if (mode === AngleMode.Fraction) {
        angleValue = parseFloat(angleInput.value);
        if (isNaN(angleValue) || angleValue === 0) {
            angleValidationError = 'Invalid Fraction Denominator (must be non-zero number).';
        }
    }
    else { // mode === AngleMode.List
        const angleString = angleInput.value;
        try {
            angleSteps = angleString.split(';')
                .map(s => s.trim())
                .filter(s => s !== '') // Allow trailing commas or empty segments
                .map(s => {
                const deg = parseFloat(s);
                if (isNaN(deg))
                    throw new Error('Invalid number in list');
                return degToRad(180 - deg);
            });
            if (angleSteps.length === 0) {
                throw new Error('Angle list cannot be empty');
            }
        }
        catch (e) {
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
function drawPattern(ctx, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        stopDrawingRequested = false;
        const { mode, angleValue, angleSteps, lines, length, delayMs, startX, startY } = settings;
        let x = startX;
        let y = startY;
        let currentAngle = 0;
        // Determine angle step calculation based on mode
        let getAngleStep;
        if (mode === AngleMode.Fraction && angleValue) {
            const fixedAngleStep = Math.PI - ((2 * Math.PI) / angleValue);
            getAngleStep = () => fixedAngleStep;
        }
        else if (mode === AngleMode.List && angleSteps && angleSteps.length > 0) {
            getAngleStep = (index) => angleSteps[index % angleSteps.length];
        }
        else {
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
            yield delay(delayMs);
        }
        ctx.globalAlpha = 1.0;
        stopDrawingRequested = false;
    });
}
// --- UI Update Functions ---
function updateAngleInputLabel() {
    const mode = angleModeListRadio.checked ? AngleMode.List : AngleMode.Fraction;
    if (mode === AngleMode.List) {
        angleLabel.firstChild.textContent = 'Angles (semicolon-sep degrees): ';
        angleInput.type = 'text';
        angleInput.placeholder = 'e.g., 90; 30; 60';
        angleInput.step = '';
        angleInput.value = '';
    }
    else {
        angleLabel.firstChild.textContent = 'Angle (Fraction Denominator): ';
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
drawBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    const settings = getAndValidateSettings();
    if (settings && ctx) {
        drawBtn.disabled = true;
        yield drawPattern(ctx, settings);
        drawBtn.disabled = false;
    }
}));
resetBtn.addEventListener('click', () => {
    if (!ctx)
        return;
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
