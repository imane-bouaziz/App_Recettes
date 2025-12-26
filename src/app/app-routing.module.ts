import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'recipes-list',
    loadChildren: () => import('./pages/recipes/recipes-list/recipes-list.module').then(m => m.RecipesListPageModule)
  },
  {
    path: 'recipe-detail/:id',
    loadChildren: () => import('./pages/recipes/recipe-detail/recipe-detail.module').then(m => m.RecipeDetailPageModule)
  },
  {
    path: 'recipe-edit',  // ici ROUTE POUR CRÉER UNE NOUVELLE RECETTE
    loadChildren: () => import('./pages/recipes/recipe-edit/recipe-edit.module').then(m => m.RecipeEditPageModule)
  },
  {
    path: 'recipe-edit/:id',  //ici ROUTE POUR MODIFIER UNE RECETTE EXISTANTE
    loadChildren: () => import('./pages/recipes/recipe-edit/recipe-edit.module').then(m => m.RecipeEditPageModule)
  },
  {
    path: 'favorites',
    loadChildren: () => import('./pages/favorites/favorites.module').then(m => m.FavoritesPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'profile',  
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)
  }
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

