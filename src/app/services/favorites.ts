import { Injectable } from '@angular/core';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove
} from '@angular/fire/firestore';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  // Ajouter une recette aux favoris
   
  async addToFavorites(recipeId: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const userRef = doc(this.firestore, `users/${user.uid}`);
    
    // Créer ou mettre à jour le document utilisateur
    try {
      await updateDoc(userRef, {
        favorites: arrayUnion(recipeId)
      });
    } catch (error) {
      // Si le document n'existe pas  le créer
      await setDoc(userRef, {
        email: user.email,
        favorites: [recipeId],
        createdAt: new Date()
      });
    }
    
    console.log(' Ajouté aux favoris');
  }

  // Retirer une recette des favoris
   
  async removeFromFavorites(recipeId: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const userRef = doc(this.firestore, `users/${user.uid}`);
    
    await updateDoc(userRef, {
      favorites: arrayRemove(recipeId)
    });
    
    console.log(' Retiré des favoris');
  }

  // Vérifier si une recette est dans les favoris
   
  async isFavorite(recipeId: string): Promise<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return false;
    
    const favorites = userDoc.data()['favorites'] || [];
    return favorites.includes(recipeId);
  }

  // Récupérer tous les favoris de l'utilisateur
   
  async getFavorites(): Promise<string[]> {
    const user = this.authService.getCurrentUser();
    if (!user) return [];

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return [];
    
    return userDoc.data()['favorites'] || [];
  }

  // Toggle favori ajouter ou retirer
   
  async toggleFavorite(recipeId: string): Promise<boolean> {
    const isFav = await this.isFavorite(recipeId);
    
    if (isFav) {
      await this.removeFromFavorites(recipeId);
      return false;
    } else {
      await this.addToFavorites(recipeId);
      return true;
    }
  }
}