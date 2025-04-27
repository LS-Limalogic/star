// src/utils.ts
import { STORAGE_KEY } from "./config.js";
import { StoredSettings } from "./types.js";

export const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

// --- LocalStorage Functions ---

export function saveSettings(settings: StoredSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
}

export function loadSettings(): StoredSettings | null {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return null;
    }
    const parsed = JSON.parse(storedValue);
    
    // Basic validation: Check if essential keys exist and are strings
    if (
      typeof parsed === 'object' && parsed !== null &&
      typeof parsed.mode === 'string' &&
      typeof parsed.angle === 'string' &&
      typeof parsed.lines === 'string' &&
      typeof parsed.length === 'string' &&
      typeof parsed.delay === 'string' 
    ) {
        return parsed as StoredSettings;
    } else {
        console.warn("Invalid settings found in localStorage, ignoring.");
        localStorage.removeItem(STORAGE_KEY); // Clean up invalid data
        return null;
    }

  } catch (error) {
    console.error("Failed to load settings from localStorage:", error);
    return null;
  }
} 