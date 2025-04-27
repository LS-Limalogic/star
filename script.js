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
const angleInput = document.getElementById('angle');
const linesInput = document.getElementById('lines');
const lengthInput = document.getElementById('length');
const delayInput = document.getElementById('delay');
const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
// --- Constants ---
const DEFAULT_DELAY_MS = 50;
// --- Utility Functions ---
const delay = (ms) => new Promise(res => setTimeout(res, ms));
function getAndValidateSettings() {
    const angleValue = parseFloat(angleInput.value);
    const lines = parseInt(linesInput.value, 10);
    const length = parseFloat(lengthInput.value);
    const delayMs = parseInt(delayInput.value, 10);
    if (isNaN(angleValue) || isNaN(lines) || isNaN(length) || angleValue === 0 || isNaN(delayMs) || delayMs < 0) {
        alert('Please enter valid numbers for angle (non-zero), lines, length, and delay (non-negative).');
        return null;
    }
    return {
        angleValue,
        lines,
        length,
        delayMs,
        startX: cssWidth / 4, // Initial position remains configurable here if needed
        startY: cssHeight / 2,
    };
}
function drawPattern(ctx, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        const { angleValue, lines, length, delayMs, startX, startY } = settings;
        const angleStep = Math.PI - ((2 * Math.PI) / angleValue);
        let x = startX;
        let y = startY;
        let currentAngle = 0;
        ctx.clearRect(0, 0, cssWidth, cssHeight); // Clear canvas at the start of drawing
        ctx.globalAlpha = 0.25; // Set transparency
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let i = 0; i < lines; i++) {
            x += length * Math.cos(currentAngle);
            y += length * Math.sin(currentAngle);
            ctx.lineTo(x, y);
            currentAngle += angleStep;
            ctx.stroke();
            ctx.beginPath(); // Start new path for the next segment to allow delay visibility
            ctx.moveTo(x, y);
            yield delay(delayMs);
        }
        ctx.globalAlpha = 1.0; // Reset alpha
    });
}
// --- Event Listeners ---
if (!ctx) {
    throw new Error('Canvas rendering context not available');
}
drawBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    const settings = getAndValidateSettings();
    if (settings && ctx) {
        // Disable button while drawing?
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
