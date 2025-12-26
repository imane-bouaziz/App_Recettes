# Cookidoo by imane – Application de gestion de recettes

# Objectif de l’application
Cookidoo by imane est une application permettant aux utilisateurs de créer, gérer et organiser leurs recettes de cuisine personnelles, avec un système de favoris et de recherche avancée.

# Vidéo de démonstration : 
ici dans la racine du Projet

# Fonctionnalités principales :

## Authentification
- Inscription / Connexion / Déconnexion
- Gestion de session via Firebase Authentication
## Gestion des recettes (CRUD)
- Création de recettes (titre, description, image, catégorie, difficulté, temps, ingrédients, étapes)
- Consultation détaillée des recettes
- Modification et suppression avec confirmation
## Recherche et filtres
- Recherche par nom
- Filtrage par catégorie et difficulté
- Tri (nom, temps, difficulté)
- Vue grille / liste
## Favoris
- Ajout / suppression des recettes favorites
- Page dédiée aux favoris
- Synchronisation en temps réel avec Firestore
## Autres fonctionnalités
- Impression des recettes
- Notifications (toast)
- Page d'aide et Page À propos

# Technologies utilisées

## Frontend
- Ionic Framework
- Angular
- TypeScript
- SCSS
## Backend 'Firebase'
- Authentication
- Firestore Database

# Installation et exécution

## Prérequis
- Node.js   et 
- Ionic CLI  

## Comment lancer le projet

- node --version
- npm --version
- npm install -g @ionic/cli
- git clone [URL_DU_REPO] pour cloner ou télécharger le projet
- cd App_Recettes
- npm install pour installer toutes les dépendances nécessaires (Angular, Ionic, Firebase, etc.)
- # Configuration Firebase : 

- Créer un projet Firebase 
- Activer l'authentification 
- Créer la base Firestore 
- Configurer les règles de sécurité 
- Récupérer la configuration Firebase 
- Configurer le projet (Ouvrez le fichier src/environments/environment.ts et remplacez la configuration Firebase par la vôtre )
- Lancer l'application : ionic serve

# Structure de la base de données Firestore
## Collection recipes :
{
  "id": "auto-generated",
  "title": "Pizza Margherita",
  "description": "Pizza italienne classique",
  "imageUrl": "data:image/jpeg;base64,...",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "easy",
  "category": "Plats principaux",
  "ingredients": [
    {"name": "Farine", "quantity": "500g"}
  ],
  "steps": [
    {"order": 1, "description": "Préparer la pâte..."}
  ],
  "createdAt": "2025-12-26T10:30:00Z"
}
## Collection users :
{
  "userId": "firebase-auth-uid",
  "email": "user@example.com",
  "favorites": ["recipeId1", "recipeId2"],
  "createdAt": "2025-12-26T10:30:00Z"
}
## Collection categories :
{"imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
"name": "Plats principaux",
"order": 2
}

