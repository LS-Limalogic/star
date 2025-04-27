// src/drawing.test.ts
// import { describe, expect, test, jest } from '@jest/globals'; // Keep removed
import { drawPattern } from './drawing.js';
import * as utils from './utils.js';
import { AngleMode } from './config.js';
import { DrawingSettings } from './types.js';

// Mock the delay function
jest.mock('./utils.js', () => ({
  ...jest.requireActual('./utils.js'), // Keep original functions
  delay: jest.fn().mockResolvedValue(undefined), // Mock delay
}));

// Mock ctx minimally for simulation if needed (e.g., if properties were read)
// In this case, it seems ctx isn't used directly in simulation logic
jest.mock('./dom.js', () => ({
    ctx: { /* mock methods if needed later */ },
    cssWidth: 1000,
    cssHeight: 1000,
}));

describe('drawPattern Simulation', () => {

  // Mock console.error for specific tests if needed
  let errorSpy: jest.SpyInstance;
  beforeEach(() => {
      // Suppress console.error by default for this suite, can be enabled per test if needed
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
      errorSpy.mockRestore(); // Restore original console.error after each test
  });

  test('should calculate correct bounds for simple square (Fraction mode)', async () => {
    const settings: DrawingSettings = {
      mode: AngleMode.Fraction,
      angleValue: 4, // 90 degree turns (180 - 360/4 = 90 deg)
      lines: 4,
      length: 100,
      delayMs: 0,
      startX: 0,
      startY: 0,
    };
    const bounds = await drawPattern(settings, { simulate: true });
    // Path: (0,0) -> (100,0) -> (100,100) -> (0,100) -> (0,0) expected final pos
    expect(bounds).toBeDefined();
    expect(bounds?.minX).toBeCloseTo(0);
    expect(bounds?.maxX).toBeCloseTo(100);
    expect(bounds?.minY).toBeCloseTo(0);
    expect(bounds?.maxY).toBeCloseTo(100);
  });

  test('should calculate correct bounds for line (Fraction mode, 0 degree turn)', async () => {
    const settings: DrawingSettings = {
      mode: AngleMode.Fraction,
      angleValue: 2, // 0 degree turns (180 - 360/2 = 0 deg)
      lines: 5,
      length: 50,
      delayMs: 0,
      startX: 10,
      startY: 20,
    };
    const bounds = await drawPattern(settings, { simulate: true });
    // Path: (10,20) -> (60,20) -> (110,20) -> (160,20) -> (210,20) -> (260,20)
    expect(bounds).toBeDefined();
    expect(bounds?.minX).toBeCloseTo(10);
    expect(bounds?.maxX).toBeCloseTo(260);
    expect(bounds?.minY).toBeCloseTo(20);
    expect(bounds?.maxY).toBeCloseTo(20);
  });

  test('should calculate correct bounds for triangle (List mode)', async () => {
      // 120 degree external angles -> 60 deg internal angle step (180-120)
      const angleSteps = [Math.PI / 3, Math.PI / 3, Math.PI / 3]; 
      const settings: DrawingSettings = {
        mode: AngleMode.List,
        angleSteps: angleSteps,
        lines: 3,
        length: 100,
        delayMs: 0,
        startX: 0,
        startY: 0,
      };
      const bounds = await drawPattern(settings, { simulate: true });
      // Path: (0,0) -> (100,0) -> (150, 86.6) -> (100, 173.2) approx 
      expect(bounds).toBeDefined();
      expect(bounds?.minX).toBeCloseTo(0);
      expect(bounds?.maxX).toBeCloseTo(150);
      expect(bounds?.minY).toBeCloseTo(0);
      expect(bounds?.maxY).toBeCloseTo(100 * Math.sin(Math.PI/3) + 100 * Math.sin(2*Math.PI/3)); // ~173.2
  });

   test('should handle empty list mode gracefully in simulation', async () => {
      const settings: DrawingSettings = {
        mode: AngleMode.List,
        angleSteps: [], // Empty list
        lines: 5,
        length: 100,
        delayMs: 0,
        startX: 0,
        startY: 0,
      };
       await expect(drawPattern(settings, { simulate: true })).resolves.toBeUndefined();
       // Optionally, check if the mocked console.error was called
       expect(errorSpy).toHaveBeenCalledWith("Invalid settings passed to drawPattern: Could not determine angle step logic."); 
   });

}); 