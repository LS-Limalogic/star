import { AngleMode, DEFAULT_DELAY_MS } from './config.js';
import { DrawingSettings, DrawingBounds, StoredSettings } from './types.js';
import { degToRad } from './utils.js';
import { 
    angleModeFractionRadio, angleModeListRadio,
    angleLabel, angleInput, 
    linesInput, lengthInput, delayInput, 
    ctx, cssWidth, cssHeight
} from './dom.js';

export function updateAngleInputLabel() {
    const mode = angleModeListRadio.checked ? AngleMode.List : AngleMode.Fraction;
    if (mode === AngleMode.List) {
        angleLabel.firstChild!.textContent = 'Angles (semicolon-sep degrees): ';
        angleInput.type = 'text';
        angleInput.placeholder = 'e.g., 90; 30; 60';
        angleInput.step = '';
    } else {
        angleLabel.firstChild!.textContent = 'Angle (Fraction Denominator): ';
        angleInput.type = 'number';
        angleInput.placeholder = 'e.g., 4 for 1/4 circle';
        angleInput.step = 'any';
    }
}

export function getAndValidateSettings(): DrawingSettings | null {
    const modeValue = (document.querySelector('input[name="angleMode"]:checked') as HTMLInputElement).value;
    const mode = modeValue === AngleMode.List ? AngleMode.List : AngleMode.Fraction;
    const lines = parseInt(linesInput.value, 10);
    const length = parseFloat(lengthInput.value);
    const delayMs = parseInt(delayInput.value, 10);

    let angleValue: number | undefined = undefined;
    let angleSteps: number[] | undefined = undefined;
    let commonValidationFailed = isNaN(lines) || isNaN(length) || isNaN(delayMs) || delayMs < 0;
    let angleValidationError = '';

    if (mode === AngleMode.Fraction) {
        angleValue = parseFloat(angleInput.value);
        if (isNaN(angleValue) || angleValue === 0) {
            angleValidationError = 'Invalid Fraction Denominator (must be non-zero number).';
        }
    } else { // mode === AngleMode.List
        const angleString = angleInput.value;
        try {
            angleSteps = angleString.split(';')
                .map(s => s.trim())
                .filter(s => s !== '')
                .map(s => {
                    const deg = parseFloat(s);
                    if (isNaN(deg)) throw new Error('Invalid number in list');
                    return degToRad(180 - deg);
                });
            if (angleSteps.length === 0) {
                throw new Error('Angle list cannot be empty');
            }
        } catch (e: any) {
            angleValidationError = `Invalid Angle List: ${e.message || 'Please use semicolon-separated numbers.'}`;
        }
    }

    if (commonValidationFailed || angleValidationError) {
        let alertMessage = 'Invalid input:\n';
        if (commonValidationFailed) {
            alertMessage += '- Check Lines, Length, Delay (must be valid numbers, delay >= 0).\n';
        }
        if (angleValidationError) {
            alertMessage += `- ${angleValidationError}\n`;
        }
        alert(alertMessage.trim());
        return null;
    }

    return {
        mode,
        angleValue,
        angleSteps,
        lines,
        length,
        delayMs,
        startX: cssWidth / 4,
        startY: cssHeight / 2,
    };
}

export function resetInputs() {
    if (!ctx) return;
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    // Consider resetting mode too? For now, just inputs.
    angleInput.value = '';
    linesInput.value = '20'; // Default from HTML
    lengthInput.value = '400'; // Default from HTML
    delayInput.value = String(DEFAULT_DELAY_MS);
    // If mode is list, ensure angle input is cleared/reset appropriately
    if (angleModeListRadio.checked) {
        angleInput.value = ''; 
    }
}

export function applyStoredSettings(settings: StoredSettings): void {
    // 1. Set mode radio button FIRST
    if (settings.mode === AngleMode.List) {
        angleModeListRadio.checked = true;
    } else {
        angleModeFractionRadio.checked = true; // Default to fraction if not list
    }

    // 2. Update label and input type based on the *just set* mode
    updateAngleInputLabel();

    // 3. Set input values AFTER type has been set correctly
    angleInput.value = settings.angle;
    linesInput.value = settings.lines;
    lengthInput.value = settings.length;
    delayInput.value = settings.delay;
} 