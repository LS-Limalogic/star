// src/dom.ts

export function getElementByIdOrThrow<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`DOM element with id '${id}' not found.`);
  }
  return element as T;
}

export const canvas = getElementByIdOrThrow<HTMLCanvasElement>('canvas');
export const ctx = canvas.getContext('2d');

// --- High-DPI Scaling (specific to canvas/ctx) ---
export const dpr = window.devicePixelRatio || 1;
export const cssWidth = canvas.width;
export const cssHeight = canvas.height;

canvas.width = cssWidth * dpr;
canvas.height = cssHeight * dpr;
canvas.style.width = `${cssWidth}px`;
canvas.style.height = `${cssHeight}px`;

if (ctx) {
  ctx.scale(dpr, dpr);
} else {
  throw new Error('Canvas rendering context not available');
}
// --- End High-DPI Scaling ---

export const angleModeFractionRadio = getElementByIdOrThrow<HTMLInputElement>('angleModeFraction');
export const angleModeListRadio = getElementByIdOrThrow<HTMLInputElement>('angleModeList');
export const angleLabel = getElementByIdOrThrow<HTMLLabelElement>('angleLabel');
export const angleInput = getElementByIdOrThrow<HTMLInputElement>('angle');
export const linesInput = getElementByIdOrThrow<HTMLInputElement>('lines');
export const lengthInput = getElementByIdOrThrow<HTMLInputElement>('length');
export const delayInput = getElementByIdOrThrow<HTMLInputElement>('delay');
export const drawBtn = getElementByIdOrThrow<HTMLButtonElement>('draw-btn');
export const resetBtn = getElementByIdOrThrow<HTMLButtonElement>('reset-btn');
export const downloadBtn = getElementByIdOrThrow<HTMLButtonElement>('download-btn');
export const saveSettingsBtn = getElementByIdOrThrow<HTMLButtonElement>('save-settings-btn');
export const savedSettingsList = getElementByIdOrThrow<HTMLSelectElement>('saved-settings-list');
export const deleteSelectedBtn = getElementByIdOrThrow<HTMLButtonElement>('delete-selected-btn');
export const themeToggleBtn = getElementByIdOrThrow<HTMLButtonElement>('theme-toggle');
export const notificationArea = getElementByIdOrThrow<HTMLDivElement>('notification-area');

// Delete Prompt Elements
export const deletePromptBackdrop = getElementByIdOrThrow<HTMLDivElement>('delete-prompt-backdrop');
export const deletePromptMessage = getElementByIdOrThrow<HTMLParagraphElement>('delete-prompt-message');
export const deletePromptConfirmBtn = getElementByIdOrThrow<HTMLButtonElement>('delete-prompt-confirm');
export const deletePromptCancelBtn = getElementByIdOrThrow<HTMLButtonElement>('delete-prompt-cancel');

export const allInputElements = [angleInput, linesInput, lengthInput, delayInput]; 