// js/managers/PromptManager.js
import { BaseDataManager } from '../BaseDataManager.js';

export class PromptManager extends BaseDataManager {
  constructor(storageManager, eventBus) {
    super(storageManager, storageManager.storageKeys.prompts, eventBus, 'prompt');
  }

  toggleFavorite(id) {
    const item = this.getById(id);
    if (item) {
      const success = this.update(id, { isFavorite: !item.isFavorite });
      if (success) {
        this.eventBus.emit('prompt:favoriteToggled', this.getById(id));
      }
      return success;
    }
    return false;
  }
}