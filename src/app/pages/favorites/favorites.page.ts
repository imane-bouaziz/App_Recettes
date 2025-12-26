import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FavoritesService } from '../../services/favorites';
import { RecipeService } from '../../services/recipe';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'], 
  standalone : false ,
})
export class FavoritesPage implements OnInit {
  favoriteRecipes: any[] = [];
  loading = true;

  constructor(
    private favoritesService: FavoritesService,
    private recipeService: RecipeService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadFavorites();
  }

  async ionViewWillEnter() {
    await this.loadFavorites();
  }

  async loadFavorites() {
    this.loading = true;
    
    try {
      const favoriteIds = await this.favoritesService.getFavorites();
      
      if (favoriteIds.length === 0) {
        this.favoriteRecipes = [];
        this.loading = false;
        return;
      }

      const recipes: any[] = [];
      let loadedCount = 0;
      
      for (const id of favoriteIds) {
        this.recipeService.getRecipeById(id).subscribe({
          next: (recipe) => {
            recipes.push(recipe);
            loadedCount++;
            
            if (loadedCount === favoriteIds.length) {
              this.favoriteRecipes = recipes;
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Erreur chargement recette:', error);
            loadedCount++;
            
            if (loadedCount === favoriteIds.length) {
              this.favoriteRecipes = recipes;
              this.loading = false;
            }
          }
        });
      }

      console.log(' Favoris chargés:', recipes);
    } catch (error) {
      console.error(' Erreur:', error);
      this.loading = false;
    }
  }

  openRecipe(id: string) {
    this.router.navigate(['/recipe-detail', id]);
  }
}