# Plan de Développement V3.1 : Gestionnaire de Projets et Prompts LLM (Affiné)

**Date de dernière mise à jour :** [Date Actuelle]

---

## Philosophie

Une application web monopage (HTML, Tailwind CSS, JS natif modulaires) pour gérer :

*   **Projets :** Conteneurs pour organiser le travail.
*   **Sections de Projet :** Documents structurés au sein d'un projet (PRD, UX, etc.), chacun ayant son propre contenu éditable.
*   **Templates de Section (Bibliothèque) :** Modèles de base réutilisables pour initialiser les sections des projets.
*   **Prompts LLM (Catalogue) :** La collection de vos instructions LLM, versionnées, taguées, et liées à la génération de contenu pour les sections de projet.

---

## Architecture des Données (`localStorage`)

1.  `llm_app_version`: (Nouveau) String pour la version du schéma de données (ex: `"1.0.0"`). Utile pour la migration.
2.  `llm_projects`: Array d'objets `Project`.
    *   **`Project` :**
        ```javascript
        {
            id: "uuid",
            name: "Nom du Projet",
            status: "en cours" | "terminé" | "en attente", // etc.
            createdAt: "timestamp",
            updatedAt: "timestamp",
            sections: {
                prd: {
                    content: "Contenu du PRD...",
                    lastPromptIdUsed: "promptId123",
                    templateIdUsed: "templateIdABC"
                },
                uxFlow: {
                    content: "Description du flux UX...",
                    lastPromptIdUsed: "promptId456",
                    templateIdUsed: "templateIdDEF"
                },
                design: [ // Tableau pour les sous-sections de design
                    {
                        subType: "v0-Design", // Identifiant du type de design
                        content: "Prompt ou spécifications pour le design v0...",
                        lastPromptIdUsed: "promptId789",
                        templateIdUsed: "templateIdGHI"
                    },
                    {
                        subType: "Lovable-Design",
                        content: "Prompt ou spécifications pour un design 'lovable'...",
                        lastPromptIdUsed: "promptIdXYZ",
                        templateIdUsed: "templateIdJKL"
                    }
                ],
                // ... autres sections comme marketing, technique, etc.
            }
        }
        ```
    *   **Précision Granularité Templates :** Pour les sections comme "Design", `sections.design` sera un *tableau d'objets*. Chaque objet représente un sous-type de design (ex: `subType: "v0-Design"`) avec son propre `content`, `lastPromptIdUsed`, et `templateIdUsed` (pour savoir quel template de section a servi de base). Cela évite de multiplier les clés de haut niveau dans `sections`.

3.  `llm_sectionTemplates`: Array d'objets `SectionTemplate`.
    *   **`SectionTemplate` :**
        ```javascript
        {
            id: "uuid",
            name: "Modèle PRD Standard",
            type: "PRD" | "UX-User-Flow" | "MVP-Concept" | "v0-Design-Prompt-Gen" | /* ...autres types */,
            content: "Modèle de base pour la section...",
            createdAt: "timestamp",
            updatedAt: "timestamp",
            tags: ["produit", "stratégie"]
        }
        ```
    *   **Types de Templates de Section Envisagés (Liste indicative) :**
        *   **Stratégie & Produit :** `PRD`, `Market-Research`, `MVP-Concept`
        *   **Planification & UX :** `UX-User-Flow`, `User-Story-Mapping`, `Design-Brief`
        *   **Développement & Technique :** `MVP-Dev-Plan`, `Ultra-Lean-MVP-Specs`, `Technical-Design-Doc`
        *   **Qualité & Tests :** `Testing-Plan`
        *   **Génération LLM & Marketing :** `v0-Design-Prompt-Gen`, `Marketing-Copy-Gen`, `Content-Strategy`
        *   **Général & Organisation :** `General-Notes`, `Meeting-Minutes`

4.  `llm_prompts`: Array d'objets `Prompt`.
    *   **`Prompt` :**
        ```javascript
        {
            id: "uuid",
            title: "Prompt pour générer une User Story",
            textContent: "En tant que [persona], je veux [action] afin de [bénéfice].",
            tags: ["ux", "user story", "agile"],
            promptType: "génération PRD" | "génération UX" | "génération Design" | /* ...autres types */,
            isFavorite: true,
            history: [
                { timestamp: "timestamp", textContent: "Version précédente du prompt..." }
            ],
            notes: "Ce prompt fonctionne bien avec GPT-4.",
            parameters: { /* ex: temperature: 0.7, model: "gpt-4" */ },
            createdAt: "timestamp",
            updatedAt: "timestamp"
        }
        ```

---

## Phase 0 : Fondations et Structure Minimale

