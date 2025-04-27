// src/drawing.ts

import { AngleMode } from './config.js';
import { DrawingSettings, DrawOptions, DrawingBounds } from './types.js';
import { delay } from './utils.js';
import { ctx, cssWidth, cssHeight } from './dom.js';

let stopDrawingRequested = false; // Internal state for drawing module

export function requestStopDrawing() {
  stopDrawingRequested = true;
}

export async function drawPattern(settings: DrawingSettings, options: DrawOptions = {}): Promise<DrawingBounds | void> {
  if (!ctx) throw new Error("Canvas context not available in drawing module");

  if (!options.simulate) {
    stopDrawingRequested = false; // Reset flag only for actual drawing
  }
  const { mode, angleValue, angleSteps, lines, length, delayMs, startX, startY } = settings;
  let x = startX;
  let y = startY;
  let currentAngle = 0;

  let minX = x, maxX = x, minY = y, maxY = y;

  // --- Set stroke color based on theme --- 
  const isDarkMode = document.documentElement.classList.contains('dark');
  ctx.strokeStyle = isDarkMode ? 'white' : 'black';
  // --- End Set stroke color --- 

  // Determine angle step calculation
  let getAngleStep: ((index: number) => number) | undefined;
  if (mode === AngleMode.Fraction && typeof angleValue === 'number') {
    const fixedAngleStep = Math.PI - ((2 * Math.PI) / angleValue);
    getAngleStep = () => fixedAngleStep;
  } else if (mode === AngleMode.List && angleSteps && angleSteps.length > 0) {
    getAngleStep = (index: number) => angleSteps[index % angleSteps.length];
  } else {
    console.error("Invalid settings passed to drawPattern: Could not determine angle step logic.");
    return;
  }

  // Context Transform for Actual Drawing
  if (!options.simulate && options.scaleFactor && options.bounds) {
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.save();

    const bounds = options.bounds;
    const scaleFactor = options.scaleFactor;
    const patternWidth = bounds.maxX - bounds.minX;
    const patternHeight = bounds.maxY - bounds.minY;
    const patternCenterX = bounds.minX + patternWidth / 2;
    const patternCenterY = bounds.minY + patternHeight / 2;

    ctx.translate(cssWidth / 2, cssHeight / 2);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.translate(-patternCenterX, -patternCenterY);

    // Set color again after transform, just in case state was lost
    ctx.strokeStyle = isDarkMode ? 'white' : 'black'; 
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(x, y);
  } else if (options.simulate) {
    minX = x; maxX = x; minY = y; maxY = y;
  }

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
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      await delay(delayMs);
    }
  }

  if (options.simulate) {
    return { minX, maxX, minY, maxY };
  } else {
    if (options.scaleFactor && options.bounds) {
      ctx.restore();
    }
    ctx.globalAlpha = 1.0;
    stopDrawingRequested = false;
  }
} 