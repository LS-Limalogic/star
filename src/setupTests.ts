// src/setupTests.ts

// Mock canvas getContext AND the element itself
const mockCanvas = document.createElement('canvas');
mockCanvas.getContext = jest.fn((contextId: string) => {
  if (contextId === '2d') {
    return {
      clearRect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      translate: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
}) as any;

// Mock getElementById to return the mock canvas when id is 'canvas'
const originalGetElementById = document.getElementById;
document.getElementById = jest.fn((id: string) => {
    if (id === 'canvas') {
        return mockCanvas;
    }
    // Fallback to original for other IDs
    return originalGetElementById.call(document, id);
});

// Set up a basic DOM structure (canvas element already handled by mock)
// ... existing document.body.innerHTML = `...` but remove the <canvas> line ...
document.body.innerHTML = `
  <!-- <canvas id="canvas" width="1000" height="1000"></canvas> --> <!-- Handled by mock -->
  
  <!-- Add other essential elements if needed by module loading -->
  <input type="radio" id="angleModeFraction" name="angleMode" value="fraction" checked />
  <input type="radio" id="angleModeList" name="angleMode" value="list" />
  <label id="angleLabel"><span>Label</span></label>
  <input type="number" id="angle" />
  <input type="number" id="lines" value="20" />
  <input type="number" id="length" value="400" />
  <input type="number" id="delay" value="10" />
  <button id="draw-btn"></button>
  <button id="reset-btn"></button>
  <button id="download-btn"></button>
  <button id="save-settings-btn"></button>
  <select id="saved-settings-list"></select>
  <button id="delete-selected-btn"></button>
  <button id="theme-toggle"></button>
  <div id="notification-area"></div>
  <div id="delete-prompt-backdrop"></div>
  <p id="delete-prompt-message"></p>
  <button id="delete-prompt-confirm"></button>
  <button id="delete-prompt-cancel"></button>
`;

// Mock localStorage globally (if not already done per-file)
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

// Mock window.alert globally
window.alert = jest.fn();

// Mock console globally if needed across tests (can be overridden)
// jest.spyOn(console, 'warn').mockImplementation(() => {});
// jest.spyOn(console, 'error').mockImplementation(() => {}); 