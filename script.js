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
const MARGIN = 20; // Margin around the drawing
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
function drawPattern(ctx_1, settings_1) {
    return __awaiter(this, arguments, void 0, function* (ctx, settings, options = {}) {
        if (!options.simulate) {
            stopDrawingRequested = false;
        }
        const { mode, angleValue, angleSteps, lines, length, delayMs, startX, startY } = settings;
        // Start position remains as defined in settings for the core logic
        let x = startX;
        let y = startY;
        let currentAngle = 0;
        // Bounds tracking for simulation
        let minX = x, maxX = x, minY = y, maxY = y;
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
        if (!getAngleStep) { /* handle error */
            return;
        }
        // --- Context Transform for Actual Drawing ---
        if (!options.simulate && options.scaleFactor && options.bounds) {
            ctx.clearRect(0, 0, cssWidth, cssHeight);
            ctx.save();
            const bounds = options.bounds;
            const scaleFactor = options.scaleFactor;
            const patternWidth = bounds.maxX - bounds.minX;
            const patternHeight = bounds.maxY - bounds.minY;
            const patternCenterX = bounds.minX + patternWidth / 2;
            const patternCenterY = bounds.minY + patternHeight / 2;
            // Center scaled drawing within the canvas
            ctx.translate(cssWidth / 2, cssHeight / 2);
            ctx.scale(scaleFactor, scaleFactor);
            ctx.translate(-patternCenterX, -patternCenterY);
            // Set visual properties after transform
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.moveTo(x, y); // Start drawing from the original start point
        }
        else if (options.simulate) {
            // Reset bounds for simulation run (important!)
            minX = x;
            maxX = x;
            minY = y;
            maxY = y;
        }
        // ----------------------------------------
        for (let i = 0; i < lines; i++) {
            if (!options.simulate && stopDrawingRequested) {
                console.log("Drawing stopped by user.");
                break;
            }
            const angleStep = getAngleStep(i);
            x += length * Math.cos(currentAngle);
            y += length * Math.sin(currentAngle);
            currentAngle += angleStep;
            if (options.simulate) {
                // Update bounds during simulation
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
            else {
                // Actual drawing logic (no offset needed, transform handles it)
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
                yield delay(delayMs);
            }
        }
        if (options.simulate) {
            return { minX, maxX, minY, maxY };
        }
        else {
            // Restore context if it was saved
            if (options.scaleFactor && options.bounds) {
                ctx.restore();
            }
            // Reset flags even if context wasn't saved (e.g., if drawing was stopped before transform)
            ctx.globalAlpha = 1.0;
            stopDrawingRequested = false;
        }
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
        // 1. Simulate to get bounds
        const bounds = yield drawPattern(ctx, settings, { simulate: true });
        if (bounds) {
            // 2. Calculate scale factor
            const patternWidth = bounds.maxX - bounds.minX;
            const patternHeight = bounds.maxY - bounds.minY;
            const availableWidth = cssWidth - 2 * MARGIN;
            const availableHeight = cssHeight - 2 * MARGIN;
            let scaleFactor = 1;
            if (patternWidth > 0 && patternHeight > 0) { // Avoid division by zero
                const scaleFactorX = availableWidth / patternWidth;
                const scaleFactorY = availableHeight / patternHeight;
                scaleFactor = Math.min(1, scaleFactorX, scaleFactorY); // Don't scale up
            }
            else if (patternWidth > 0) {
                scaleFactor = Math.min(1, availableWidth / patternWidth);
            }
            else if (patternHeight > 0) {
                scaleFactor = Math.min(1, availableHeight / patternHeight);
            }
            // If patternWidth and patternHeight are 0, scaleFactor remains 1
            // 3. Draw for real with scale factor and bounds for transform
            if (!stopDrawingRequested) {
                yield drawPattern(ctx, settings, { scaleFactor: scaleFactor, bounds: bounds });
            }
        }
        else {
            // Handle case where simulation failed or was stopped (optional)
            console.log("Simulation did not complete, skipping final draw.");
        }
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
