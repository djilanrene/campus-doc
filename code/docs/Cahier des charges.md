---
tags:
  - cahier-des-charges
  - mvp
  - campus
  - document
---
---
### INFOS DE BASE

**Version :** 1.0  
**Date :** 04 Décembre 2025  
**Auteur :** Architecte Projet  
**Statut :** Pour Validation

---
### 0. Préambule et Résumé Exécutif

Ce document définit les spécifications fonctionnelles, techniques et stratégiques pour la version 1.0 (MVP) du projet "Campus Doc". L'objectif est de créer une plateforme web centralisée, fiable et équitable pour l'échange d'annales d'examens et de travaux dirigés, initialement ciblée sur les étudiants de la **Faculté des Sciences Économiques et de Gestion (FASEG) de l'Université de Lomé**.

Basé sur un principe de réciprocité via un système de crédits, Campus Doc vise à résoudre le problème de la dispersion et de la qualité inégale des ressources académiques. Ce document servira de contrat de référence pour le développement, définissant le périmètre, les objectifs, les contraintes et les critères de succès du projet.

---
### 1. Contexte et Vision du Projet

**Problème :** L'accès aux anciens sujets d'examens est un facteur clé de réussite pour les étudiants de la FASEG. Actuellement, ces ressources sont fragmentées, dispersées dans des groupes WhatsApp et Telegram désorganisés, souvent de qualité médiocre (illisibles, mal classées) et difficiles à trouver. Cette friction génère de l'incertitude et une perte de temps considérable pendant les périodes de révision critiques.

**Vision :** Campus Doc a pour vocation de devenir **LA source de référence unique et fiable** pour les ressources académiques de la FASEG, avant de s'étendre potentiellement à d'autres facultés. La plateforme doit incarner la fiabilité, la simplicité et l'équité, en s'assurant que pour bénéficier de la communauté, chaque membre doit y contribuer.

---
### 2. Objectifs et Mesure du Succès (KPIs)

Le succès de la v1.0 sera évalué sur la base des indicateurs de performance SMART suivants :

| Catégorie | KPI (Indicateur Clé de Performance) | Objectif à atteindre |
| :--- | :--- | :--- |
| **Adoption** | Nombre d'utilisateurs inscrits | Atteindre **150 étudiants de la FASEG inscrits** 3 mois après le lancement. |
| **Contenu** | Volume de ressources disponibles | Disposer de **plus de 100 documents approuvés et pertinents** 3 mois après le lancement. |
| **Autonomie** | Viabilité du système de crédits | Le ratio `(soumissions approuvées * 5) / téléchargements` doit être **> 1.2** 4 mois après le lancement. |
| **Qualité** | Efficacité du processus de soumission | Maintenir un **taux de rejet de documents < 20%** pour prouver que les règles sont claires. |
| **Technique** | Performance de l'expérience utilisateur | Maintenir un score **Google PageSpeed Insights > 90/100** sur mobile et desktop en permanence. |

---
### 3. Cibles et Personas

Le site est principalement destiné au persona suivant pour la v1.0 :

*   **Nom :** Koffi
*   **Profil :** Étudiant en Licence 2 Économie à la FASEG, Université de Lomé.
*   **Comportement :** Très actif sur WhatsApp pour les cours, mais frustré par le chaos des groupes. Utilise son smartphone comme principal outil de travail. Prépare ses examens en cherchant les sujets des années précédentes pour s'entraîner.
*   **"Pain Points" (Frustrations) :** Perte de temps à faire défiler des centaines de messages pour trouver un sujet. Incertitude sur la version correcte ou la lisibilité d'un PDF. Dépendance vis-à-vis des "délégués" ou des "anciens" pour obtenir les ressources.
*   **Objectif :** Trouver une plateforme où il peut, en moins de 2 minutes, rechercher par matière et par année un sujet d'examen fiable, le télécharger et se mettre au travail.

---
### 4. Périmètre Fonctionnel (MVP - Minimum Viable Product)

#### 4.1. Arborescence du Site (Sitemap)

