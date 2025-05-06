// js/managers/ProjectManager.js
import { BaseDataManager } from '../BaseDataManager.js';

export class ProjectManager extends BaseDataManager {
  constructor(storageManager, eventBus) {
    super(storageManager, storageManager.storageKeys.projects, eventBus, 'project');
    this.defaultSections = {
      prd: { title: "Product Requirements Document", content: "", lastPromptIdUsed: null },
      ux_ui: { title: "UX/UI Design Notes", content: "", lastPromptIdUsed: null },
      user_flow: { title: "User Flow", content: "", lastPromptIdUsed: null },
      technical_spec: { title: "Technical Specifications", content: "", lastPromptIdUsed: null },
      notes: { title: "General Notes", content: "", lastPromptIdUsed: null }
    };
  }

  create(data) {
    const newProjectData = {
      ...data,
      sections: JSON.parse(JSON.stringify(this.defaultSections)), // Deep copy default sections
      status: data.status || 'nouveau',
    };
    return super.create(newProjectData);
  }

  updateSection(projectId, sectionKey, sectionData) {
    const project = this.getById(projectId);
    if (project) {
      const updatedSections = { ...project.sections };
      updatedSections[sectionKey] = {
        ...(updatedSections[sectionKey] || {}), // Keep existing section properties if any
        ...sectionData, // Apply new data
      };

      // Ensure title is preserved or set correctly
      if (!updatedSections[sectionKey].title) {
        updatedSections[sectionKey].title = this.defaultSections[sectionKey]?.title || 
                                            sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      return this.update(projectId, { sections: updatedSections });
    }
    console.warn(`Project with id ${projectId} not found for section update.`);
    return false;
  }

  getSection(projectId, sectionKey) {
    const project = this.getById(projectId);
    return project?.sections?.[sectionKey];
  }
}