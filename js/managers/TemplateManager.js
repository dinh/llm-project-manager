// js/managers/TemplateManager.js
import { BaseDataManager } from '../BaseDataManager.js';

export class TemplateManager extends BaseDataManager {
  constructor(storageManager, eventBus) {
    super(storageManager, storageManager.storageKeys.sectionTemplates, eventBus, 'template');
  }
  // Template-specific methods can be added here
}