# Plan de Développement V3.1 : Gestionnaire de Projets et Prompts LLM (Affiné)

**Date de dernière mise à jour :** [Date Actuelle]

**Philosophie :** Une application web monopage (HTML, Tailwind CSS, JS natif modulaires) pour gérer :
*   **Projets :** Conteneurs pour organiser le travail.
*   **Sections de Projet :** Documents structurés au sein d'un projet (PRD, UX, etc.), chacun ayant son propre contenu éditable.
*   **Templates de Section (Bibliothèque) :** Modèles de base réutilisables pour initialiser les sections des projets.
*   **Prompts LLM (Catalogue) :** La collection de vos instructions LLM, versionnées, taguées, et liées à la génération de contenu pour les sections de projet.

---

**Architecture des Données (`localStorage`) :**

1.  `llm_app_version`: (Nouveau) String pour la version du schéma de données (ex: "1.0.0"). Utile pour la migration.
2.  `llm_projects`: Array d'objets Projet.
    *   `Project: { id, name, status, createdAt, updatedAt, sections: { prd: { content: "...", lastPromptIdUsed: "...", templateIdUsed: "..." }, uxFlow: { content: "...", ... }, design: [ { subType: "v0-Design", content: "...", lastPromptIdUsed: "...", templateIdUsed: "..." }, { subType: "Lovable-Design", ... } ], ... } }`
    *   **Précision Granularité Templates :** Pour les sections comme "Design", `sections.design` sera un *tableau d'objets*, où chaque objet représente un sous-type de design (ex: `subType: "v0-Design"`) avec son propre `content`, `lastPromptIdUsed`, et `templateIdUsed` (pour savoir quel template de section a servi de base). Cela évite de multiplier les clés de haut niveau dans `sections`.
3.  `llm_sectionTemplates`: Array d'objets Template de Section.
    *   `SectionTemplate: { id, name, type: "PRD" | "UX-User-Flow" | "MVP-Concept" | "v0-Design-Prompt-Gen" | ..., content: "Modèle de base pour la section...", createdAt, updatedAt, tags: [] }`
        *   **Types de Templates de Section Envisagés (Liste indicative) :**
            *   **Stratégie & Produit :** `PRD`, `Market-Research`, `MVP-Concept`
            *   **Planification & UX :** `UX-User-Flow`, `User-Story-Mapping`, `Design-Brief`
            *   **Développement & Technique :** `MVP-Dev-Plan`, `Ultra-Lean-MVP-Specs`, `Technical-Design-Doc`
            *   **Qualité & Tests :** `Testing-Plan`
            *   **Génération LLM & Marketing :** `v0-Design-Prompt-Gen`, `Marketing-Copy-Gen`, `Content-Strategy`
            *   **Général & Organisation :** `General-Notes`, `Meeting-Minutes`
4.  `llm_prompts`: Array d'objets Prompt LLM.
    *   `Prompt: { id, title, textContent, tags: [], promptType: "génération PRD" | ..., isFavorite, history: [{timestamp, textContent}], notes, parameters: {}, createdAt, updatedAt }`

---

**Phase 0 : Fondations et Structure Minimale**

1.  **Structure de Fichiers et Modules ES6 (Simplifiée pour V1) :**
    *   `index.html`
    *   `js/app.js` : Orchestrateur principal.
    *   `js/StorageManager.js` : (Anciennement `dataManager.js` pour la partie stockage) Gère le CRUD pour `localStorage` et la logique de migration/gestion des conflits de `localStorage` (vérification de `llm_app_version` au démarrage).
    *   `js/BaseDataManager.js` et gestionnaires d'entités (`ProjectManager.js`, `PromptManager.js`, `TemplateManager.js`): Définition des modèles de données et logique métier spécifique.
    *   `js/ui/UIManager.js` : Fonctions UI communes (modales, toasts, rendu de listes basiques).
    *   `docs/` : Répertoire pour la documentation (ce plan, README détaillé, etc.).
2.  **Initialisation et `localStorage` :**
    *   Définir les clés.
    *   Logique de base de chargement/sauvegarde.
3.  **Style de Base et Toasts :**
    *   Intégrer Tailwind CSS et styles personnalisés.
    *   Implémenter `showToast()`.
4.  **Documentation README Initiale & `docs/PLAN.md` :**
    *   Mentionner le comportement de l'app en `file://` vs. serveur local.

---

**Phase 1 : Gestion Essentielle des Prompts LLM et Templates de Section + Import/Export Global**