```
/ (Page d'accueil pour visiteurs non connectés)
├── /inscription
├── /connexion
├── /dashboard (Tableau de bord pour utilisateurs connectés, page principale)
├── /upload (Formulaire de soumission de document)
└── /moderation (Interface privée pour les "Gardiens")
```

#### 4.2. Spécifications Détaillées par Module

##### Module 1 : Authentification (`/`, `/inscription`, `/connexion`)
*   **User Story :** En tant que visiteur, je veux pouvoir créer un compte simplement avec mon email et mon mot de passe pour accéder à la plateforme.
*   **Critères d'Acceptation :**
    1.  `[AUTH-01]` La page d'accueil présente le projet et deux boutons clairs : "S'inscrire" et "Se Connecter".
    2.  `[AUTH-02]` Tout accès à une page interne sans être connecté redirige vers `/connexion`.
    3.  `[ACC-01]` Le formulaire d'inscription requiert Email, Mot de passe (avec confirmation). À la création, un utilisateur est créé dans Firestore avec `role: "user"` et `credits: 3`. L'utilisateur est ensuite connecté et redirigé vers `/dashboard`.
    4.  `[ACC-02]` Le formulaire de connexion requiert Email et Mot de passe. La déconnexion est possible depuis la navigation principale.

##### Module 2 : Tableau de Bord & Recherche (`/dashboard`)
*   **User Story :** En tant qu'étudiant connecté, je veux voir mon solde de crédits et pouvoir rechercher facilement des documents pour trouver ce dont j'ai besoin.
*   **Critères d'Acceptation :**
    1.  `[DOC-01]` Le tableau de bord est la page principale post-connexion. Il affiche de manière proéminente le solde de crédits de l'utilisateur.
    2.  `[DOC-02]` L'interface contient des filtres de recherche obligatoires : Filière (ex: Économie, Gestion), Matière, Année.
    3.  La liste des résultats s'actualise dynamiquement et n'affiche que les documents avec le statut `approved`.
    4.  Chaque résultat affiche : Nom du Fichier, Matière, Année, Type (Partiel, Final, etc.).
    5.  `[DOC-03]` Un bouton "Télécharger" (coût : 1 crédit) est présent sur chaque résultat. Au clic, le système vérifie si `user.credits > 0`. Si non, un message d'erreur non-bloquant apparaît. Si oui, une transaction atomique décrémente les crédits et lance le téléchargement depuis Firebase Storage.

##### Module 3 : Contribution (`/upload`)
*   **User Story :** En tant qu'étudiant, je veux pouvoir soumettre facilement un document que je possède pour gagner des crédits.
*   **Critères d'Acceptation :**
    1.  `[DOC-04]` Un lien "Contribuer" dans la navigation mène au formulaire de soumission.
    2.  Le formulaire requiert : Filière, Matière, Année, Type, et un champ de téléversement de fichier.
    3.  **Contrainte :** Le champ de téléversement n'accepte **que les fichiers au format PDF**.
    4.  À la soumission, un document est créé dans Firestore avec `status: "pending"` et les métadonnées renseignées.
    5.  Un message de succès informe l'utilisateur que son document est en attente de validation.

##### Module 4 : Modération (`/moderation`)
*   **User Story :** En tant que Gardien, je veux une interface simple pour voir les documents en attente et les valider ou les rejeter rapidement.
*   **Critères d'Acceptation :**
    1.  `[MOD-01]` Le lien vers `/moderation` n'est visible dans la navigation que si `user.role === "guardian"`.
    2.  `[MOD-02]` L'interface affiche la liste de tous les documents avec `status: "pending"`.
    3.  `[MOD-03]` Pour chaque document, deux actions sont possibles : "Approuver" et "Rejeter".
        *   **Approuver :** Le statut du document passe à `approved`. Une transaction atomique incrémente de **5** les crédits de l'uploader (`uploaderId`).
        *   **Rejeter :** Le statut du document passe à `rejected`. Aucun crédit n'est attribué.
    4.  Toute la logique de modération est gérée par une Firebase Function sécurisée (`onCall`), qui vérifie le rôle du demandeur avant toute action.

---
### 5. Spécifications Non-Fonctionnelles

