// No need to import globals if @types/jest is installed and working
// import { describe, expect, test } from '@jest/globals'; 
// import { describe, expect, test, beforeEach, afterEach, jest } from '@jest/globals'; // Keep removed
import { degToRad, loadAllSavedSettings, saveNamedSetting, deleteSavedSetting, delay } from './utils.js'; // Use .js extension for ESM compatibility
import { STORAGE_KEY, AngleMode } from './config.js';
import { NamedSetting } from './types.js';

// Mock localStorage - REMOVE (handled in setupTests.ts)
// const localStorageMock = (() => {
//   let store: { [key: string]: string } = {};
//   return {
//     getItem: (key: string): string | null => store[key] || null,
//     setItem: (key: string, value: string): void => {
//       store[key] = value.toString();
//     },
//     removeItem: (key: string): void => {
//       delete store[key];
//     },
//     clear: (): void => {
//       store = {};
//     },
//   };
// })();
// Object.defineProperty(window, 'localStorage', {
//   value: localStorageMock,
// });

// Mock console.warn and console.error (Keep local mock if specific checks needed)
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Utility Functions', () => {

  describe('degToRad function', () => {
    test('should convert 0 degrees to 0 radians', () => {
      expect(degToRad(0)).toBe(0);
    });

    test('should convert 180 degrees to PI radians', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI); // Use toBeCloseTo for floating point
    });

    test('should convert 90 degrees to PI/2 radians', () => {
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
    });

    test('should convert -90 degrees to -PI/2 radians', () => {
      expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
    });

    test('should convert 360 degrees to 2*PI radians', () => {
      expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
    });
  });

  describe('localStorage functions', () => {
    const setting1: NamedSetting = {
      id: 1,
      name: 'Test 1',
      settings: { mode: AngleMode.Fraction, angle: '4', lines: '10', length: '100', delay: '5' },
    };
    const setting2: NamedSetting = {
      id: 2,
      name: 'Test 2',
      settings: { mode: AngleMode.List, angle: '90;45', lines: '20', length: '200', delay: '10' },
    };

    beforeEach(() => {
      // Clear global mock localStorage before each test
      window.localStorage.clear(); 
      // Reset console mocks if they were spied on locally
      (console.warn as jest.Mock).mockClear();
      (console.error as jest.Mock).mockClear();
    });

    test('loadAllSavedSettings should return empty array if localStorage is empty', () => {
      expect(loadAllSavedSettings()).toEqual([]);
    });

    test('loadAllSavedSettings should return empty array for invalid JSON', () => {
      window.localStorage.setItem(STORAGE_KEY, 'invalid json'); // Use window.localStorage
      expect(loadAllSavedSettings()).toEqual([]);
      expect(console.error).toHaveBeenCalled(); // Keep check
    });

    test('loadAllSavedSettings should return empty array for invalid data structure', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' })); // Use window.localStorage
      expect(loadAllSavedSettings()).toEqual([]);
      expect(console.warn).toHaveBeenCalled(); // Keep check
    });

    test('saveNamedSetting should add a setting and return the updated list', () => {
      const updatedList = saveNamedSetting(setting1);
      expect(updatedList).toEqual([setting1]);
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual([setting1]); // Use window.localStorage
    });

    test('saveNamedSetting should add multiple settings and sort them', () => {
      saveNamedSetting(setting1);
      const updatedList = saveNamedSetting(setting2);
      expect(updatedList).toEqual([setting2, setting1]);
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual([setting2, setting1]); // Use window.localStorage
    });

    test('saveNamedSetting should replace setting with the same ID', () => {
      saveNamedSetting(setting1);
      const setting1Updated: NamedSetting = { ...setting1, name: 'Updated Test 1' };
      const updatedList = saveNamedSetting(setting1Updated);
      expect(updatedList).toEqual([setting1Updated]);
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual([setting1Updated]); // Use window.localStorage
    });

    test('deleteSavedSetting should remove a setting by ID', () => {
      saveNamedSetting(setting1);
      saveNamedSetting(setting2);
      const updatedList = deleteSavedSetting(setting1.id);
      expect(updatedList).toEqual([setting2]);
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual([setting2]); // Use window.localStorage
    });

    test('deleteSavedSetting should do nothing if ID not found', () => {
      saveNamedSetting(setting1);
      saveNamedSetting(setting2);
      const updatedList = deleteSavedSetting(999); // Non-existent ID
      expect(updatedList).toEqual([setting2, setting1]);
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual([setting2, setting1]); // Use window.localStorage
    });
  });

  describe('delay function', () => {
    jest.useFakeTimers();

    test('should resolve after the specified delay', async () => {
      const delayMs = 100;
      const promise = delay(delayMs);

      jest.advanceTimersByTime(delayMs);

      await expect(promise).resolves.toBeUndefined();
    });

    afterEach(() => {
        jest.useRealTimers();
    });
  });
}); 