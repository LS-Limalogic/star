import {
    canvas, ctx, angleModeFractionRadio, angleModeListRadio,
    drawBtn, resetBtn, downloadBtn, allInputElements,
    angleInput, linesInput, lengthInput, delayInput,
    cssWidth, cssHeight, saveSettingsBtn, savedSettingsList, deleteSelectedBtn // Remove loadSelectedBtn
} from './dom.js';
import {
    updateAngleInputLabel, getAndValidateSettings, resetInputs,
    applyStoredSettings, populateSavedSettingsList // Add populate function
} from './ui.js';
import {
    drawPattern, requestStopDrawing
} from './drawing.js';
import { DrawingBounds, StoredSettings, NamedSetting } from './types.js'; // Import StoredSettings
import { MARGIN, AngleMode } from './config.js'; // Import AngleMode
import { loadAllSavedSettings, saveNamedSetting, deleteSavedSetting } from './utils.js'; // Import storage functions
import { format } from 'date-fns'; // Import format from date-fns

// --- Global State (Keep track of loaded settings) ---
let allSavedSettings: NamedSetting[] = [];

// --- Initial Setup ---
if (!ctx) {
    // The check in dom.ts should have already thrown, but belts and suspenders
    throw new Error("Canvas context failed to initialize.");
}

// Load settings from localStorage and populate list
allSavedSettings = loadAllSavedSettings();
populateSavedSettingsList(allSavedSettings);
console.log("Loaded saved settings list:", allSavedSettings);

// Apply most recent on load? (Optional - currently doesn't)
// if (allSavedSettings.length > 0) {
//     applyStoredSettings(allSavedSettings[0].settings);
// }

// Set initial UI state based on defaults / loaded state
updateAngleInputLabel();

// --- Event Listeners ---

// Mode change
angleModeFractionRadio.addEventListener('change', updateAngleInputLabel);
angleModeListRadio.addEventListener('change', updateAngleInputLabel);

// Draw button - remove auto-saving
drawBtn.addEventListener('click', async () => {
    const settings = getAndValidateSettings();
    if (settings && ctx) {
        drawBtn.disabled = true;
        downloadBtn.disabled = true;
        saveSettingsBtn.disabled = true; // Disable save during draw
        deleteSelectedBtn.disabled = true;
        savedSettingsList.disabled = true;

        console.log("Starting simulation..."); // Log 3: Starting simulation

        let bounds: DrawingBounds | void | undefined;
        try {
             bounds = await drawPattern(settings, { simulate: true });
             console.log("Simulation finished. Bounds:", bounds); // Log 4: Simulation results
        } catch (error) {
            console.error("Error during simulation:", error); // Log Error: Simulation error
            drawBtn.disabled = false;
            downloadBtn.disabled = false;
            saveSettingsBtn.disabled = false;
            deleteSelectedBtn.disabled = false;
            savedSettingsList.disabled = false;
            return; // Stop if simulation fails
        }

        if (bounds) {
            const patternWidth = bounds.maxX - bounds.minX;
            const patternHeight = bounds.maxY - bounds.minY;
            const availableWidth = cssWidth - 2 * MARGIN;
            const availableHeight = cssHeight - 2 * MARGIN;
            let scaleFactor = 1;

            if (patternWidth > 0 && patternHeight > 0) {
                scaleFactor = Math.min(1, availableWidth / patternWidth, availableHeight / patternHeight);
            } else if (patternWidth > 0) {
                scaleFactor = Math.min(1, availableWidth / patternWidth);
            } else if (patternHeight > 0) {
                scaleFactor = Math.min(1, availableHeight / patternHeight);
            }

            console.log("Calculated Scale Factor:", scaleFactor); // Log 5: Scale factor

            // Draw final pattern
            console.log("Starting final draw..."); // Log 6: Starting final draw
            try {
                await drawPattern(settings, { scaleFactor: scaleFactor, bounds: bounds });
                console.log("Final draw finished."); // Log 7: Final draw finished
            } catch (error) {
                 console.error("Error during final draw:", error); // Log Error: Final draw error
            }

        } else {
            console.log("Simulation did not return bounds, skipping final draw.");
        }

        drawBtn.disabled = false;
        downloadBtn.disabled = false;
        saveSettingsBtn.disabled = false;
        populateSavedSettingsList(allSavedSettings); 
    } else {
        console.log("No settings or context found, drawing aborted."); // Log 8: No settings/context
    }
});

