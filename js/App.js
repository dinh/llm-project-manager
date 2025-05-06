// js/App.js
import { EventBus } from './EventBus.js';
import { StorageManager } from './StorageManager.js';
import { UIManager } from './ui/UIManager.js';
import { PromptManager } from './managers/PromptManager.js';
import { TemplateManager } from './managers/TemplateManager.js';
import { ProjectManager } from './managers/ProjectManager.js';

export class App {
  constructor() {
    this.eventBus = new EventBus();
    this.storageManager = new StorageManager();
    this.uiManager = new UIManager(this.eventBus, this); // Pass App instance to UIManager
    
    this.promptManager = new PromptManager(this.storageManager, this.eventBus);
    this.templateManager = new TemplateManager(this.storageManager, this.eventBus);
    this.projectManager = new ProjectManager(this.storageManager, this.eventBus);
    
    this._loadInitialData();
    this._setupAppEventListeners();
    this._initUI();
  }

  _loadInitialData() {
    this.promptManager.loadFromStorage();
    this.templateManager.loadFromStorage();
    this.projectManager.loadFromStorage();

    if (this.projectManager.getAll().length === 0 &&
        this.promptManager.getAll().length === 0 &&
        this.templateManager.getAll().length === 0) {
      console.log('No data found, creating demo data...');
      this._createDemoData();
    } else {
      console.log('Data loaded from storage.');
    }
  }

  _createDemoData() {
    console.log('Creating demo data...');
    // Templates
    this.templateManager.create({
      name: 'PRD Standard', type: 'PRD', tags: ['standard', 'complet'],
      content: `# Product Requirements Document\n\n## Vue d'ensemble\n[Description du produit]\n\n## Objectifs\n- [Objectif 1]\n- [Objectif 2]\n\n## Utilisateurs cibles\n[Description des utilisateurs]\n\n## Fonctionnalités clés\n1. [Fonctionnalité 1]\n2. [Fonctionnalité 2]\n\n## Exigences non fonctionnelles\n- [Exigence 1]\n- [Exigence 2]\n\n## Critères de succès\n- [Critère 1]\n- [Critère 2]`
    });
    this.templateManager.create({
      name: 'UX User Flow Simple', type: 'UX-User-Flow', tags: ['simple', 'user flow'],
      content: `# UX User Flow\n\n## Persona\n[Description du persona]\n\n## Objectif de l'utilisateur\n[Objectif]\n\n## Parcours\n1. [Étape 1]\n2. [Étape 2]\n3. [Étape 3]\n\n## Points de friction potentiels\n- [Point 1]\n- [Point 2]\n\n## Mesures de succès\n- [Mesure 1]\n- [Mesure 2]`
    });

    // Prompts
    this.promptManager.create({
      title: 'Générer un PRD complet', promptType: 'génération PRD', tags: ['PRD', 'complet'], isFavorite: true,
      textContent: `En tant qu'expert en product management, génère un Product Requirements Document (PRD) complet pour le projet suivant:\n\nNom du projet: [NOM_PROJET]\nDescription brève: [DESCRIPTION]\n\nInclure les sections suivantes:\n- Vue d'ensemble du produit\n- Objectifs et problèmes résolus\n- Utilisateurs cibles et personas\n- Fonctionnalités clés (détaillées)\n- Exigences non fonctionnelles\n- Critères de succès et KPIs\n- Contraintes et dépendances\n- Timeline approximative\n\nSois précis et concret dans les descriptions.`
    });
    this.promptManager.create({
      title: 'Design v0.dev - Landing Page', promptType: 'v0-Design', tags: ['design', 'landing page', 'v0.dev'], isFavorite: true,
      textContent: `Crée une landing page moderne et professionnelle avec les éléments suivants:\n\n- Une hero section avec un titre accrocheur "[TITRE]", une brève description "[DESCRIPTION]", et un call-to-action principal\n- Une section "Fonctionnalités" présentant 3-4 fonctionnalités clés avec icônes\n- Une section témoignages avec 2-3 avis clients\n- Une section "Comment ça marche" en 3 étapes\n- Un formulaire de contact simple\n- Un footer avec liens de navigation et mentions légales\n\nUtilise un design épuré, des couleurs [COULEUR_PRIMAIRE] et [COULEUR_SECONDAIRE], et assure-toi que la page est responsive.`
    });

    // Project
    const projectId = this.projectManager.create({ name: 'Projet Démo LLM Manager', status: 'en cours' });
    const prdTemplate = this.templateManager.getAll().find(t => t.type === 'PRD');
    if (projectId && prdTemplate) {
      this.projectManager.updateSection(projectId, 'prd', {
        content: prdTemplate.content.replace('[Description du produit]', 'Un outil pour gérer les prompts et les projets LLM.')
          .replace('- [Objectif 1]', '- Faciliter la réutilisation des prompts')
          .replace('- [Objectif 2]', '- Structurer les documents de projet (PRD, specs...)')
          .replace('[Description des utilisateurs]', 'Développeurs, Product Managers, Designers utilisant des LLMs.'),
        lastPromptIdUsed: null
      });
      console.log(`PRD section of demo project updated with template.`);
    } else {
      console.warn("Demo project or PRD template not found for section update.");
    }
    console.log('Demo data created.');
  }

