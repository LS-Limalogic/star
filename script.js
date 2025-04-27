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
const angleInput = document.getElementById('angle');
const linesInput = document.getElementById('lines');
const lengthInput = document.getElementById('length');
const drawBtn = document.getElementById('draw-btn');
const resetBtn = document.getElementById('reset-btn');
if (!ctx) {
    throw new Error('Canvas rendering context not available');
}
// Helper function for delay
const delay = (ms) => new Promise(res => setTimeout(res, ms));
drawBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
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
        yield delay(100);
    }
}));
resetBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angleInput.value = '';
    linesInput.value = '';
    lengthInput.value = '';
});
