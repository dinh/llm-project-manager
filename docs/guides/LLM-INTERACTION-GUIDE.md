**Comment optimiser vos interactions avec un LLM lorsque vous travaillez sur votre projet?**

Soyez stratégique. Pensez à ce dont le LLM a *vraiment* besoin pour comprendre votre requête spécifique, en commençant par le code directement concerné et votre plan directeur.
Donner le bon contexte est crucial pour obtenir des réponses utiles et précises. Voici une suggestion des fichiers et informations à fournir systématiquement ou fréquemment, ainsi que quand et pourquoi :

**Contexte Essentiel (Presque toujours utile) :**

1.  **Le Fichier Actuellement Modifié ou Discuté :**
    *   **Pourquoi :** C'est le point focal de votre question. Le LLM a besoin de voir le code exact sur lequel vous travaillez.
    *   **Comment :** Copiez-collez l'intégralité du fichier ou la section pertinente si le fichier est très long et que votre question ne concerne qu'une petite partie. Précisez bien si c'est une section.

2.  **`PLAN.md` (ou votre fichier de plan de développement détaillé) :**
    *   **Pourquoi :**
        *   **Vision d'ensemble :** Permet au LLM de comprendre les objectifs à long terme, la philosophie du projet, et où se situe la fonctionnalité actuelle dans le grand schéma.
        *   **Structure des données :** Le plan contient la définition de vos objets (`Project`, `SectionTemplate`, `Prompt`), ce qui est vital pour toute question touchant à la manipulation ou à l'affichage des données.
        *   **Fonctionnalités prévues :** Aide le LLM à anticiper les besoins futurs et à suggérer des solutions plus robustes.
    *   **Comment :** Si votre question est générale sur une fonctionnalité ou l'architecture, fournissez-le. Si vous posez une question très ciblée sur une ligne de code, ce n'est peut-être pas nécessaire à chaque fois, mais gardez-le à l'esprit si la réponse du LLM semble manquer de contexte. Vous pouvez aussi ne copier que la section pertinente du plan.

3.  **Votre Question Spécifique et Claire :**
    *   **Pourquoi :** Le LLM ne peut pas deviner ce que vous voulez.
    *   **Comment :**
        *   Soyez précis : "Comment puis-je implémenter la fonctionnalité X décrite dans Phase 2 de `PLAN.md` dans le fichier `js/ui/UIManager.js` ?"
        *   Décrivez le problème : "J'obtiens cette erreur Y lorsque j'essaie de faire Z dans cette fonction de `js/managers/ProjectManager.js`."
        *   Indiquez le comportement attendu vs. le comportement observé.

**Contexte Utile (Selon la nature de la question) :**

4.  **Fichiers Liés ou Interdépendants :**
    *   **Pourquoi :** Si vous modifiez `UIManager.js` et que cela interagit fortement avec `App.js` ou un `Manager` spécifique, fournir ces fichiers (ou les sections pertinentes) peut être crucial.
    *   **Exemple :** Si vous ajoutez un nouveau type d'événement dans `UIManager.js` qui doit être écouté dans `App.js`, fournissez les deux. Si vous ajoutez une méthode à un `Manager` qui sera appelée par `UIManager.js`.
    *   **Comment :** Mentionnez explicitement les relations : "Voici `UIManager.js` où je veux appeler une nouvelle méthode de `ProjectManager.js`. Voici `ProjectManager.js`."

5.  **`index.html` (Parties pertinentes de la structure HTML) :**
    *   **Pourquoi :** Si votre question concerne le rendu UI, la manipulation du DOM, ou la liaison d'événements.
    *   **Comment :** Copiez la section HTML concernée (par exemple, la structure d'une modale, d'une liste, ou d'un formulaire) si votre code JS doit interagir avec.

6.  **`README.md` (Rarement en entier, mais des sections peuvent être utiles) :**
    *   **Pourquoi :** Si vous avez des questions sur la description générale du projet, la stack technique, ou des instructions de base que vous y avez notées.
    *   **Comment :** Généralement, les informations du `PLAN.md` sont plus pertinentes pour le développement quotidien.

7.  **Messages d'Erreur Complets :**
    *   **Pourquoi :** Les messages d'erreur et les stack traces sont des informations de débogage de première importance.
    *   **Comment :** Copiez-collez l'intégralité du message d'erreur tel qu'il apparaît dans la console de votre navigateur.

8.  **Votre `TODO.md` ou la description de la Tâche Actuelle :**
    *   **Pourquoi :** Si votre question porte sur l'implémentation d'une tâche spécifique, cela donne un contexte immédiat sur l'objectif.
    *   **Comment :** "Je travaille sur la tâche 'CRUD complet pour les prompts' de `TODO.md`. Voici mon `PromptManager.js`..."

**Ce que vous n'avez généralement PAS besoin de fournir à chaque fois :**

*   L'intégralité de votre code base pour chaque petite question.
*   Les fichiers CSS (sauf si votre question est spécifiquement sur le style).
*   Les bibliothèques externes (comme Tailwind CDN) sauf si vous soupçonnez un conflit ou une mauvaise utilisation.

**Stratégie Générale :**

1.  **Commencez Ciblé :** Fournissez le fichier actuel et votre question précise.
2.  **Ajoutez le Plan :** Si la question est plus large ou si la réponse initiale manque de contexte, ajoutez (des parties de) `PLAN.md`.
3.  **Élargissez si Nécessaire :** Si le LLM a besoin de plus, il vous le demandera souvent implicitement ou vous donnera une réponse qui indique un manque de compréhension. C'est à ce moment-là que vous fournissez les fichiers liés, le HTML pertinent, etc.
4.  **Itérez :** La conversation avec un LLM est souvent itérative. Vous n'avez pas besoin de tout donner du premier coup.
5.  **Privilégiez la Pertinence :** Plus le contexte est pertinent, meilleure sera la réponse. Trop de contexte non pertinent peut noyer l'information clé.

**Exemple de "bon" prompt de départ pour une nouvelle fonctionnalité :**

```
Je commence à travailler sur la fonctionnalité "Initialisation des Sections" décrite dans la Phase 2 de mon `PLAN.md` (ci-joint).
Je suis dans `js/ui/UIManager.js` (ci-joint) et je veux implémenter la logique dans la méthode `getProjectDetailHTML` pour proposer à l'utilisateur de choisir un `SectionTemplate` si une section de projet est vide.

Voici `PLAN.md`:
<contenu de PLAN.md ou section pertinente>

Voici `js/ui/UIManager.js`:
<contenu de UIManager.js>

Comment pourrais-je structurer l'interface utilisateur dans `getProjectDetailHTML` pour afficher la liste des `SectionTemplate` disponibles (venant de `app.templateManager.getAll()`) et comment gérer la sélection pour mettre à jour `project.sections.SECTION_KEY.content` et `templateIdUsed` via `app.projectManager.updateSection()` ?
```