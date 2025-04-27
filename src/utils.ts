// src/utils.ts
import { STORAGE_KEY } from "./config.js";
import { StoredSettings, NamedSetting } from "./types.js";

export const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

// --- LocalStorage Functions ---

// Load all saved setting snapshots
export function loadAllSavedSettings(): NamedSetting[] {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return []; // Return empty array if nothing stored
    }
    const parsed = JSON.parse(storedValue);

    // Validate that it's an array and items roughly match NamedSetting structure
    if (Array.isArray(parsed) && parsed.every(item => 
        typeof item === 'object' && item !== null &&
        typeof item.id === 'number' &&
        typeof item.name === 'string' &&
        typeof item.settings === 'object' && item.settings !== null &&
        typeof item.settings.mode === 'string' && // Basic check
        typeof item.settings.angle === 'string' &&
        typeof item.settings.lines === 'string' &&
        typeof item.settings.length === 'string' &&
        typeof item.settings.delay === 'string'
      )) {
      // It's generally safe to cast here after validation
      return parsed as NamedSetting[];
    } else {
      console.warn("Invalid settings array found in localStorage, ignoring.");
      localStorage.removeItem(STORAGE_KEY); // Clean up invalid data
      return [];
    }
  } catch (error) {
    console.error("Failed to load settings array from localStorage:", error);
    return []; // Return empty array on error
  }
}

// Save a single new setting snapshot to the list
export function saveNamedSetting(newSetting: NamedSetting): NamedSetting[] {
  const existingSettings = loadAllSavedSettings();
  // Avoid duplicate IDs just in case (though timestamp unlikely)
  const updatedSettings = existingSettings.filter(s => s.id !== newSetting.id);
  updatedSettings.push(newSetting);
  updatedSettings.sort((a, b) => b.id - a.id); // Sort newest first

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    return updatedSettings; // Return the new full list
  } catch (error) {
    console.error("Failed to save settings array to localStorage:", error);
    return existingSettings; // Return original list on save error
  }
}

// Delete a setting snapshot by its ID
export function deleteSavedSetting(idToDelete: number): NamedSetting[] {
    let existingSettings = loadAllSavedSettings();
    const updatedSettings = existingSettings.filter(s => s.id !== idToDelete);
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
        return updatedSettings; // Return the updated list
    } catch (error) {
        console.error("Failed to save updated settings array after delete:", error);
        return existingSettings; // Return original list on save error
    }
} 