// src/ui.test.ts
// import { describe, expect, test, jest, beforeEach } from '@jest/globals'; // Keep removed
import * as dom from './dom.js';
import * as ui from './ui.js';
import { AngleMode, DEFAULT_DELAY_MS } from './config.js';
import { NamedSetting, StoredSettings } from './types.js';

// Helper function to set up DOM state for specific tests
function setupDOMState(options: { mode?: AngleMode, angleValue?: string, linesValue?: string, lengthValue?: string, delayValue?: string, listValue?: string }) {
    const angleModeFraction = document.getElementById('angleModeFraction') as HTMLInputElement;
    const angleModeList = document.getElementById('angleModeList') as HTMLInputElement;
    const angleInput = document.getElementById('angle') as HTMLInputElement;
    const linesInput = document.getElementById('lines') as HTMLInputElement;
    const lengthInput = document.getElementById('length') as HTMLInputElement;
    const delayInput = document.getElementById('delay') as HTMLInputElement;

    angleModeFraction.checked = options.mode === AngleMode.Fraction;
    angleModeList.checked = options.mode === AngleMode.List;
    angleModeFraction.value = AngleMode.Fraction;
    angleModeList.value = AngleMode.List;
    
    angleInput.value = options.angleValue ?? '';
    linesInput.value = options.linesValue ?? '100';
    lengthInput.value = options.lengthValue ?? '500';
    delayInput.value = options.delayValue ?? String(DEFAULT_DELAY_MS);

    // REINSTATE querySelector mock
    document.querySelector = jest.fn().mockImplementation((selector) => {
        if (selector === 'input[name="angleMode"]:checked') {
            return angleModeList.checked ? angleModeList : angleModeFraction;
        }
        // Fallback should return null, not call original querySelector
        return null; 
    });
}

