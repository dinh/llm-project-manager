# TODO - LLM Project Manager

Ce document suit la progression du développement de l'application LLM Project Manager, basé sur le [Plan de Développement V3.1](./docs/PLAN.md).

**Légende :**
- `[x]` Terminé
- `[ ]` À Faire
- `[-]` En Cours / Partiellement Fait

---

## Phase 0 : Fondations et Structure Minimale

- `[x]` Structure de Fichiers et Modules ES6 (js/app.js, js/ui/UIManager.js, js/managers/*, etc.)
- `[x]` `StorageManager.js` : CRUD `localStorage`, gestion `llm_app_version` (migration basique)
- `[x]` `BaseDataManager.js` et Gestionnaires d'entités (`ProjectManager`, `PromptManager`, `TemplateManager`)
- `[x]` `UIManager.js` : Fonctions UI communes (modales, toasts, rendu de listes basiques, navigation)
- `[x]` `App.js` : Orchestrateur principal
- `[x]` Style de Base (Tailwind CSS intégré) et `showToast()`
- `[x]` Documentation `README.md` initiale et `docs/PLAN.md` (incluant la liste des types de templates de section)
- `[x]` Organisation des documents dans un répertoire `docs/`

---

## Phase 1 : Gestion Essentielle des Prompts LLM et Templates de Section + Import/Export Global

**Objectif :** Avoir un catalogue fonctionnel de prompts et de templates de section, avec la capacité de sauvegarder/restaurer toutes les données.

**Progression : Bien engagée.**

### Catalogue de Prompts LLM :
*   `[-]` CRUD complet pour les prompts (`PromptManager`, formulaires UI)
    *   `[x]` Création, Lecture, Mise à jour, Suppression
*   `[ ]` Versioning automatique du `textContent` dans `prompt.history`
*   `[ ]` Affichage de l'historique du prompt dans la vue détail
*   `[ ]` Recherche et filtres dans la vue liste des prompts (par tags, `promptType`, favoris, texte)
*   `[x]` Bouton "Copier Prompt"
*   `[x]` Gestion des favoris (`isFavorite`, bouton toggle)

### Bibliothèque de Templates de Section :
*   `[-]` CRUD pour les `SectionTemplate` (`TemplateManager`, formulaires UI)
    *   `[x]` Création, Lecture, Mise à jour, Suppression
*   `[x]` Interface pour créer/éditer ces modèles (modales)
*   `[-]` Inclure quelques "starter templates" par défaut (`_createDemoData`)
    *   `[ ]` **Action :** Ajouter des templates de base pour au moins : `PRD`, `General-Notes`, `UX-User-Flow`, `MVP-Concept`, `v0-Design-Prompt-Gen` (et d'autres de la liste définie dans `PLAN.md` si souhaité pour la V1).
    *   `[ ]` Vérifier que chaque template de base a un `type` clair et un `content` initial pertinent.
*   `[ ]` Recherche et filtres dans la vue liste des templates (par tags, `type`, texte)

### Import/Export JSON Global :
*   `[ ]` **Exporter toutes les données de l'application** (`llm_projects`, `llm_sectionTemplates`, `llm_prompts`) dans un unique fichier JSON.
    *   `[ ]` Bouton/Fonctionnalité UI pour l'export.
*   `[ ]` **Importer depuis un fichier JSON global.**
    *   `[ ]` Bouton/Fonctionnalité UI pour l'import.
    *   `[ ]` Option de **fusion OU remplacement** des données existantes.
    *   `[ ]` Gestion attentive des ID pour éviter les conflits (surtout en mode fusion).
    *   `[ ]` Validation robuste de la structure du fichier JSON importé.

---

## Phase 2 : Gestion des Projets et Intégration des Sections

**Objectif :** Permettre de créer des projets, d'y initialiser des sections à partir des templates, et d'éditer le contenu de ces sections en lien (optionnel) avec les prompts.

### Gestion des Projets :
*   `[x]` CRUD pour les Projets (`name`, `status`) (`ProjectManager`, formulaires UI)
*   `[x]` Vue liste des projets

### Vue Détail du Projet (`UIManager.getProjectDetailHTML`) :
*   `[x]` Navigation/Affichage des sections existantes (PRD, UX, etc.).
*   `[x]` Structure `project.sections` avec `content` et `lastPromptIdUsed`.
*   `[ ]` **Initialisation des Sections (Interactive via UI) :**
    *   `[ ]` Si une section est vide, proposer à l'utilisateur de choisir un `SectionTemplate` depuis la bibliothèque.
    *   `[ ]` **UI :** La modale de sélection des templates doit permettre de filtrer par `type` (ex: si section "PRD", montrer les templates de `type: "PRD"`).
    *   `[ ]` Remplir `project.sections.SECTION_KEY.content` avec le contenu du template choisi.
    *   `[ ]` Stocker `project.sections.SECTION_KEY.templateIdUsed` (ID du template utilisé).
*   `[ ]` **Édition et Sauvegarde Manuelle des Sections :**
    *   `[ ]` Permettre l'édition du `content` de chaque section via un `<textarea>` éditable.
    *   `[ ]` Bouton "Enregistrer" par section pour sauvegarder les modifications.
*   `[ ]` **Bouton "Utiliser un Prompt" par Section :**
    *   `[ ]` Ouvrir une modale listant les prompts du catalogue (`llm_prompts`).
    *   `[ ]` **UI :** La modale de sélection des prompts doit permettre de filtrer par `promptType` et/ou `tags`.
    *   `[ ]` Permettre de copier le `textContent` du prompt sélectionné.
    *   `[ ]` Enregistrer `lastPromptIdUsed` dans la section du projet après utilisation.
*   `[ ]` **Lien Visuel :**
    *   `[ ]` Afficher clairement (si renseigné) le nom/type du `templateIdUsed` à côté de chaque section.
    *   `[x]` Afficher (si renseigné) le `lastPromptIdUsed` (actuellement l'ID, pourrait être le titre du prompt).

---

## Phase 3 : Suivi, Tâches et Améliorations Avancées (Sélection Prioritaire)

*   `[ ]` **Variables/Templating dans les Prompts LLM.**
*   `[ ]` **Suivi de Performance et Usage des Prompts** (Rating, exemples d'outputs, lier `prompt.usage` aux `projectId`/`sectionKey`).
*   `[ ]` **Gestion de Tâches Simples** (associées aux projets).
    *   `[ ]` "Dashboard" pour historique et tâches par projet.
*   `[ ]` **Paramètres LLM** avec les prompts.
*   `[ ]` **Recherche Globale.**

---

## Phase 4 : Polissage et Fonctionnalités de Confort

*   `[ ]` Actions en Masse (ex: supprimer plusieurs prompts).
*   `[ ]` Tri Avancé dans les listes.
*   `[ ]` Support Markdown pour le contenu des sections/templates (rendu).
*   `[ ]` Raccourcis Clavier.
*   `[ ]` Accessibilité (A11y).
*   `[ ]` Aide contextuelle / Tooltips.

---

**Comment utiliser ce fichier :**

1.  **Placez-le à la racine de votre projet** (ou dans `docs/` si vous préférez, mais la racine est courante pour un `TODO.md`).
2.  **Mettez-le à jour régulièrement :**
    *   Cochez les cases `[x]` lorsque vous terminez une tâche.
    *   Utilisez `[-]` si une tâche est commencée mais pas finie.
    *   Ajoutez des sous-tâches si nécessaire pour décomposer des points plus importants.
3.  **Référez-vous-y avant de commencer une nouvelle session de codage** pour savoir où vous en êtes et ce qui vient ensuite.

Ce `TODO.md` vous donne une feuille de route claire et actionnable pour la suite du développement. Bon courage !