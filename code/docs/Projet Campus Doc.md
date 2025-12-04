---
tags:
  - projet
  - fiche
  - campus
  - document
  - université
---
---
##### 1. Synthèse

**Campus Doc** est une plateforme d'échange d'annales d'examens entre étudiants, conçue pour être fiable, organisée et équitable. Son fonctionnement repose sur un système de crédits de téléchargement pour garantir la réciprocité : pour télécharger, un utilisateur doit d'abord contribuer.

**Devise :** Trouver. Réussir. Contribuer.

---
##### 2. Le Problème

L'accès aux anciens sujets d'examens est un facteur clé de réussite, mais il est aujourd'hui fragmenté et inefficace. Les étudiants font face à :
- **L'incertitude :** Difficulté à savoir ce qui existe et où le trouver.
- **La friction :** Recherche fastidieuse dans des groupes de discussion désorganisés (WhatsApp, Telegram).
- **La dépendance :** Nécessité de connaître les "bonnes personnes" pour obtenir les ressources.
- **La qualité inégale :** Documents illisibles, mal classés ou obsolètes.

---
##### 3. La Solution (MVP v1.0)

Un point d'accès unique, centralisé et modéré, focalisé exclusivement sur les sujets d'examens. La plateforme résout le problème en garantissant :
- **La Centralisation :** Une source unique et organisée pour toutes les filières.
- **La Qualité :** Chaque document est vérifié par une équipe de modération avant publication.
- **L'Équité :** Le moteur du Dépôt est un système de crédits qui incite à la contribution active plutôt qu'au simple consumérisme.

---
##### 4. Vision à Long Terme

Après avoir établi sa fiabilité et son utilité, Le Dépôt a vocation à devenir l'archive académique de référence du campus. Il s'étendra prudemment pour inclure d'autres types de ressources validées (résumés, corrigés de TD) et deviendra un outil pérenne, géré par et pour la communauté étudiante.

---
##### 5. Principes Directeurs (Non-négociables)

1.  **La Réciprocité est la Loi :** Le système de crédits est le cœur du projet. Pas de gratuité sans participation.
2.  **La Qualité avant la Quantité :** Mieux vaut 50 documents fiables que 500 documents douteux. La modération est une fonctionnalité, pas une corvée.
3.  **La Simplicité est la Fonctionnalité Ultime :** Le MVP ne fait qu'une seule chose, mais il la fait parfaitement. Toute complexité est refusée.
4.  **La Légalité n'est pas une Option :** Le projet est mené en transparence vis-à-vis de l'administration universitaire pour garantir sa pérennité.

---
##### 6. Périmètre du MVP v1.0

###### ✅ Fonctionnalités Incluses :
- **Gestion de Compte :** Inscription / Connexion par email.
- **Système de Crédits :** Solde initial, gain par soumission approuvée, coût par téléchargement.
- **Soumission de Documents :** Formulaire de dépôt simple (PDF uniquement) avec métadonnées (`Filière`, `Matière`, `Année`, `Type`).
- **Consultation :** Page de recherche avec filtres sur les métadonnées.
- **Modération :** Interface privée pour les "Gardiens" pour approuver ou rejeter les soumissions.

###### ❌ Fonctionnalités Explicitement Exclues :
- **PAS** d'articles, de blogs ou de contenu éditorial.
- **PAS** de profils utilisateurs publics ou complexes.
- **PAS** de système de points, de badges ou de gamification.
- **PAS** de commentaires, de notes ou d'interactions sociales.
- **PAS** de soumission ou de consultation anonyme.

---
##### 7. Public Cible (v1.0)

Étudiants de Licence et Master, particulièrement ceux abordant un nouveau semestre, une nouvelle filière, ou préparant leurs examens. Ils cherchent une solution fiable pour réduire leur incertitude et optimiser leur temps de révision.

---
##### 8. Facteurs Clés de Succès (Mesures)

- **Adoption :** > 20% des étudiants de la promotion cible sont inscrits après le premier semestre de lancement.
- **Contenu :** > 100 sujets d'examens pertinents et validés sont disponibles après 3 mois.
- **Autonomie :** Le ratio de soumissions approuvées face aux téléchargements prouve que le modèle de crédits est viable et que la plateforme s'auto-alimente.

---
##### 9. Risques Majeurs & Stratégies de Mitigation

1.  **Risque Légal :** Conflit avec l'administration ou les professeurs sur les droits d'auteur.
    - **Mitigation :** Approche proactive et transparente avec l'université. CGU claires déchargeant la responsabilité sur l'utilisateur. Focus exclusif sur les sujets d'examens, généralement considérés comme des archives publiques.
2.  **Risque de Participation (Plateforme Vide) :** Personne ne soumet de documents.
    - **Mitigation :** Amorçage initial avec une base de documents existants. Système de crédits rendant la contribution quasi-obligatoire pour une utilisation continue. Communication ciblée auprès des délégués de filière.
3.  **Risque de Qualité (Effet Dépotoir) :** Les soumissions sont de mauvaise qualité.
    - **Mitigation :** Processus de modération humain, strict et non-négociable. Pas de publication sans validation.

---
##### 10. Stack Technique

| Élément      | Technologie                           | Rôle                                 |
|--------------|---------------------------------------|--------------------------------------|
| **Frontend** | Next.js + TailwindCSS                 | Interface utilisateur et logique client |
| **Backend**  | Firebase (Functions)                  | Logique serveur (ex: attribution crédits) |
| **Base de Données** | Firebase (Firestore)                  | Stockage des métadonnées (users, docs) |
| **Stockage Fichiers** | Firebase (Storage)                    | Hébergement des fichiers PDF         |
| **Authentification** | Firebase (Auth)                       | Gestion des comptes utilisateurs     |
| **Hébergement** | Vercel                                | Déploiement et hébergement du frontend |