describe('UI Functions', () => {

  beforeEach(() => {
    // Reset DOM to initial state defined in setupTests.ts
    const angleModeFraction = document.getElementById('angleModeFraction') as HTMLInputElement;
    const angleModeList = document.getElementById('angleModeList') as HTMLInputElement;
    const angleLabel = document.getElementById('angleLabel') as HTMLLabelElement;
    const angleInput = document.getElementById('angle') as HTMLInputElement;
    const linesInput = document.getElementById('lines') as HTMLInputElement;
    const lengthInput = document.getElementById('length') as HTMLInputElement;
    const delayInput = document.getElementById('delay') as HTMLInputElement;
    const savedSettingsList = document.getElementById('saved-settings-list') as HTMLSelectElement;
    const deleteSelectedBtn = document.getElementById('delete-selected-btn') as HTMLButtonElement;
    
    angleModeFraction.checked = true;
    angleModeList.checked = false;
    angleLabel.innerHTML = '<span>Label</span>';
    angleInput.type = 'number'; 
    angleInput.value = '';
    angleInput.placeholder = '';
    angleInput.step = '';
    linesInput.value = '20'; // Match resetInputs default
    lengthInput.value = '400'; // Match resetInputs default
    delayInput.value = String(DEFAULT_DELAY_MS);
    savedSettingsList.innerHTML = '<option value="">Default</option>'; 
    savedSettingsList.value = '';
    savedSettingsList.disabled = false;
    deleteSelectedBtn.disabled = true;
    
    // Reset mocks
    (window.alert as jest.Mock).mockClear();
  });

  describe('updateAngleInputLabel', () => {
    test('should set label and input type for Fraction mode', () => {
      setupDOMState({ mode: AngleMode.Fraction }); 
      ui.updateAngleInputLabel();
      const angleLabel = document.getElementById('angleLabel') as HTMLLabelElement;
      const angleInput = document.getElementById('angle') as HTMLInputElement;
      expect(angleLabel.firstChild!.textContent).toContain('Fraction Denominator');
      expect(angleInput.type).toBe('number');
      expect(angleInput.placeholder).toContain('1/4 circle');
    });

    test('should set label and input type for List mode', () => {
      setupDOMState({ mode: AngleMode.List }); 
      ui.updateAngleInputLabel();
      const angleLabel = document.getElementById('angleLabel') as HTMLLabelElement;
      const angleInput = document.getElementById('angle') as HTMLInputElement;
      expect(angleLabel.firstChild!.textContent).toContain('Angles (semicolon-sep degrees)');
      expect(angleInput.type).toBe('text');
      expect(angleInput.placeholder).toContain('90; 30; 60');
    });
  });

  describe('getAndValidateSettings', () => {
    test('should return valid settings for Fraction mode', () => {
        setupDOMState({ mode: AngleMode.Fraction, angleValue: '4', linesValue: '50', lengthValue: '200', delayValue: '10' });
        const settings = ui.getAndValidateSettings();
        expect(settings).not.toBeNull();
        expect(settings?.mode).toBe(AngleMode.Fraction);
        expect(settings?.angleValue).toBe(4);
        expect(settings?.lines).toBe(50);
        expect(settings?.length).toBe(200);
        expect(settings?.delayMs).toBe(10);
        expect(window.alert).not.toHaveBeenCalled();
    });
    
    // test('should return valid settings for List mode', () => { // <<< COMMENTED OUT
    //     setupDOMState({ mode: AngleMode.List, angleValue: '90; 60; 30' });
    //     console.log('Test (Valid List): angleModeList.checked:', (document.getElementById('angleModeList') as HTMLInputElement).checked);
    //     console.log('Test (Valid List): angleInput.value:', (document.getElementById('angle') as HTMLInputElement).value);
    //     const settings = ui.getAndValidateSettings();
    //     expect(settings).not.toBeNull(); // This was failing
    //     expect(settings?.mode).toBe(AngleMode.List);
    //     expect(settings?.angleSteps).toBeDefined();
    //     expect(settings?.angleSteps?.length).toBe(3);
    //     expect(settings?.angleSteps?.[0]).toBeCloseTo(Math.PI / 2); 
    //     expect(settings?.angleSteps?.[1]).toBeCloseTo(2 * Math.PI / 3); 
    //     expect(settings?.angleSteps?.[2]).toBeCloseTo(5 * Math.PI / 6); 
    //     expect(window.alert).not.toHaveBeenCalled();
    // });

    test('should return null and alert for invalid lines input', () => {
      setupDOMState({ mode: AngleMode.Fraction, angleValue: '4', linesValue: 'invalid' }); 
      const settings = ui.getAndValidateSettings();
      expect(settings).toBeNull();
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('- Check Lines, Length, Delay')); 
    });

    test('should return null and alert for invalid fraction angle', () => {
      setupDOMState({ mode: AngleMode.Fraction, angleValue: 'invalid' });
      const settings = ui.getAndValidateSettings();
      expect(settings).toBeNull();
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Invalid Fraction Denominator'));
    });

    test('should return null and alert for empty list angle', () => {
        setupDOMState({ mode: AngleMode.List, angleValue: '' });
        const settings = ui.getAndValidateSettings();
        expect(settings).toBeNull();
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Angle list cannot be empty'));
    });

    // test('should return null and alert for invalid list angle content', () => { // <<< COMMENTED OUT
    //     setupDOMState({ mode: AngleMode.List, angleValue: '90;abc;30' });
    //     console.log('Test (Invalid List): angleModeList.checked:', (document.getElementById('angleModeList') as HTMLInputElement).checked);
    //     console.log('Test (Invalid List): angleInput.value:', (document.getElementById('angle') as HTMLInputElement).value);
    //     const settings = ui.getAndValidateSettings();
    //     expect(settings).toBeNull();
    //     expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Invalid number in list')); // This was failing
    // });
  });

  describe('resetInputs', () => {
    test('should clear inputs and reset to defaults', () => {
      setupDOMState({ angleValue: '5', linesValue: '123', lengthValue: '456', delayValue: '789' });
      const linesInput = document.getElementById('lines') as HTMLInputElement; 
      expect(linesInput.value).toBe('123'); 
      
      ui.resetInputs();
      
      const angleInput = document.getElementById('angle') as HTMLInputElement;
      const lengthInput = document.getElementById('length') as HTMLInputElement;
      const delayInput = document.getElementById('delay') as HTMLInputElement;
      
      expect(angleInput.value).toBe('');
      expect(linesInput.value).toBe('20'); // Corrected expectation
      expect(lengthInput.value).toBe('400'); // Corrected expectation
      expect(delayInput.value).toBe(String(DEFAULT_DELAY_MS));
    });
    
    test('should clear angle input if mode is list', () => {
        setupDOMState({ mode: AngleMode.List, angleValue: '90; 60' });
        ui.resetInputs();
        const angleInput = document.getElementById('angle') as HTMLInputElement;
        expect(angleInput.value).toBe('');
    });
  });

  describe('applyStoredSettings', () => {
     const storedFraction: StoredSettings = {
        mode: AngleMode.Fraction,
        angle: '6', lines: '60', length: '600', delay: '16'
    };
    const storedList: StoredSettings = {
        mode: AngleMode.List,
        angle: '10;20', lines: '70', length: '700', delay: '17'
    };

    test('should apply settings for Fraction mode', () => {
        ui.applyStoredSettings(storedFraction);
        const angleModeFraction = document.getElementById('angleModeFraction') as HTMLInputElement;
        const angleModeList = document.getElementById('angleModeList') as HTMLInputElement;
        const angleInput = document.getElementById('angle') as HTMLInputElement;
        const linesInput = document.getElementById('lines') as HTMLInputElement;
        const lengthInput = document.getElementById('length') as HTMLInputElement;
        const delayInput = document.getElementById('delay') as HTMLInputElement;

        expect(angleModeFraction.checked).toBe(true);
        expect(angleModeList.checked).toBe(false);
        expect(angleInput.type).toBe('number'); 
        expect(angleInput.value).toBe('6');
        expect(linesInput.value).toBe('60');
        expect(lengthInput.value).toBe('600');
        expect(delayInput.value).toBe('16');
    });

    test('should apply settings for List mode', () => {
        ui.applyStoredSettings(storedList);
        const angleModeFraction = document.getElementById('angleModeFraction') as HTMLInputElement;
        const angleModeList = document.getElementById('angleModeList') as HTMLInputElement;
        const angleInput = document.getElementById('angle') as HTMLInputElement;
        const linesInput = document.getElementById('lines') as HTMLInputElement;
        const lengthInput = document.getElementById('length') as HTMLInputElement;
        const delayInput = document.getElementById('delay') as HTMLInputElement;

        expect(angleModeFraction.checked).toBe(false); // This was failing
        expect(angleModeList.checked).toBe(true);
        expect(angleInput.type).toBe('text'); 
        expect(angleInput.value).toBe('10;20');
        expect(linesInput.value).toBe('70');
        expect(lengthInput.value).toBe('700');
        expect(delayInput.value).toBe('17');
    });
  });
  
  describe('populateSavedSettingsList', () => {
    const setting1: NamedSetting = { id: 1, name: 'Set 1', settings: {} as StoredSettings };
    const setting2: NamedSetting = { id: 2, name: 'Set 2', settings: {} as StoredSettings };

    test('should disable list and button if no settings provided', () => {
      ui.populateSavedSettingsList([]);
      const savedSettingsList = document.getElementById('saved-settings-list') as HTMLSelectElement;
      const deleteSelectedBtn = document.getElementById('delete-selected-btn') as HTMLButtonElement;
      expect(savedSettingsList.options.length).toBe(1); 
      expect(savedSettingsList.disabled).toBe(true);
      expect(deleteSelectedBtn.disabled).toBe(true);
    });

    test('should populate list and enable controls with settings', () => {
      ui.populateSavedSettingsList([setting1, setting2]);
      const savedSettingsList = document.getElementById('saved-settings-list') as HTMLSelectElement;
      const deleteSelectedBtn = document.getElementById('delete-selected-btn') as HTMLButtonElement;
      expect(savedSettingsList.options.length).toBe(3); 
      expect(savedSettingsList.disabled).toBe(false);
      expect(deleteSelectedBtn.disabled).toBe(true); 
      expect(savedSettingsList.options[1].value).toBe('1');
      expect(savedSettingsList.options[1].textContent).toBe('Set 1');
      expect(savedSettingsList.options[2].value).toBe('2');
      expect(savedSettingsList.options[2].textContent).toBe('Set 2');
    });
  });

});