// Save Settings Button
saveSettingsBtn.addEventListener('click', () => {
    const currentInputs: StoredSettings = {
        mode: (document.querySelector('input[name="angleMode"]:checked') as HTMLInputElement).value,
        angle: angleInput.value,
        lines: linesInput.value,
        length: lengthInput.value,
        delay: delayInput.value,
    };
    
    const timestamp = new Date();
    const timestampMs = timestamp.getTime();

    const formattedTimestamp = format(timestamp, 'yy-MM-dd HH:mm');

    // Create name prefix and angle string based on mode
    let namePrefix = '';
    let angleStringForName = currentInputs.angle || '?'; // Use raw input string

    if (currentInputs.mode === AngleMode.List) {
        namePrefix = 'A';
    } else if (currentInputs.mode === AngleMode.Fraction) {
        namePrefix = 'F';
    }

    // Construct the final name
    const settingName = `${namePrefix} ${angleStringForName} | ${formattedTimestamp}`;

    const newSetting: NamedSetting = {
        id: timestampMs,
        name: settingName,
        settings: currentInputs
    };
    allSavedSettings = saveNamedSetting(newSetting);
    populateSavedSettingsList(allSavedSettings);
    console.log("Saved new setting:", newSetting);
});

// Load settings instantly on dropdown change
savedSettingsList.addEventListener('change', () => {
    const selectedId = parseInt(savedSettingsList.value, 10);
    if (isNaN(selectedId)) { // No valid setting selected (e.g., the placeholder)
        deleteSelectedBtn.disabled = true; // Disable delete button
        return;
    } 

    const settingToLoad = allSavedSettings.find(s => s.id === selectedId);
    if (settingToLoad) {
        applyStoredSettings(settingToLoad.settings);
        deleteSelectedBtn.disabled = false; // Enable delete button
        console.log("Loaded setting:", settingToLoad);
    } else {
        console.error("Selected setting not found in loaded list.");
        deleteSelectedBtn.disabled = true; // Disable delete if not found
    }
});

// Delete Selected Button - Listener remains, but enabling/disabling is handled by dropdown change
deleteSelectedBtn.addEventListener('click', () => {
    const selectedId = parseInt(savedSettingsList.value, 10);
    if (isNaN(selectedId)) return;

    if (confirm(`Are you sure you want to delete the setting saved at ${new Date(selectedId).toLocaleString()}?`)) {
        allSavedSettings = deleteSavedSetting(selectedId);
        populateSavedSettingsList(allSavedSettings); // Refresh list (also handles button state)
        console.log("Deleted setting with ID:", selectedId);
    }
});

// Reset button
resetBtn.addEventListener('click', resetInputs);

// Download button
downloadBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'line_pattern.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Add global Enter key listener
document.addEventListener('keydown', (event) => {
    // Trigger draw on Enter, but not if already drawing or if focus is on a button (to allow button activation)
    if (event.key === 'Enter' && !drawBtn.disabled) {
        // Check if the active element is a button, if so, let the default action occur
        if (!(document.activeElement instanceof HTMLButtonElement)) {
             // Prevent default action (like form submission if inputs were in a form)
            event.preventDefault(); 
            console.log("Global Enter key pressed, triggering draw..."); // Optional log
            drawBtn.click();
        }
    }
    
    if (event.key === 'Escape' && drawBtn.disabled) {
        requestStopDrawing();
    }
});

console.log("Line drawer initialized."); 