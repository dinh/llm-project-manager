// js/ui/UIManager.js
export class UIManager {
  constructor(eventBus, appInstance) {
    this.eventBus = eventBus;
    this.app = appInstance; // Reference to the main App instance
    this.modalContainer = document.getElementById('modal-container');
    this.modalContentWrapper = document.getElementById('modal-content-wrapper');
    this.currentView = 'dashboard';

    this._setupNavigation();
    this._setupModalEventListeners();
    this._setupDynamicContentEventListeners();
  }

  _setupNavigation() {
    const nav = document.getElementById('nav');
    nav.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-view]');
      if (button) {
        this.showView(button.dataset.view);
      }
    });
  }

  _setupModalEventListeners() {
    this.modalContainer.addEventListener('click', (event) => {
      if (event.target === this.modalContainer) {
        this.hideModal();
      }
      const button = event.target.closest('button[data-action]');
      if (!button) return;

      const action = button.dataset.action;

      if (action === 'close-modal') {
        this.hideModal();
      } else if (action === 'confirm-delete-action') {
        const itemType = button.dataset.itemType;
        const itemId = button.dataset.itemId;
        this.app.handleDeleteConfirmed(itemType, itemId); // Call App's method
        this.hideModal();
      } else if (action === 'copy-prompt-text') {
        this.app.handleCopyPrompt(button.dataset.promptText);
      } else if (action === 'edit-prompt-from-detail') {
        this.showModal('prompt-edit', { promptId: button.dataset.promptId });
      } else if (action === 'edit-project-from-detail') {
         this.showModal('project-edit', { projectId: button.dataset.projectId });
      } else if (action === 'edit-project-section') {
          // TODO: Implement actual edit section UI
          alert(`Edit section: ${button.dataset.sectionKey} for project ${button.dataset.projectId} (Not Implemented)`);
      }
    });

    // Listen for form submissions within the modal
    this.modalContentWrapper.addEventListener('submit', (event) => {
        if (event.target.tagName === 'FORM') {
            const form = event.target;
            const formType = form.dataset.formType; // e.g., 'project-create', 'prompt-edit'
            const itemId = form.dataset.itemId; // For edit forms
            this.handleFormSubmit(event, formType, itemId ? { itemId } : {});
        }
    });
  }
  
  _setupDynamicContentEventListeners() {
    const listsToWatch = ['projects-list', 'prompts-list', 'templates-list', 'recent-projects', 'favorite-prompts'];
    listsToWatch.forEach(listId => {
        const container = document.getElementById(listId);
        if (container) {
            container.addEventListener('click', (event) => {
                const targetElement = event.target;
                const button = targetElement.closest('button[data-action]');
                const card = targetElement.closest('[data-action="view-detail"]');

                if (button) {
                    event.stopPropagation(); // Prevent card click if button is clicked
                    const action = button.dataset.action;
                    const id = button.dataset.id;
                    const name = button.dataset.name; // For confirmDelete

                    switch(action) {
                        case 'view-project-detail': this.showProjectDetail(id); break;
                        case 'edit-project': this.showModal('project-edit', { projectId: id }); break;
                        case 'delete-project': this.confirmDelete('project', id, name); break;
                        
                        case 'view-prompt-detail': this.showPromptDetail(id); break;
                        case 'edit-prompt': this.showModal('prompt-edit', { promptId: id }); break;
                        case 'delete-prompt': this.confirmDelete('prompt', id, name); break;
                        case 'toggle-prompt-favorite': this.app.promptManager.toggleFavorite(id); break;

                        case 'edit-template': this.showModal('template-edit', { templateId: id }); break;
                        case 'delete-template': this.confirmDelete('template', id, name); break;
                    }
                } else if (card) {
                    const id = card.dataset.id;
                    const type = card.dataset.type; // 'project' or 'prompt'
                    if (type === 'project') this.showProjectDetail(id);
                    else if (type === 'prompt') this.showPromptDetail(id);
                }
            });
        }
    });
  }

  showView(viewId) {
    console.log(`Switching view to: ${viewId}`);
    document.querySelectorAll('#view-container .view').forEach(view => {
      view.classList.remove('active');
    });
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add('active');
    } else {
        console.error(`View with id 'view-${viewId}' not found.`);
        // Fallback to dashboard or show error
        document.getElementById('view-dashboard').classList.add('active');
        viewId = 'dashboard';
    }


    document.querySelectorAll('#nav button').forEach(button => {
      button.classList.remove('active');
      if (button.dataset.view === viewId) {
        button.classList.add('active');
      }
    });
    this.currentView = viewId;
    this.refreshViewContent(viewId);
  }

  refreshViewContent(viewId) {
    // This method is called when a view becomes active.
    // It ensures the content of that specific view is up-to-date.
    console.log(`Refreshing content for view: ${viewId}`);
    switch (viewId) {
      case 'dashboard':
        this.app.refreshRecentProjects();
        this.app.refreshFavoritePrompts();
        break;
      case 'projects':
        this.renderProjectsList();
        break;
      case 'prompts':
        this.renderPromptsList();
        break;
      case 'templates':
        this.renderTemplatesList();
        break;
    }
    this.app.updateStats(); // Always update stats
  }

  // This method is called when underlying data changes (e.g., after create/update/delete)
  // It decides which parts of the UI (potentially across multiple views) need to be updated.
  handleDataUpdate(dataType) {
    console.log(`Handling data update for type: ${dataType}`);
    this.app.updateStats();

    // Refresh dashboard components if relevant data changed
    if (dataType === 'project' || dataType === 'all') {
        this.app.refreshRecentProjects();
    }
    if (dataType === 'prompt' || dataType === 'all') {
        this.app.refreshFavoritePrompts();
    }

    // Refresh the list in the currently active view if it matches the data type
    if (this.currentView === `${dataType}s`) { // e.g. if currentView is 'projects' and dataType is 'project'
        this.refreshViewContent(this.currentView);
    } else if (this.currentView === 'dashboard' && (dataType === 'project' || dataType === 'prompt')) {
        // Dashboard already handled above
    }
  }


  renderProjectsList() {
    const container = document.getElementById('projects-list');
    if (!container) return;
    const projects = this.app.projectManager.getAll().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    if (projects.length === 0) {
      container.innerHTML = '<p class="text-gray-500 italic">Aucun projet trouvé.</p>';
      return;
    }
    container.innerHTML = projects.map(project => `
        <div class="bg-white p-4 rounded shadow flex justify-between items-start">
            <div>
                <h3 class="font-bold text-lg mb-1">${project.name}</h3>
                <p class="text-sm text-gray-600 mb-2">Dernière modification: ${new Date(project.updatedAt).toLocaleString()}</p>
                <span class="inline-block px-2 py-1 text-xs rounded ${
                    project.status === 'en cours' ? 'bg-yellow-100 text-yellow-800' :
                    project.status === 'terminé' ? 'bg-green-100 text-green-800' :
                    project.status === 'archivé' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                }">${project.status}</span>
            </div>
            <div class="flex space-x-2 items-center">
                <button title="Voir Détails" class="text-indigo-600 hover:text-indigo-800" data-action="view-project-detail" data-id="${project.id}">
                   <i class="fa-solid fa-eye"></i>
                </button>
                <button title="Modifier" class="text-yellow-600 hover:text-yellow-800" data-action="edit-project" data-id="${project.id}">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                 <button title="Supprimer" class="text-red-600 hover:text-red-800" data-action="delete-project" data-id="${project.id}" data-name="${project.name}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
  }

  renderPromptsList() {
    const container = document.getElementById('prompts-list');
    if (!container) return;
    const prompts = this.app.promptManager.getAll().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    if (prompts.length === 0) {
      container.innerHTML = '<p class="text-gray-500 italic md:col-span-2 lg:col-span-3">Aucun prompt trouvé.</p>';
      return;
    }
    container.innerHTML = prompts.map(prompt => `
        <div class="bg-white p-4 rounded shadow flex flex-col justify-between h-full">
             <div>
                <div class="flex justify-between items-start mb-1">
                    <h4 class="font-bold text-lg">${prompt.title}</h4>
                    <button title="${prompt.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}"
                            class="${prompt.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500"
                            data-action="toggle-prompt-favorite" data-id="${prompt.id}">
                        <i class="fa-${prompt.isFavorite ? 'solid' : 'regular'} fa-star"></i>
                    </button>
                </div>
                <p class="text-sm text-gray-500 mb-2">${prompt.promptType || 'Type non défini'}</p>
                <div class="mb-3 flex flex-wrap gap-1">
                    ${(prompt.tags || []).map(tag => `
                        <span class="inline-block px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded">${tag}</span>
                    `).join('')}
                </div>
            </div>
            <div class="flex space-x-2 items-center mt-auto pt-2 border-t border-gray-100">
                 <button title="Voir Détails" class="text-indigo-600 hover:text-indigo-800" data-action="view-prompt-detail" data-id="${prompt.id}">
                   <i class="fa-solid fa-eye"></i>
                </button>
                <button title="Modifier" class="text-yellow-600 hover:text-yellow-800" data-action="edit-prompt" data-id="${prompt.id}">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                 <button title="Supprimer" class="text-red-600 hover:text-red-800" data-action="delete-prompt" data-id="${prompt.id}" data-name="${prompt.title}">
                    <i class="fa-solid fa-trash"></i>
                </button>
             </div>
        </div>
    `).join('');
  }

  renderTemplatesList() {
    const container = document.getElementById('templates-list');
    if (!container) return;
    const templates = this.app.templateManager.getAll().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    if (templates.length === 0) {
      container.innerHTML = '<p class="text-gray-500 italic md:col-span-2 lg:col-span-3">Aucun template trouvé.</p>';
      return;
    }
    container.innerHTML = templates.map(template => `
        <div class="bg-white p-4 rounded shadow flex flex-col justify-between h-full">
             <div>
                <h4 class="font-bold text-lg mb-1">${template.name}</h4>
                <p class="text-sm text-gray-500 mb-2">Type: ${template.type || 'Non défini'}</p>
                 <div class="mb-3 flex flex-wrap gap-1">
                    ${(template.tags || []).map(tag => `
                        <span class="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">${tag}</span>
                    `).join('')}
                </div>
            </div>
             <div class="flex space-x-2 items-center mt-auto pt-2 border-t border-gray-100">
                <button title="Voir/Modifier" class="text-yellow-600 hover:text-yellow-800" data-action="edit-template" data-id="${template.id}">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                 <button title="Supprimer" class="text-red-600 hover:text-red-800" data-action="delete-template" data-id="${template.id}" data-name="${template.name}">
                    <i class="fa-solid fa-trash"></i>
                </button>
             </div>
        </div>
    `).join('');
  }

  showModal(type, data = {}) {
    console.log(`Showing modal: ${type}`, data);
    let contentHTML = '';
    switch (type) {
      case 'project-create': contentHTML = this.getProjectFormHTML(); break;
      case 'project-edit':
        const project = this.app.projectManager.getById(data.projectId);
        contentHTML = project ? this.getProjectFormHTML(project) : '<p>Projet non trouvé.</p>';
        break;
      case 'prompt-create': contentHTML = this.getPromptFormHTML(); break;
      case 'prompt-edit':
        const prompt = this.app.promptManager.getById(data.promptId);
        contentHTML = prompt ? this.getPromptFormHTML(prompt) : '<p>Prompt non trouvé.</p>';
        break;
      case 'template-create': contentHTML = this.getTemplateFormHTML(); break;
      case 'template-edit':
        const template = this.app.templateManager.getById(data.templateId);
        contentHTML = template ? this.getTemplateFormHTML(template) : '<p>Template non trouvé.</p>';
        break;
      case 'prompt-detail':
        const promptDetail = this.app.promptManager.getById(data.promptId);
        contentHTML = promptDetail ? this.getPromptDetailHTML(promptDetail) : '<p>Prompt non trouvé.</p>';
        break;
      case 'project-detail':
        const projectDetail = this.app.projectManager.getById(data.projectId);
        contentHTML = projectDetail ? this.getProjectDetailHTML(projectDetail) : '<p>Projet non trouvé.</p>';
        break;
      case 'confirm-delete':
        contentHTML = this.getConfirmDeleteHTML(data.itemType, data.itemId, data.itemName);
        break;
      default: contentHTML = '<p>Type de modale non reconnu.</p>';
    }
    this.modalContentWrapper.innerHTML = contentHTML;
    this.modalContainer.classList.remove('hidden');
    this.modalContainer.classList.add('flex');
  }

  hideModal() {
    this.modalContainer.classList.add('hidden');
    this.modalContainer.classList.remove('flex');
    this.modalContentWrapper.innerHTML = '';
  }

  getProjectFormHTML(project = null) {
    const isEdit = project !== null;
    const formType = isEdit ? 'project-edit' : 'project-create';
    const itemId = isEdit ? project.id : '';
    return `
        <form data-form-type="${formType}" ${itemId ? `data-item-id="${itemId}"` : ''}>
            <h3 class="text-xl font-bold mb-4">${isEdit ? 'Modifier le projet' : 'Nouveau Projet'}</h3>
            <div class="mb-4">
                <label for="project-name" class="block text-sm font-medium text-gray-700 mb-1">Nom du projet</label>
                <input type="text" id="project-name" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value="${isEdit ? project.name : ''}">
            </div>
            <div class="mb-4">
                <label for="project-status" class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select id="project-status" name="status" class="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="nouveau" ${isEdit && project.status === 'nouveau' ? 'selected' : !isEdit ? 'selected' : ''}>Nouveau</option>
                    <option value="en cours" ${isEdit && project.status === 'en cours' ? 'selected' : ''}>En cours</option>
                    <option value="terminé" ${isEdit && project.status === 'terminé' ? 'selected' : ''}>Terminé</option>
                    <option value="archivé" ${isEdit && project.status === 'archivé' ? 'selected' : ''}>Archivé</option>
                </select>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" data-action="close-modal">Annuler</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">${isEdit ? 'Enregistrer les modifications' : 'Créer le projet'}</button>
            </div>
        </form>
    `;
  }

  getPromptFormHTML(prompt = null) {
    const isEdit = prompt !== null;
    const formType = isEdit ? 'prompt-edit' : 'prompt-create';
    const itemId = isEdit ? prompt.id : '';
    return `
        <form data-form-type="${formType}" ${itemId ? `data-item-id="${itemId}"` : ''}>
            <h3 class="text-xl font-bold mb-4">${isEdit ? 'Modifier le Prompt' : 'Nouveau Prompt'}</h3>
            <div class="mb-4">
                <label for="prompt-title" class="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input type="text" id="prompt-title" name="title" required class="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value="${isEdit ? prompt.title : ''}">
            </div>
             <div class="mb-4">
                <label for="prompt-type" class="block text-sm font-medium text-gray-700 mb-1">Type de Prompt (optionnel)</label>
                <input type="text" id="prompt-type" name="promptType" class="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value="${isEdit && prompt.promptType ? prompt.promptType : ''}">
            </div>
             <div class="mb-4">
                <label for="prompt-tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
                <input type="text" id="prompt-tags" name="tags" class="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value="${isEdit && prompt.tags ? prompt.tags.join(', ') : ''}">
            </div>
            <div class="mb-4">
                <label for="prompt-text" class="block text-sm font-medium text-gray-700 mb-1">Contenu du Prompt</label>
                <textarea id="prompt-text" name="textContent" rows="10" required class="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm">${isEdit ? prompt.textContent : ''}</textarea>
            </div>
             <div class="mb-4 flex items-center">
                <input type="checkbox" id="prompt-favorite" name="isFavorite" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" ${isEdit && prompt.isFavorite ? 'checked' : ''}>
                <label for="prompt-favorite" class="ml-2 block text-sm text-gray-900">Marquer comme favori</label>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" data-action="close-modal">Annuler</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">${isEdit ? 'Enregistrer les modifications' : 'Créer le prompt'}</button>
            </div>
        </form>
    `;
  }

  getTemplateFormHTML(template = null) {
    const isEdit = template !== null;
    const formType = isEdit ? 'template-edit' : 'template-create';
    const itemId = isEdit ? template.id : '';
    return `
        <form data-form-type="${formType}" ${itemId ? `data-item-id="${itemId}"` : ''}>
            <h3 class="text-xl font-bold mb-4">${isEdit ? 'Modifier le Template' : 'Nouveau Template'}</h3>
            <div class="mb-4">
                <label for="template-name" class="block text-sm font-medium text-gray-700 mb-1">Nom du Template</label>
                <input type="text" id="template-name" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value="${isEdit ? template.name : ''}">
            </div>
             <div class="mb-4">
                <label for="template-type" class="block text-sm font-medium text-gray-700 mb-1">Type (e.g., PRD, UX-User-Flow)</label>
                <input type="text" id="template-type" name="type" required class="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value="${isEdit ? template.type : ''}">
            </div>
             <div class="mb-4">
                <label for="template-tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
                <input type="text" id="template-tags" name="tags" class="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" value="${isEdit && template.tags ? template.tags.join(', ') : ''}">
            </div>
            <div class="mb-4">
                <label for="template-content" class="block text-sm font-medium text-gray-700 mb-1">Contenu du Template (Markdown)</label>
                <textarea id="template-content" name="content" rows="12" required class="w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm">${isEdit ? template.content : ''}</textarea>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" data-action="close-modal">Annuler</button>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">${isEdit ? 'Enregistrer les modifications' : 'Créer le template'}</button>
            </div>
        </form>
    `;
  }

  getPromptDetailHTML(prompt) {
    return `
        <div class="p-2">
             <div class="flex justify-between items-start mb-3">
                <h3 class="text-xl font-bold">${prompt.title}</h3>
                 <button title="Fermer" class="text-gray-500 hover:text-gray-700" data-action="close-modal">
                   <i class="fa-solid fa-times fa-lg"></i>
                </button>
             </div>
            <p class="text-sm text-gray-600 mb-2">Type: ${prompt.promptType || 'Non défini'}</p>
            <div class="mb-3 flex flex-wrap gap-1">
                 ${(prompt.tags || []).map(tag => `
                        <span class="inline-block px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded">${tag}</span>
                    `).join('')}
             </div>
              <div class="mb-4">
                <h4 class="font-semibold mb-1">Contenu du Prompt:</h4>
                <pre class="bg-gray-100 p-3 rounded border border-gray-200 whitespace-pre-wrap break-words font-mono text-sm max-h-60 overflow-y-auto">${prompt.textContent}</pre>
              </div>
               <div class="flex justify-end mt-4">
               <button class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mr-2" 
                 data-action="copy-prompt-text"
                 data-prompt-text="${prompt.textContent.replace(/"/g, '"').replace(/'/g, '\'')}">
                 <i class="fa-regular fa-copy mr-2"></i>Copier
               </button>
                   <button class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600" 
                        data-action="edit-prompt-from-detail" data-prompt-id="${prompt.id}">
                       <i class="fa-solid fa-pencil mr-2"></i>Modifier
                   </button>
               </div>
        </div>
     `;
  }

  getProjectDetailHTML(project) {
    let sectionHTML = '';
    if (project.sections) {
      sectionHTML = Object.entries(project.sections).map(([key, section]) => `
            <div class="mb-4 border rounded p-3">
                <h4 class="font-semibold text-lg mb-2">${section.title || key}</h4>
                <pre class="bg-gray-50 p-2 rounded border border-gray-200 whitespace-pre-wrap break-words text-sm max-h-40 overflow-y-auto">${section.content || 'Aucun contenu'}</pre>
                <p class="text-xs text-gray-500 mt-1">Dernier prompt utilisé: ${section.lastPromptIdUsed || 'Aucun'}</p>
                <button class="mt-2 text-sm text-indigo-600 hover:underline" 
                    data-action="edit-project-section" data-project-id="${project.id}" data-section-key="${key}">
                    Modifier cette section
                </button>
             </div>
        `).join('');
    }
    return `
         <div class="p-2">
              <div class="flex justify-between items-start mb-3">
                <h3 class="text-2xl font-bold">${project.name}</h3>
                <button title="Fermer" class="text-gray-500 hover:text-gray-700" data-action="close-modal">
                   <i class="fa-solid fa-times fa-lg"></i>
                </button>
             </div>
              <p class="text-sm text-gray-600 mb-1">Statut: <span class="font-medium">${project.status}</span></p>
              <p class="text-xs text-gray-500 mb-4">Créé: ${new Date(project.createdAt).toLocaleDateString()}, Modifié: ${new Date(project.updatedAt).toLocaleDateString()}</p>

               <h4 class="text-xl font-semibold mb-3 border-b pb-1">Sections</h4>
              <div class="max-h-[50vh] overflow-y-auto pr-2">
                ${sectionHTML || '<p class="text-gray-500 italic">Aucune section définie.</p>'}
              </div>

               <div class="flex justify-end mt-6 space-x-3">
                  <button class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        data-action="edit-project-from-detail" data-project-id="${project.id}">
                       <i class="fa-solid fa-pencil mr-2"></i>Modifier Projet
                   </button>
                   <button type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" data-action="close-modal">Fermer</button>
                </div>
         </div>
     `;
  }

  getConfirmDeleteHTML(itemType, itemId, itemName) {
    const typeLabels = { project: 'le projet', prompt: 'le prompt', template: 'le template' };
    return `
        <div class="p-2 text-center">
            <i class="fa-solid fa-triangle-exclamation text-red-500 text-4xl mb-4"></i>
            <h3 class="text-xl font-bold mb-2">Confirmer la suppression</h3>
            <p class="text-gray-700 mb-6">Êtes-vous sûr de vouloir supprimer ${typeLabels[itemType] || 'cet élément'} : <br><strong>${itemName}</strong> ? <br><br>Cette action est irréversible.</p>
            <div class="flex justify-center space-x-4">
                <button type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" data-action="close-modal">Annuler</button>
                <button type="button" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" 
                        data-action="confirm-delete-action" data-item-type="${itemType}" data-item-id="${itemId}">Supprimer</button>
            </div>
        </div>
     `;
  }

  handleFormSubmit(event, formType, data) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const itemData = {};
    formData.forEach((value, key) => {
      if (key === 'tags') {
        itemData[key] = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (key === 'isFavorite') {
        itemData[key] = form.querySelector('#prompt-favorite').checked;
      } else {
        itemData[key] = value;
      }
    });

    console.log('Form submitted:', formType, itemData);
    let success = false;
    let message = '';
    const itemId = data.itemId; // For edit operations

    try {
      switch (formType) {
        case 'project-create': this.app.projectManager.create(itemData); success = true; message = 'Projet créé !'; break;
        case 'project-edit': success = this.app.projectManager.update(itemId, itemData); message = success ? 'Projet mis à jour !' : 'Erreur MàJ projet.'; break;
        case 'prompt-create': this.app.promptManager.create(itemData); success = true; message = 'Prompt créé !'; break;
        case 'prompt-edit': success = this.app.promptManager.update(itemId, itemData); message = success ? 'Prompt mis à jour !' : 'Erreur MàJ prompt.'; break;
        case 'template-create': this.app.templateManager.create(itemData); success = true; message = 'Template créé !'; break;
        case 'template-edit': success = this.app.templateManager.update(itemId, itemData); message = success ? 'Template mis à jour !' : 'Erreur MàJ template.'; break;
        default: message = 'Type de formulaire inconnu.'; success = false;
      }
    } catch (error) {
      console.error("Error handling form submission:", error);
      success = false;
      message = `Erreur: ${error.message}`;
    }

    if (success) {
      this.hideModal();
      this.showToast(message, 'success');
      // Data update events from managers will trigger UI refresh
    } else {
      this.showToast(message || 'Une erreur est survenue.', 'error');
    }
  }

  confirmDelete(itemType, itemId, itemName) {
    this.showModal('confirm-delete', { itemType, itemId, itemName });
  }

  showProjectDetail(projectId) { this.showModal('project-detail', { projectId }); }
  showPromptDetail(promptId) { this.showModal('prompt-detail', { promptId }); }

  showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `px-4 py-2 rounded shadow-md text-white font-medium transition-opacity duration-500 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500' // Default info
    }`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // Fade in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', () => {
        if (toast.parentNode === toastContainer) {
          toastContainer.removeChild(toast);
        }
      }, { once: true });
    }, duration);

    toast.addEventListener('click', () => {
        toast.style.opacity = '0';
    });
  }
}