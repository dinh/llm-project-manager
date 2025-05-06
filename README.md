# 🚀 LLM Project Manager

**LLM Project Manager** est une application web monopage (Single Page Application - SPA) légère et centrée sur le stockage local. Elle est conçue pour vous aider à gérer efficacement vos projets impliquant des Large Language Models (LLMs).

Organisez vos prompts, templates de documents et le contenu de vos sections de projet (PRD, spécifications UX, notes techniques, etc.) directement dans votre navigateur via `localStorage`.

## ✨ Philosophie

Notre objectif est de fournir un outil simple, léger et personnalisable pour :

*   🎯 **Centraliser** les prompts LLM, facilitant leur réutilisation et leur versioning.
*   🏗️ **Structurer** la documentation de projet grâce à des sections et une riche bibliothèque de templates réutilisables (ex: PRD, UX, MVP, prompts pour design).
*   📈 **Suivre** (à terme) l'utilisation des prompts et l'avancement des projets.

## 🛠️ Stack Technique

*   **HTML5**
*   **Tailwind CSS** (via CDN) pour le style
*   **JavaScript Natif (ES6 Modules)** pour la logique applicative
*   **Font Awesome** (via CDN) pour les icônes
*   **`localStorage`** du navigateur pour la persistance des données

## 🤖 Approche de Développement avec les LLM

Nous utilisons activement les Large Language Models (LLM) comme assistants dans notre processus de développement.
Pour en savoir plus sur notre méthodologie et nos bonnes pratiques, consultez notre [Guide de Développement avec les LLM](./docs/LLM_DEVELOPMENT_GUIDE.md).

## 💾 Structure des Données (`localStorage`)

L'application utilise les clés `localStorage` suivantes :

*   `llm_app_version`: (String) Version du schéma de données (ex: "1.0.0").
*   `llm_projects`: (Array) Liste de vos projets.
*   `llm_sectionTemplates`: (Array) Bibliothèque de templates de section.
*   `llm_prompts`: (Array) Catalogue de prompts LLM.

Pour une description détaillée de la structure de chaque objet (Projet, Template de Section, Prompt) et une liste des types de templates envisagés, veuillez consulter notre [Plan de Développement Détaillé](./docs/PLAN.md).

## 🚀 Comment Lancer et Utiliser

1.  **Cloner le dépôt (si applicable) :**
    ```bash
    git clone [URL_DE_VOTRE_DEPOT_GIT]
    cd llm-project-manager
    ```

2.  **Ouvrir l'application :**
    *   **Option A (Serveur Local - Recommandé) :**
        Utilisez un simple serveur HTTP. Avec Node.js :
        ```bash
        npx serve
        ```
        Ouvrez ensuite l'URL fournie (généralement `http://localhost:3000` ou `http://localhost:5000`).
    *   **Option B (Directement depuis le fichier) :**
        Ouvrez `index.html` dans votre navigateur (ex: `file:///chemin/vers/votre/projet/index.html`).
        *   ⚠️ **Note :** Le comportement de `localStorage` peut varier avec le protocole `file://`. Un serveur local est plus fiable.

3.  **Utilisation :**
    *   Explorez les vues (Tableau de bord, Projets, Prompts, Templates) via la barre de navigation.
    *   Créez vos prompts et templates de section.
    *   Organisez-les et utilisez-les au sein de vos projets.
    *   💡 **(À venir en Phase 2)** Initialisez les sections de projet à partir des templates et utilisez vos prompts pour générer du contenu.

## 🗺️ Plan de Développement / Roadmap

Nous suivons un plan de développement par phases. Pour une vue détaillée, consultez notre [Plan de Développement Détaillé](./docs/PLAN.md).

**Phase Actuelle :** Fin de Phase 0 et début de Phase 1.

## ✅ Fonctionnalités Actuelles

*   Navigation fluide entre les vues : Tableau de bord, Projets, Prompts, Templates.
*   CRUD de base pour Projets, Prompts et Templates de Section.
*   Initialisation avec quelques templates par défaut au premier lancement.
*   Stockage des données dans `localStorage` avec gestion de version basique.
*   Système de modales pour la création et l'édition.
*   Notifications Toast pour les actions utilisateur.
*   Structure modulaire du code JavaScript.

## 🎯 Prochaines Étapes Majeures (Priorités pour Phase 1)

*   **Import/Export JSON Global** pour toutes les données.
*   **Améliorations du Catalogue de Prompts :**
    *   Versioning (`history`) des prompts.
    *   Fonctionnalités de recherche et de filtrage avancées.
*   **Améliorations de la Bibliothèque de Templates :**
    *   Fonctionnalités de recherche et de filtrage.

## 🚧 Problèmes Connus / Limitations

*   L'édition interactive des sections de projet et l'utilisation des templates/prompts au sein des projets sont prévues pour la **Phase 2**.
*   Pas encore de fonctionnalité d'import/export global (en cours pour Phase 1).
*   La recherche et le filtrage dans les listes sont actuellement basiques.

## 🤝 Contribuer

Ce projet est en développement actif. Si vous souhaitez contribuer, veuillez [décrire comment, ex: ouvrir une issue pour discuter des changements, soumettre une Pull Request après avoir consulté les guidelines de contribution, etc.].

## 📜 Licence

MIT