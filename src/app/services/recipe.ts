import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData,  doc, docData, addDoc, updateDoc, deleteDoc, query, where,
orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private recipesCollection = collection(this.firestore, 'recipes');

  constructor(private firestore: Firestore) {}

  // Récupérer toutes les recettes
  getAllRecipes(): Observable<Recipe[]> {
    return collectionData(this.recipesCollection, { idField: 'id' }) as Observable<Recipe[]>;
  }

  // Récupérer une recette par ID
  getRecipeById(id: string): Observable<Recipe> {
    const recipeRef = doc(this.firestore, `recipes/${id}`);
    return docData(recipeRef, { idField: 'id' }) as Observable<Recipe>;
  }

  // Récupérer recettes par catégorie
  getRecipesByCategory(category: string): Observable<Recipe[]> {
    const q = query(
      this.recipesCollection, 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Recipe[]>;
  }

  // Ajouter une recette
  async addRecipe(recipe: Recipe): Promise<any> {
    const recipeData = {
      ...recipe,
      createdAt: Timestamp.now()
    };
    return await addDoc(this.recipesCollection, recipeData);
  }

  // Modifier une recette
  async updateRecipe(id: string, recipe: Partial<Recipe>): Promise<void> {
    const recipeRef = doc(this.firestore, `recipes/${id}`);
    return await updateDoc(recipeRef, recipe);
  }

  // Supprimer une recette
  async deleteRecipe(id: string): Promise<void> {
    const recipeRef = doc(this.firestore, `recipes/${id}`);
    return await deleteDoc(recipeRef);
  }

  // Rechercher des recettes
  searchRecipes(searchTerm: string): Observable<Recipe[]> {
   
    return this.getAllRecipes();
  }
}