  _setupAppEventListeners() {
    // Static button listeners (quick actions, view-specific add buttons)
    document.getElementById('quick-new-project').addEventListener('click', () => this.uiManager.showModal('project-create'));
    document.getElementById('quick-new-prompt').addEventListener('click', () => this.uiManager.showModal('prompt-create'));
    document.getElementById('quick-new-template').addEventListener('click', () => this.uiManager.showModal('template-create'));
    
    document.getElementById('view-projects-add').addEventListener('click', () => this.uiManager.showModal('project-create'));
    document.getElementById('view-prompts-add').addEventListener('click', () => this.uiManager.showModal('prompt-create'));
    document.getElementById('view-templates-add').addEventListener('click', () => this.uiManager.showModal('template-create'));

    // Listen to data changes to refresh UI components
    this.eventBus.on('data:updated', (eventData) => {
        // eventData is { type: 'project'/'prompt'/'template', items: [...] }
        console.log(`App received data:updated event for type: ${eventData.type}`);
        this.uiManager.handleDataUpdate(eventData.type);
    });

    // Specific event for prompt favorite toggle as it might need UI update in multiple places
     this.eventBus.on('prompt:favoriteToggled', (prompt) => {
        console.log(`App received prompt:favoriteToggled event for prompt: ${prompt.id}`);
        this.uiManager.handleDataUpdate('prompt'); // Treat as general prompt data update
    });
  }

  _initUI() {
    this.updateStats();
    this.refreshRecentProjects(); // Initial render for dashboard
    this.refreshFavoritePrompts(); // Initial render for dashboard
    this.uiManager.showView('dashboard'); // Set initial view
  }

  updateStats() {
    document.getElementById('stats-projects').textContent = this.projectManager.getAll().length;
    document.getElementById('stats-prompts').textContent = this.promptManager.getAll().length;
    document.getElementById('stats-templates').textContent = this.templateManager.getAll().length;
  }

