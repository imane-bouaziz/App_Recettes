import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../services/recipe';
import { AuthService } from '../services/auth';
import { ActionSheetController, AlertController } from '@ionic/angular';

export interface Recipe {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  ingredients: any[];
  steps: any[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone : false ,
})
export class HomePage implements OnInit {
  recipes: Recipe[] = [];
  allRecipesCount: number = 0;
  categories = [
    { name: 'Entrées', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' },
    { name: 'Plats principaux', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' },
    { name: 'Desserts', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400' },
    { name: 'Boissons', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' }
  ];
  
  loading = true;
  currentUser: any = null;

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadRecipes();
    this.checkAuthStatus();
  }

  loadRecipes() {
    this.recipeService.getAllRecipes().subscribe({
      next: (recipes: any) => {
        this.allRecipesCount = recipes.length;
        this.recipes = recipes.slice(0, 6);
        this.loading = false;
        console.log(' Recettes chargées:', this.recipes);
      },
      error: (error) => {
        console.error(' Erreur de chargement:', error);
        this.loading = false;
      }
    });
  }

  checkAuthStatus() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      console.log('👤 Utilisateur:', user);
    });
  }

  openRecipe(id: string) {
    this.router.navigate(['/recipe-detail', id]);
  }

  openCategory(categoryName: string) {
    this.router.navigate(['/recipes-list'], { 
      queryParams: { category: categoryName } 
    });
  }

  goToAddRecipe() {
    this.router.navigate(['/recipe-edit']);
  }

  goToFavorites() {
    if (!this.currentUser) {
      this.showLoginRequired();
      return;
    }
    this.router.navigate(['/favorites']);
  }
  goToSearch() {
  this.router.navigate(['/recipes-list']);
}

  async openAuthMenu() {
    if (this.currentUser) {
      // Utilisateur connecté pour Afficher menu de déconnexion
      const actionSheet = await this.actionSheetController.create({
        header: this.currentUser.email,
        buttons: [
          {
            text: 'Mon profil',
            icon: 'person-outline',
            handler: () => {
            this.router.navigate(['/profile']);  
          }
          },
          {
            text: 'Mes favoris',
            icon: 'heart-outline',
            handler: () => {
              this.goToFavorites();
            }
          },
          {
            text: 'Déconnexion',
            icon: 'log-out-outline',
            role: 'destructive',
            handler: () => {
              this.logout();
            }
          },
          {
            text: 'Annuler',
            icon: 'close',
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    } else {
      // User non connecté alors Afficher menu de connexion
      const actionSheet = await this.actionSheetController.create({
        header: 'Authentification',
        buttons: [
          {
            text: 'Se connecter',
            icon: 'log-in-outline',
            handler: () => {
              this.showLoginPrompt();
            }
          },
          {
            text: 'S\'inscrire',
            icon: 'person-add-outline',
            handler: () => {
              this.showRegisterPrompt();
            }
          },
          {
            text: 'Annuler',
            icon: 'close',
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    }
  }

  async showLoginPrompt() {
    const alert = await this.alertController.create({
      header: 'Connexion',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Mot de passe'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Se connecter',
          handler: (data) => {
            this.login(data.email, data.password);
          }
        }
      ]
    });
    await alert.present();
  }

  async showRegisterPrompt() {
    const alert = await this.alertController.create({
      header: 'Inscription',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Mot de passe'
        },
        {
          name: 'confirmPassword',
          type: 'password',
          placeholder: 'Confirmer le mot de passe'
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'S\'inscrire',
          handler: (data) => {
            if (data.password !== data.confirmPassword) {
              this.showError('Les mots de passe ne correspondent pas');
              return false;
            }
            this.register(data.email, data.password);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async login(email: string, password: string) {
    try {
      await this.authService.login(email, password);
      const alert = await this.alertController.create({
        header: 'Succès',
        message: 'Connexion réussie !',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error: any) {
      this.showError(error.message || 'Erreur de connexion');
    }
  }

  async register(email: string, password: string) {
    try {
      await this.authService.register(email, password);
      const alert = await this.alertController.create({
        header: 'Succès',
        message: 'Inscription réussie !',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error: any) {
      this.showError(error.message || 'Erreur d\'inscription');
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      const alert = await this.alertController.create({
        header: 'Déconnexion',
        message: 'Vous avez été déconnecté',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error: any) {
      this.showError(error.message || 'Erreur de déconnexion');
    }
  }

  async showLoginRequired() {
    const alert = await this.alertController.create({
      header: 'Connexion requise',
      message: 'Vous devez être connecté pour accéder aux favoris',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Se connecter',
          handler: () => {
            this.showLoginPrompt();
          }
        }
      ]
    });
    await alert.present();
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Erreur',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
