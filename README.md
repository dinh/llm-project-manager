# LLM Project Manager

LLM Project Manager est une application web monopage (Single Page Application) conçue pour aider les utilisateurs à gérer leurs projets impliquant des Large Language Models (LLMs). Elle permet d'organiser les prompts, les **templates de documents pour diverses phases de projet**, et le contenu des différentes sections de projet (comme les PRD, spécifications UX, notes techniques, etc.), le tout stocké localement dans votre navigateur via `localStorage`.

## Philosophie

L'objectif est de fournir un outil simple, léger et personnalisable pour :
*   **Centraliser** les prompts LLM et faciliter leur réutilisation et leur versioning.
*   **Structurer** la documentation de projet en utilisant des sections et une **riche bibliothèque de templates de section réutilisables** (ex: pour PRD, UX, MVP, prompts pour design, etc.).
*   **Suivre** (à terme) l'utilisation des prompts et l'avancement des projets.

## Stack Technique

*   **HTML5**
*   **Tailwind CSS** (via CDN) pour le style
*   **JavaScript Natif (ES6 Modules)** pour la logique applicative
*   **Font Awesome** (via CDN) pour les icônes
*   **`localStorage`** du navigateur pour la persistance des données

## Approche de Développement avec les LLM

Nous utilisons activement les Large Language Models (LLM) comme assistants dans notre processus de développement. Pour en savoir plus sur notre méthodologie et nos bonnes pratiques pour interagir efficacement avec les LLM, consultez notre [Guide de Développement avec les LLM](./docs/LLM_DEVELOPMENT_GUIDE.md).

## Structure des Données (`localStorage`)

L'application utilise les clés `localStorage` suivantes :
*   `llm_app_version`: (String) Version du schéma de données (ex: "1.0.0").
*   `llm_projects`: (Array) Liste des projets.
*   `llm_sectionTemplates`: (Array) Bibliothèque de templates de section.
*   `llm_prompts`: (Array) Catalogue de prompts LLM.

Pour une description détaillée de la structure de chaque objet (Projet, Template de Section, Prompt) et une **liste des types de templates de section envisagés**, veuillez consulter notre [Plan de Développement Détaillé](./docs/PLAN.md).

## Comment Lancer et Utiliser

1.  **Cloner le dépôt (si applicable) :**
    ```bash
    git clone [URL_DE_VOTRE_DEPOT_GIT]
    cd llm-project-manager
    ```
2.  **Ouvrir l'application :**
    *   **Option A (Serveur Local - Recommandé) :** Utilisez un simple serveur HTTP. Si vous avez Node.js, vous pouvez utiliser `serve` :
        ```bash
        npx serve
        ```
        Ouvrez ensuite l'URL fournie (généralement `http://localhost:3000` ou `http://localhost:5000`) dans votre navigateur.
    *   **Option B (Directement depuis le fichier) :** Ouvrez directement le fichier `index.html` dans votre navigateur (ex: `file:///chemin/vers/votre/projet/index.html`).
        *   **Note sur `localStorage` en mode `file://` :** Le comportement de `localStorage` peut varier entre les navigateurs lorsqu'une page est ouverte via le protocole `file://`. L'utilisation d'un serveur local est généralement plus fiable.

3.  **Utilisation :**
    *   L'application est conçue pour être intuitive. Explorez les différentes vues (Tableau de bord, Projets, Prompts, Templates) via la barre de navigation.
    *   Créez vos premiers prompts et templates de section. Ensuite, organisez-les et utilisez-les au sein de vos projets.
    *   **(À venir en Phase 2)** Vous pourrez initialiser les sections de vos projets à partir de la bibliothèque de templates et utiliser vos prompts pour générer du contenu.

## Plan de Développement / Roadmap

Nous suivons un plan de développement par phases. Pour une vue détaillée des fonctionnalités actuelles, prévues et de la feuille de route du projet, veuillez consulter notre [Plan de Développement Détaillé](./docs/PLAN.md).

**Phase Actuelle :** Fin de Phase 0 et début de Phase 1.

## Fonctionnalités Actuelles

*   Navigation entre les vues Tableau de bord, Projets, Prompts, Templates.
*   CRUD de base pour les Projets, Prompts et Templates de Section (incluant la création de quelques templates par défaut au premier lancement).
*   Stockage des données dans `localStorage` avec gestion de version basique.
*   Système de modales pour la création et l'édition.
*   Notifications Toast.
*   Structure modulaire du code JavaScript.

## Prochaines Étapes Majeures (Priorités pour Phase 1)

*   Implémentation de l'**Import/Export JSON Global** pour toutes les données.
*   Améliorations du Catalogue de Prompts : versioning (`history`), recherche/filtres.
*   Améliorations de la Bibliothèque de Templates : recherche/filtres.

## Problèmes Connus / Limitations

*   L'édition interactive des sections de projet et l'utilisation des templates/prompts au sein des projets sont prévues pour la Phase 2.
*   Pas encore de fonctionnalité d'import/export global.
*   La recherche et le filtrage dans les listes sont basiques.

## Contribuer

Ce projet est actuellement en développement actif. Si vous souhaitez contribuer, veuillez [décrire comment, ex: ouvrir une issue pour discuter des changements].

## Licence

[Choisissez une licence si vous le souhaitez, ex: MIT License]

---