  refreshRecentProjects() {
    const container = document.getElementById('recent-projects');
    if (!container) return;
    const projects = this.projectManager.getAll()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4);
    if (projects.length === 0) {
      container.innerHTML = `<div class="bg-white p-4 rounded shadow col-span-full"><p class="text-gray-500 italic">Aucun projet récent.</p></div>`;
      return;
    }
    container.innerHTML = projects.map(project => `
        <div class="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
             data-action="view-detail" data-type="project" data-id="${project.id}">
            <h4 class="font-bold text-lg mb-1 truncate">${project.name}</h4>
            <p class="text-sm text-gray-600">Modifié: ${new Date(project.updatedAt).toLocaleDateString()}</p>
            <span class="inline-block mt-2 px-2 py-1 text-xs rounded ${
                project.status === 'en cours' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'terminé' ? 'bg-green-100 text-green-800' :
                project.status === 'archivé' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
            }">${project.status}</span>
        </div>
    `).join('');
  }

  refreshFavoritePrompts() {
    const container = document.getElementById('favorite-prompts');
    if (!container) return;
    const prompts = this.promptManager.getAll()
      .filter(prompt => prompt.isFavorite)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4);
    if (prompts.length === 0) {
      container.innerHTML = `<div class="bg-white p-4 rounded shadow col-span-full"><p class="text-gray-500 italic">Aucun prompt favori.</p></div>`;
      return;
    }
    container.innerHTML = prompts.map(prompt => `
        <div class="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
             data-action="view-detail" data-type="prompt" data-id="${prompt.id}">
             <div>
                <h4 class="font-bold text-lg mb-1 truncate">${prompt.title}</h4>
                <p class="text-sm text-gray-500 mb-2">${prompt.promptType || 'Type non défini'}</p>
                <div class="flex flex-wrap gap-1">
                    ${(prompt.tags || []).slice(0, 3).map(tag => `
                        <span class="inline-block px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded">${tag}</span>
                    `).join('')}
                     ${(prompt.tags || []).length > 3 ? '<span class="text-xs text-gray-500">...</span>' : ''}
                </div>
             </div>
             <div class="mt-2 pt-2 border-t border-gray-100 text-right">
                  <i class="fa-solid fa-star text-yellow-500"></i>
             </div>
        </div>
    `).join('');
  }

  handleCopyPrompt(textToCopy) {
    if (textToCopy === undefined || textToCopy === null) {
      console.error("Text to copy is undefined or null.");
      this.uiManager.showToast('Erreur: Texte introuvable pour la copie.', 'error');
      return;
    }
    if (!navigator.clipboard) {
      console.warn("Clipboard API not available.");
      this.uiManager.showToast('Copie non supportée par ce navigateur.', 'warning');
      // Fallback for older browsers (less secure, more intrusive)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed"; // Invisible
        textArea.style.opacity = 0;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.uiManager.showToast('Prompt copié (fallback)!', 'success');
      } catch (err) {
        this.uiManager.showToast('Erreur de copie (fallback).', 'error');
      }
      return;
    }
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        console.log('Prompt copied to clipboard via API.');
        this.uiManager.showToast('Prompt copié!', 'success');
      },
      (err) => {
        console.error('Failed to copy text using Clipboard API: ', err);
        this.uiManager.showToast('Erreur de copie.', 'error');
      }
    );
  }

  handleDeleteConfirmed(itemType, itemId) {
    let success = false;
    let manager;
    let itemName = '';

    switch (itemType) {
      case 'project': manager = this.projectManager; break;
      case 'prompt': manager = this.promptManager; break;
      case 'template': manager = this.templateManager; break;
      default:
        console.error("Unknown item type for deletion:", itemType);
        this.uiManager.showToast('Type d\'élément inconnu.', 'error');
        return;
    }

    const item = manager.getById(itemId);
    if (item) {
      itemName = item.name || item.title || 'cet élément';
      success = manager.delete(itemId); // This will emit 'data:updated'
    }

    if (success) {
      this.uiManager.showToast(`${itemName.charAt(0).toUpperCase() + itemName.slice(1)} supprimé.`, 'success');
    } else {
      this.uiManager.showToast(`Erreur: ${itemName} non trouvé ou non supprimé.`, 'error');
    }
    // UIManager.hideModal() is called by the modal's event listener for confirm-delete-action
    // UI refresh is handled by the 'data:updated' event emitted by manager.delete()
  }
}