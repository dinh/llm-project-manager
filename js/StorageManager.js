// js/StorageManager.js
export class StorageManager {
  constructor() {
    this.storageKeys = {
      projects: 'llm_projects',
      sectionTemplates: 'llm_sectionTemplates',
      prompts: 'llm_prompts',
      appVersion: 'llm_app_version'
    };
    this.currentVersion = '1.0.0'; // Ensure this matches your app's version
    this.initStorage();
  }

  initStorage() {
    const storedVersion = localStorage.getItem(this.storageKeys.appVersion);
    if (!storedVersion) {
      this.setItem(this.storageKeys.projects, []);
      this.setItem(this.storageKeys.sectionTemplates, []);
      this.setItem(this.storageKeys.prompts, []);
      this.setItem(this.storageKeys.appVersion, this.currentVersion);
      console.log('Storage initialized for the first time');
    } else if (storedVersion !== this.currentVersion) {
      console.log(`Migrating data from version ${storedVersion} to ${this.currentVersion}`);
      this.migrateData(storedVersion, this.currentVersion);
      this.setItem(this.storageKeys.appVersion, this.currentVersion);
    }
  }

  migrateData(fromVersion, toVersion) {
    // Placeholder for future migration logic
    console.log(`Migration from ${fromVersion} to ${toVersion} not implemented yet.`);
    // Example: if (fromVersion === '0.9.0' && toVersion === '1.0.0') { /* ...migration logic... */ }
  }

  getItem(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return defaultValue;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error)
       {
      console.error(`Error saving ${key}:`, error);
      // Consider user notification for critical save errors (e.g., quota exceeded)
      return false;
    }
  }

  getProjects() { return this.getItem(this.storageKeys.projects, []); }
  saveProjects(projects) { return this.setItem(this.storageKeys.projects, projects); }
  getSectionTemplates() { return this.getItem(this.storageKeys.sectionTemplates, []); }
  saveSectionTemplates(templates) { return this.setItem(this.storageKeys.sectionTemplates, templates); }
  getPrompts() { return this.getItem(this.storageKeys.prompts, []); }
  savePrompts(prompts) { return this.setItem(this.storageKeys.prompts, prompts); }

  exportAllData() {
    const data = {
      version: this.currentVersion,
      projects: this.getProjects(),
      sectionTemplates: this.getSectionTemplates(),
      prompts: this.getPrompts(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData, options = { merge: false }) {
    try {
      const data = JSON.parse(jsonData);
      if (!data.version || !Array.isArray(data.projects) || !Array.isArray(data.sectionTemplates) || !Array.isArray(data.prompts)) {
        throw new Error('Invalid data structure for import');
      }

      // Basic version check (can be expanded)
      console.log(`Importing data from version ${data.version}. Current app version: ${this.currentVersion}`);

      if (options.merge) {
        this.mergeData(data);
      } else {
        this.saveProjects(data.projects);
        this.saveSectionTemplates(data.sectionTemplates);
        this.savePrompts(data.prompts);
        // Optionally, update app version if importing data from a newer structure,
        // or run migrations if importing from an older one. For now, we assume compatibility.
      }
      this.setItem(this.storageKeys.appVersion, this.currentVersion); // Mark storage as current version after import
      return { success: true, message: options.merge ? 'Data merged successfully' : 'Data imported successfully' };
    } catch (error) {
      console.error('Error during data import:', error);
      return { success: false, message: `Import error: ${error.message}` };
    }
  }

  mergeData(data) {
    const mergeArrays = (existing, incoming) => {
      const result = [...existing];
      const existingIds = new Set(existing.map(item => item.id));
      for (const item of incoming) {
        if (item.id && !existingIds.has(item.id)) { // Ensure item has an ID before merging
          result.push(item);
          existingIds.add(item.id); // Add to set to prevent duplicates within incoming array if any
        } else if (!item.id) {
            console.warn('Skipping item without ID during merge:', item);
        } else {
            console.log(`Item with ID ${item.id} already exists, not merging duplicate.`);
            // Optionally, implement update logic for existing items here
        }
      }
      return result;
    };

    this.saveProjects(mergeArrays(this.getProjects(), data.projects));
    this.saveSectionTemplates(mergeArrays(this.getSectionTemplates(), data.sectionTemplates));
    this.savePrompts(mergeArrays(this.getPrompts(), data.prompts));
  }
}