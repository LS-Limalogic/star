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
const angleInput = document.getElementById('angle');
const linesInput = document.getElementById('lines');
const lengthInput = document.getElementById('length');
const delayInput = document.getElementById('delay');
const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
if (!ctx) {
    throw new Error('Canvas rendering context not available');
}
// Helper function for delay
const delay = (ms) => new Promise(res => setTimeout(res, ms));
drawBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    // Set line transparency (25% transparent = 75% opaque)
    ctx.globalAlpha = 0.25;
    const angleValue = parseFloat(angleInput.value);
    const lines = parseInt(linesInput.value, 10);
    const length = parseFloat(lengthInput.value);
    const delayMs = parseInt(delayInput.value, 10);
    if (isNaN(angleValue) || isNaN(lines) || isNaN(length) || angleValue === 0 || isNaN(delayMs) || delayMs < 0) {
        alert('Please enter valid numbers for angle (non-zero), lines, length, and delay (non-negative).');
        return;
    }
    const angleStep = Math.PI - ((2 * Math.PI) / angleValue);
    let x = cssWidth / 4;
    let y = cssHeight / 2;
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
        yield delay(delayMs);
    }
    // Reset alpha to default (optional, good practice)
    ctx.globalAlpha = 1.0;
}));
resetBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    angleInput.value = '';
    linesInput.value = '';
    lengthInput.value = '';
    delayInput.value = '50';
});