1.  **Structure de Fichiers et Modules ES6 (Simplifiée pour V1) :**
    *   `index.html`
    *   `js/app.js` : Orchestrateur principal.
    *   `js/StorageManager.js` : (Anciennement `dataManager.js` pour la partie stockage) Gère le CRUD pour `localStorage` et la logique de migration/gestion des conflits de `localStorage` (vérification de `llm_app_version` au démarrage).
    *   `js/BaseDataManager.js` et gestionnaires d'entités (`ProjectManager.js`, `PromptManager.js`, `TemplateManager.js`): Définition des modèles de données et logique métier spécifique.
    *   `js/ui/UIManager.js` : Fonctions UI communes (modales, toasts, rendu de listes basiques).
    *   `docs/` : Répertoire pour la documentation (ce plan, README détaillé, etc.).
2.  **Initialisation et `localStorage` :**
    *   Définir les clés (`llm_app_version`, `llm_projects`, `llm_sectionTemplates`, `llm_prompts`).
    *   Logique de base de chargement/sauvegarde des données.
3.  **Style de Base et Toasts :**
    *   Intégrer Tailwind CSS.
    *   Ajouter des styles personnalisés si nécessaire (`custom.css`).
    *   Implémenter une fonction `showToast(message, type)` pour les notifications.
4.  **Documentation README Initiale & `docs/PLAN.md` :**
    *   Créer un `README.md` de base.
    *   Placer ce document (ou une version) dans `docs/PLAN.md`.
    *   Mentionner le comportement de l'application en mode `file://` vs. serveur local.

---

## Phase 1 : Gestion Essentielle des Prompts LLM et Templates de Section + Import/Export Global