*   **Objectif :** Avoir un catalogue fonctionnel de prompts et de templates de section, avec la capacité de sauvegarder/restaurer toutes les données.
*   **Fonctionnalités :**
    1.  **Catalogue de Prompts LLM :**
        *   CRUD complet pour les prompts.
        *   Versioning automatique du `textContent` dans `prompt.history`.
        *   Affichage de l'historique.
        *   Recherche, filtres (tags, `promptType`, favoris).
        *   Bouton "Copier Prompt", gestion des favoris.
    2.  **Bibliothèque de Templates de Section :**
        *   CRUD pour les `SectionTemplate` (modèles de base pour les types listés ci-dessus, ex: PRD, UX-User-Flow, v0-Design-Prompt-Gen, etc.).
        *   Interface pour créer/éditer ces modèles.
        *   Inclure quelques "starter templates" par défaut (ex: PRD, General-Notes, MVP-Concept, v0-Design-Prompt-Gen).
    3.  **Import/Export JSON Global (Dès V1) :**
        *   Exporter *toutes* les données (`llm_projects`, `llm_sectionTemplates`, `llm_prompts`) dans un unique fichier JSON.
        *   Importer depuis ce fichier JSON global, avec option de fusion ou remplacement (gestion attentive des ID). *Validation robuste cruciale.*

---

**Phase 2 : Gestion des Projets et Intégration des Sections**

*   **Objectif :** Permettre de créer des projets, d'y initialiser des sections à partir des templates, et d'éditer le contenu de ces sections en lien (optionnel) avec les prompts.
*   **Fonctionnalités :**
    1.  **Gestion des Projets :**
        *   CRUD pour les Projets (`name`, `status`).
        *   Vue liste des projets.
    2.  **Vue Détail du Projet :**
        *   Navigation par onglets/accordéon pour les sections (PRD, UX, Design, etc.).
        *   **Initialisation des Sections :** Lors de l'accès à une section vide d'un projet, proposer de choisir un `SectionTemplate` de la bibliothèque (filtrable par `type` pertinent). Le contenu du template choisi remplit `project.sections.SECTION_KEY.content` et `project.sections.SECTION_KEY.templateIdUsed` est enregistré.
        *   **Édition et Sauvegarde Manuelle des Sections :** Chaque section (ou sous-section Design) a un `<textarea>` pour son `content`. Bouton "Enregistrer" par section.
        *   **Bouton "Utiliser un Prompt" par Section :**
            *   Ouvre une modale listant les prompts du catalogue (`llm_prompts`), filtrables par `promptType` pertinent.
            *   Permet de copier le `textContent` du prompt sélectionné.
            *   L'utilisateur génère en externe, colle le résultat dans le `<textarea>` de la section.
            *   L'application enregistre `lastPromptIdUsed` dans la section du projet.
    3.  **Lien Visuel :** Afficher (si renseigné) le nom du `templateIdUsed` et du `lastPromptIdUsed` à côté de chaque section.

---

**Phase 3 : Suivi, Tâches et Améliorations Avancées (Sélection Prioritaire)**

*   **Objectif :** Augmenter la productivité et la puissance de l'outil.
*   **Fonctionnalités (Choisir 2-3 pour commencer) :**
    1.  **Variables/Templating dans les Prompts LLM.**
    2.  **Suivi de Performance et Usage des Prompts** (Rating, exemples d'outputs, lier `prompt.usage` aux `projectId`/`sectionKey`).
    3.  **Gestion de Tâches Simples** (associées aux projets).
        *   Le **"Dashboard" pour l'historique et les tâches** pourrait commencer comme une section dans la vue détail d'un projet.
    4.  **Paramètres LLM** avec les prompts.
    5.  **Recherche Globale.**

---

**Phase 4 : Polissage et Fonctionnalités de Confort**

*   Actions en Masse, Tri Avancé, Support Markdown, Raccourcis Clavier, Accessibilité, Aide contextuelle.

---

**Gestion des Conflits `localStorage` (intégré dans `StorageManager.js` dès Phase 0/1) :**

*   Au démarrage, `StorageManager.js` vérifie `localStorage.getItem('llm_app_version')`.
*   S'il est absent ou inférieur à la version actuelle de l'application, une fonction de migration est appelée.
*   Cette fonction de migration lit les données existantes, les transforme pour correspondre au nouveau schéma, puis sauvegarde les données migrées et met à jour `llm_app_version`.

---

**Considérations UX hors-ligne :**

*   Tester régulièrement en ouvrant `index.html` directement et via un serveur local.
*   Noter dans le README les limitations de `localStorage` en mode `file://`.

---

**Simplification des Modules JS pour V1 :**

*   Commencer avec `app.js`, `dataManager.js` (qui inclut la logique de `storageManager` et les définitions de modèles de données), `uiManager.js`, et un `components/` pour les vues/logiques spécifiques (ex: `PromptComponent.js`, `ProjectComponent.js` qui gèrent à la fois liste et détail/édition pour leur entité). On pourra scinder davantage si la complexité augmente.