1.  **Performance :** Le site doit atteindre un score **Google PageSpeed Insights > 90/100**. Le Largest Contentful Paint (LCP) doit être inférieur à 2.5 secondes. Toutes les requêtes Firestore doivent être optimisées et indexées.
2.  **Sécurité :** Toutes les règles de sécurité Firestore et Storage doivent être implémentées côté serveur pour empêcher les accès non autorisés (principe du moindre privilège). La logique métier critique (attribution de crédits) doit être exclusivement dans les Firebase Functions. Validation des entrées sur tous les formulaires.
3.  **Compatibilité :** Affichage et fonctionnement parfaits sur les deux dernières versions majeures de Chrome, Firefox, et Safari (desktop et mobile).
4.  **Accessibilité :** Le site doit respecter les bonnes pratiques du **WCAG 2.1 niveau AA**, notamment sur les contrastes de couleurs, la navigation au clavier et les textes alternatifs pour les images.
5.  **Maintenabilité :** Le code doit être géré via un dépôt Git. L'utilisation d'outils de formatage (Prettier) et de linting (ESLint) est obligatoire pour garantir la cohérence du code.
6.  **UI/UX :** L'interface doit être minimaliste, claire et intuitive. La priorité est à la fonctionnalité. L'utilisation de la librairie de composants ShadCN/UI est préconisée.

---
### 6. Contraintes Techniques et Opérationnelles

1.  **Stack Technique Imposée :**
    *   **Frontend :** Next.js + TailwindCSS
    *   **Backend & Base de Données :** Firebase (Auth, Firestore, Storage, Functions)
    *   **Hébergement :** Vercel
2.  **Contenu (Prérequis au lancement) :**
    *   **L'équipe projet est responsable de la fourniture d'un lot initial de 50 documents** (sujets d'examens et TDs) pertinents pour la FASEG avant la mise en production. Cette étape est **critique** pour amorcer la plateforme et éviter "l'effet plateforme vide".

---
### 7. Périmètre Explicitement Exclu de la v1.0

*   Système de messagerie entre utilisateurs.
*   Commentaires, notes ou interactions sociales sur les documents.
*   Profils utilisateurs publics ou personnalisables.
*   Intégration d'autres fournisseurs d'authentification (Google, etc.).
*   Back-office d'administration complet (la gestion des rôles se fait manuellement dans Firestore).

---
### 8. Risques Majeurs & Stratégies de Mitigation

| Risque | Stratégie de Mitigation |
| :--- | :--- |
| **1. Légal** | Conflit avec l'administration sur les droits d'auteur. | Approche transparente. CGU claires déchargeant la responsabilité sur l'utilisateur. Focus exclusif sur les sujets d'examens (archives publiques). |
| **2. Participation (Plateforme Vide)** | Personne ne soumet de documents après l'amorçage. | **Amorçage initial avec 50 documents.** Système de crédits rendant la contribution quasi-obligatoire. Communication ciblée auprès des délégués de la FASEG. |
| **3. Qualité (Effet Dépotoir)** | Les soumissions sont de mauvaise qualité (scans illisibles, etc.). | **Processus de modération humain, strict et non-négociable.** Aucune publication sans validation par un "Gardien". Checklist de modération claire. |

---
### 9. Livrables et Jalonnement du Projet

| Phase | Description | Livrables Clés |
| :--- | :--- | :--- |
| **1. Cadrage & Setup** | Validation de la stratégie et mise en place de l'environnement. | **Cahier des Charges (ce document) validé**, Projet Firebase & Vercel créés. |
| **2. Dév. Core (Utilisateur)** | Développement des fonctionnalités visibles par l'étudiant. | Inscription, connexion, dashboard, recherche, upload fonctionnels sur un environnement de pré-production. |
| **3. Dév. Modération & Finalisation** | Développement de l'interface gardien et finalisation. | Interface de modération fonctionnelle, tests de bout en bout. |
| **4. Recette & Déploiement** | Validation, amorçage du contenu et mise en ligne. | Cahier de recette validé, 50 documents importés, **site accessible à l'URL finale**. |

---
### 10. Validation

Ce document a été lu et approuvé par les parties prenantes. Il fait office de contrat de référence pour la suite du projet. Toute demande de modification substantielle devra faire l'objet d'un avenant.