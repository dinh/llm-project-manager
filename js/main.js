// js/main.js
import { App } from './App.js';

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App(); // Expose app globally (optional, but useful for debugging)
  console.log('LLM Project Manager Initialized.');
});