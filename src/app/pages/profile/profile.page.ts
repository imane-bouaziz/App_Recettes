import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { RecipeService } from '../../services/recipe';
import { FavoritesService } from '../../services/favorites';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone : false,
})
export class ProfilePage implements OnInit {
  currentUser: any = null;
  userStats = {
    recipesCount: 0,
    favoritesCount: 0,
    memberSince: ''
  };
  loading = true;

  constructor(
    private authService: AuthService,
    private recipeService: RecipeService,
    private favoritesService: FavoritesService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await this.loadUserData();
  }

  async loadUserData() {
    this.authService.user$.subscribe(async user => {
      this.currentUser = user;
      
      if (user) {
        // Compter les recettes de l'utilisateur
        this.recipeService.getAllRecipes().subscribe(recipes => {
          this.userStats.recipesCount = recipes.length;
        });

        // Compter les favoris
        const favorites = await this.favoritesService.getFavorites();
        this.userStats.favoritesCount = favorites.length;

        // Date d'inscription (simulée pour le moment) long 2025
        this.userStats.memberSince = new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long'
        });
      }
      
      this.loading = false;
    });
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Déconnexion',
          role: 'destructive',
          handler: async () => {
            try {
              await this.authService.logout();
              this.router.navigate(['/home']);
            } catch (error) {
              console.error('Erreur déconnexion:', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  goToFavorites() {
    this.router.navigate(['/favorites']);
  }

  goToMyRecipes() {
    this.router.navigate(['/recipes-list']);
  }
  async showHelp() {
  const alert = await this.alertController.create({
    header: ' Aide',
    message: `
      
      Cookidoo permet d’ajouter des recettes, de les rechercher facilement, de les enregistrer en favoris ❤️, de les modifier ✏️ et de les imprimer 🖨️.
Besoin d’aide ? support@cookidoo.com
    `,
    buttons: ['Compris !']
  });
  await alert.present();
}

async showAbout() {
  const message = [
    'votre compagnon culinaire est une application développée par Imane en décembre 2025. L’application est réalisée avec Ionic et Angular, en s’appuyant sur Firebase (Auth et Firestore). © 2025 Cookidoo - Made with ❤️'
  ].join('');

  const alert = await this.alertController.create({
    header: 'À propos ',
    message: message,
    buttons: ['Fermer']
  });
  await alert.present();
}
}
