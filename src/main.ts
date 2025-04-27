import {
    canvas, ctx, angleModeFractionRadio, angleModeListRadio,
    drawBtn, resetBtn, downloadBtn, allInputElements,
    cssWidth, cssHeight // Import dimensions if needed for reset logic etc.
} from './dom.js';
import {
    updateAngleInputLabel, getAndValidateSettings, resetInputs
} from './ui.js';
import {
    drawPattern, requestStopDrawing
} from './drawing.js';
import { DrawingBounds } from './types.js';
import { MARGIN } from './config.js';

// --- Initial Setup ---
if (!ctx) {
    // The check in dom.ts should have already thrown, but belts and suspenders
    throw new Error("Canvas context failed to initialize.");
}
updateAngleInputLabel(); // Set initial label state

// --- Event Listeners ---

// Mode change
angleModeFractionRadio.addEventListener('change', updateAngleInputLabel);
angleModeListRadio.addEventListener('change', updateAngleInputLabel);

// Draw button
drawBtn.addEventListener('click', async () => {
    console.log("Draw button clicked."); // Log 1: Button clicked
    const settings = getAndValidateSettings();
    console.log("Settings:", settings); // Log 2: Settings object

    if (settings && ctx) {
        drawBtn.disabled = true;
        downloadBtn.disabled = true;
        console.log("Starting simulation..."); // Log 3: Starting simulation

        let bounds: DrawingBounds | void | undefined;
        try {
             bounds = await drawPattern(settings, { simulate: true });
             console.log("Simulation finished. Bounds:", bounds); // Log 4: Simulation results
        } catch (error) {
            console.error("Error during simulation:", error); // Log Error: Simulation error
            drawBtn.disabled = false;
            downloadBtn.disabled = false;
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
    } else {
        console.log("No settings or context found, drawing aborted."); // Log 8: No settings/context
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

// Enter key in inputs
allInputElements.forEach(input => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            drawBtn.click();
        }
    });
});

// Escape key to stop drawing
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawBtn.disabled) {
        requestStopDrawing();
    }
});

console.log("Line drawer initialized."); 