*   **Objectif :** Avoir un catalogue fonctionnel de prompts et de templates de section, avec la capacité de sauvegarder/restaurer toutes les données.
*   **Fonctionnalités :**
    1.  **Catalogue de Prompts LLM :**
        *   CRUD complet pour les prompts (`PromptManager.js`).
        *   Versioning automatique du `textContent` dans `prompt.history` à chaque sauvegarde.
        *   Affichage de l'historique d'un prompt (lecture seule).
        *   Fonctionnalités de recherche et filtres (par `tags`, `promptType`, `isFavorite`).
        *   Bouton "Copier Prompt" (copie `textContent` dans le presse-papiers).
        *   Gestion des favoris (`isFavorite`).
    2.  **Bibliothèque de Templates de Section :**
        *   CRUD complet pour les `SectionTemplate` (`TemplateManager.js`).
        *   Interface pour créer/éditer ces modèles.
        *   Inclure quelques "starter templates" par défaut lors de la première initialisation (ex: PRD, General-Notes, MVP-Concept, v0-Design-Prompt-Gen).
    3.  **Import/Export JSON Global (Dès V1) :**
        *   Exporter *toutes* les données (`llm_projects`, `llm_sectionTemplates`, `llm_prompts`) dans un unique fichier JSON.
        *   Importer depuis ce fichier JSON global.
            *   Option de fusion (ajout des nouveaux éléments, mise à jour des existants par ID si la version importée est plus récente, gestion des conflits d'ID).
            *   Option de remplacement total.
            *   *Validation robuste des données importées cruciale.*

---

## Phase 2 : Gestion des Projets et Intégration des Sections

*   **Objectif :** Permettre de créer des projets, d'y initialiser des sections à partir des templates, et d'éditer le contenu de ces sections en lien (optionnel) avec les prompts.
*   **Fonctionnalités :**
    1.  **Gestion des Projets :**
        *   CRUD pour les Projets (`name`, `status`) via `ProjectManager.js`.
        *   Vue liste des projets.
    2.  **Vue Détail du Projet :**
        *   Navigation par onglets ou accordéon pour afficher les différentes sections du projet (PRD, UX, Design, etc.).
        *   **Initialisation des Sections :**
            *   Lors de l'accès à une section vide d'un projet (ex: `projet.sections.prd` est vide), proposer de choisir un `SectionTemplate` depuis la bibliothèque.
            *   La liste des templates proposés doit être filtrable par `type` pertinent pour la section (ex: pour la section PRD, montrer les templates de type "PRD").
            *   Le contenu du template choisi remplit `project.sections.SECTION_KEY.content`.
            *   L'ID du template utilisé est enregistré dans `project.sections.SECTION_KEY.templateIdUsed`.
        *   **Édition et Sauvegarde Manuelle des Sections :**
            *   Chaque section (ou sous-section Design) dispose d'un `<textarea>` (ou un éditeur plus riche plus tard) pour son `content`.
            *   Un bouton "Enregistrer" par section pour sauvegarder les modifications.
        *   **Bouton "Utiliser un Prompt" par Section :**
            *   Ouvre une modale listant les prompts du catalogue (`llm_prompts`).
            *   La liste des prompts doit être filtrable (par `promptType` pertinent pour la section, `tags`, favoris).
            *   Permet de copier le `textContent` du prompt sélectionné.
            *   L'utilisateur génère le contenu en externe (ChatGPT, Claude, etc.), puis colle le résultat dans le `<textarea>` de la section.
            *   L'application enregistre l'ID du prompt utilisé dans `project.sections.SECTION_KEY.lastPromptIdUsed`.
    3.  **Lien Visuel :**
        *   À côté de chaque section (ou sous-section), afficher (s'ils sont renseignés) le nom du `templateIdUsed` et le titre du `lastPromptIdUsed` (cliquables pour voir le détail du template/prompt).

---

## Phase 3 : Suivi, Tâches et Améliorations Avancées (Sélection Prioritaire)

*   **Objectif :** Augmenter la productivité et la puissance de l'outil.
*   **Fonctionnalités (Choisir 2-3 pour commencer) :**
    1.  **Variables/Templating dans les Prompts LLM :** Permettre de définir des variables (ex: `{{NOM_PROJET}}`, `{{DESCRIPTION_FONCTIONNALITE}}`) dans `prompt.textContent` et les remplacer avant de copier le prompt.
    2.  **Suivi de Performance et Usage des Prompts :**
        *   Ajouter un champ `rating` (1-5 étoiles) et `examples: [{inputContext, outputGenerated}]` à l'objet `Prompt`.
        *   Lier l'usage d'un prompt à un projet/section : `prompt.usage: [{ projectId, sectionKey, timestamp }]`.
    3.  **Gestion de Tâches Simples :**
        *   Associer une liste de tâches simples (description, statut : à faire/en cours/terminé) à chaque projet.
        *   Le **"Dashboard"** (ou une section "Vue d'ensemble") pour l'historique des actions et les tâches pourrait commencer comme une section dédiée dans la vue détail d'un projet.
    4.  **Paramètres LLM avec les Prompts :** Permettre de sauvegarder des paramètres suggérés (température, modèle) avec chaque prompt (`prompt.parameters`).
    5.  **Recherche Globale :** Une barre de recherche permettant de trouver des projets, sections, prompts, ou templates par mots-clés.

---

## Phase 4 : Polissage et Fonctionnalités de Confort

*   **Actions en Masse :** (ex: supprimer plusieurs prompts, taguer plusieurs projets).
*   **Tri Avancé :** Options de tri supplémentaires pour les listes (par date de création/modification, nom, etc.).
*   **Support Markdown (Basique) :** Pour le contenu des sections (prévisualisation simple).
*   **Raccourcis Clavier :** Pour les actions fréquentes (sauvegarder, nouveau projet/prompt).
*   **Accessibilité (a11y) :** Améliorations pour la navigation au clavier et les lecteurs d'écran.
*   **Aide Contextuelle / Tooltips :** Pour guider l'utilisateur.

---

## Gestion des Conflits `localStorage` (intégré dans `StorageManager.js` dès Phase 0/1)

*   Au démarrage de l'application, `StorageManager.js` vérifie `localStorage.getItem('llm_app_version')`.
*   Si la clé est absente ou si sa valeur est inférieure à la version actuelle définie dans le code de l'application :
    *   Une fonction de migration est appelée.
    *   Cette fonction de migration lit les données existantes.
    *   Elle transforme les données pour correspondre au nouveau schéma (ex: ajout de nouveaux champs avec des valeurs par défaut, renommage de clés).
    *   Les données migrées sont ensuite sauvegardées dans `localStorage`.
    *   La clé `llm_app_version` est mise à jour avec la version actuelle.

---

## Considérations UX hors-ligne

*   Tester régulièrement l'application en ouvrant `index.html` directement depuis le système de fichiers (`file://`) ET via un serveur de développement local (ex: Live Server pour VS Code).
*   Noter clairement dans le `README.md` les limitations potentielles de `localStorage` en mode `file://` (restrictions de certains navigateurs sur la taille ou la persistance).

---

## Simplification des Modules JS pour V1

*   Commencer avec une structure modulaire mais potentiellement moins granulée :
    *   `app.js` (point d'entrée, initialisation)
    *   `js/services/StorageManager.js` (gestion brute du localStorage, migrations)
    *   `js/services/DataManager.js` (logique CRUD pour les entités, utilise StorageManager)
        *   Pourrait contenir les définitions des modèles (`Project`, `Prompt`, `SectionTemplate`) et leurs méthodes associées (créer, lire, mettre à jour, supprimer).
    *   `js/ui/UIManager.js` (manipulation DOM générale, modales, toasts)
    *   `js/components/` : Pour les modules gérant des parties spécifiques de l'interface et leur logique.
        *   `PromptComponent.js` (affichage liste prompts, formulaire d'édition, filtres)
        *   `ProjectComponent.js` (affichage liste projets, vue détail projet, gestion des sections)
        *   `TemplateComponent.js` (similaire à PromptComponent pour les templates)
*   On pourra scinder davantage (`ProjectManager.js`, `PromptManager.js` etc. comme fichiers séparés) si la complexité de `DataManager.js` augmente significativement.

---