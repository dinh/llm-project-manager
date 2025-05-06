// js/BaseDataManager.js
import { generateUUID } from './utils.js';

export class BaseDataManager {
  constructor(storageManager, storageKey, eventBus, dataType) {
    this.storageManager = storageManager;
    this.storageKey = storageKey;
    this.eventBus = eventBus;
    this.dataType = dataType; // e.g., 'project', 'prompt', 'template'
    this.items = [];
  }

  loadFromStorage() {
    this.items = this.storageManager.getItem(this.storageKey, []);
    console.log(`${this.dataType}(s) loaded: ${this.items.length}`);
  }

  saveToStorage() {
    this.storageManager.setItem(this.storageKey, this.items);
    this.eventBus.emit('data:updated', { type: this.dataType, items: this.items });
  }

  getAll() {
    return [...this.items]; // Return a copy to prevent direct modification
  }

  getById(id) {
    return this.items.find(item => item.id === id);
  }

  create(data) {
    const newItem = {
      ...data,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.items.push(newItem);
    this.saveToStorage();
    console.log(`${this.dataType} created:`, newItem.id);
    this.eventBus.emit(`${this.dataType}:created`, newItem);
    return newItem.id; // Return ID of the new item
  }

  update(id, updatedData) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = {
        ...this.items[index],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      this.saveToStorage();
      const updatedItem = this.items[index];
      console.log(`${this.dataType} updated:`, updatedItem.id);
      this.eventBus.emit(`${this.dataType}:updated`, updatedItem);
      return true;
    }
    console.warn(`${this.dataType} with id ${id} not found for update.`);
    return false;
  }

  delete(id) {
    const initialLength = this.items.length;
    const itemToDelete = this.getById(id);
    this.items = this.items.filter(item => item.id !== id);
    if (this.items.length < initialLength) {
      this.saveToStorage();
      console.log(`${this.dataType} deleted:`, id);
      this.eventBus.emit(`${this.dataType}:deleted`, { id, item: itemToDelete }); // Pass deleted item for potential undo or logging
      return true;
    }
    console.warn(`${this.dataType} with id ${id} not found for deletion.`);
    return false;
  }
}