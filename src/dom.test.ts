import { getElementByIdOrThrow } from './dom.js';

describe('getElementByIdOrThrow', () => {
  // Set up a mock document body before each test
  beforeEach(() => {
    document.body.innerHTML = '<div id="test-element"></div>';
  });

  test('should return the element if found', () => {
    const element = getElementByIdOrThrow('test-element');
    expect(element).not.toBeNull();
    expect(element.id).toBe('test-element');
  });

  test('should throw an error if the element is not found', () => {
    expect(() => {
      getElementByIdOrThrow('non-existent-element');
    }).toThrow("DOM element with id 'non-existent-element' not found.");
  });

  test('should correctly type the returned element', () => {
    document.body.innerHTML = '<button id="test-button"></button>';
    const button = getElementByIdOrThrow<HTMLButtonElement>('test-button');
    expect(button.tagName).toBe('BUTTON');
    // button specific properties could be checked here if needed
    button.disabled = true; 
    expect(button.disabled).toBe(true);
  });
}); 