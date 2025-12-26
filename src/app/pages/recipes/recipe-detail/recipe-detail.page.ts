import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../../services/recipe';
import { FavoritesService } from '../../../services/favorites';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

interface Ingredient {
  name: string;
  quantity: string;
}

interface Step {
  order: number;
  description: string;
}

interface Recipe {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  ingredients: Ingredient[];
  steps: Step[];
}

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.page.html',
  styleUrls: ['./recipe-detail.page.scss'],
  standalone : false ,
})
export class RecipeDetailPage implements OnInit {
  recipe: Recipe | null = null;
  editedRecipe: Recipe | null = null;
  loading = true;
  recipeId: string = '';
  editMode = false;
  saving = false;
  isFavorite = false;

  categories = ['Entrées', 'Plats principaux', 'Desserts', 'Boissons'];
  difficulties = [
    { value: 'easy', label: 'Facile' },
    { value: 'medium', label: 'Moyen' },
    { value: 'hard', label: 'Difficile' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService,
    private favoritesService: FavoritesService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.recipeId = this.route.snapshot.paramMap.get('id') || '';
    if (this.recipeId) {
      this.loadRecipe();
    }
  }

  loadRecipe() {
    this.recipeService.getRecipeById(this.recipeId).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        this.loading = false;
        this.checkFavoriteStatus();
        console.log(' Recette chargée:', recipe);
      },
      error: (error) => {
        console.error(' Erreur:', error);
        this.loading = false;
      }
    });
  }

  async checkFavoriteStatus() {
    if (this.recipeId) {
      this.isFavorite = await this.favoritesService.isFavorite(this.recipeId);
    }
  }

  async toggleFavorite() {
  try {
    this.isFavorite = await this.favoritesService.toggleFavorite(this.recipeId);
    
    const message = this.isFavorite 
      ? 'Ajouté aux favoris !' 
      : 'Retiré des favoris';
    
    // Utiliser ToastController ici
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: this.isFavorite ? 'success' : 'medium',
      icon: this.isFavorite ? 'heart' : 'heart-outline'
    });
    await toast.present();
  } catch (error: any) {
    if (error.message === 'Utilisateur non connecté') {
      const alert = await this.alertController.create({
        header: 'Connexion requise',
        message: 'Vous devez être connecté pour ajouter des favoris',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}

  enableEditMode() {
    this.editMode = true;
    this.editedRecipe = JSON.parse(JSON.stringify(this.recipe));
    console.log('✏️ Mode édition activé');
  }

  cancelEdit() {
    this.editMode = false;
    this.editedRecipe = null;
    console.log(' Édition annulée');
  }

  async saveEdit() {
    if (!this.editedRecipe) return;

    if (!this.editedRecipe.title || !this.editedRecipe.description) {
      const alert = await this.alertController.create({
        header: 'Champs requis',
        message: 'Le titre et la description sont obligatoires.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.saving = true;

    try {
      const cleanRecipe = {
        ...this.editedRecipe,
        ingredients: this.editedRecipe.ingredients.filter(ing => ing.name && ing.quantity),
        steps: this.editedRecipe.steps.filter(step => step.description)
      };

      await this.recipeService.updateRecipe(this.recipeId, cleanRecipe);
      
      this.recipe = cleanRecipe;
      this.editMode = false;
      this.editedRecipe = null;
      
      console.log(' Recette mise à jour');
      
      const alert = await this.alertController.create({
        header: 'Succès',
        message: 'Recette mise à jour avec succès !',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      console.error(' Erreur sauvegarde:', error);
      
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Impossible de sauvegarder les modifications.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.saving = false;
    }
  }

  async selectImageFromDevice() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const loading = await this.loadingController.create({
          message: 'Traitement de l\'image...'
        });
        await loading.present();

        const base64 = await this.fileToBase64(file);
        
        if (this.editedRecipe) {
          this.editedRecipe.imageUrl = base64;
        }

        await loading.dismiss();
        console.log(' Image uploadée et convertie en Base64');
      } catch (error) {
        console.error(' Erreur upload:', error);
        const alert = await this.alertController.create({
          header: 'Erreur',
          message: 'Impossible de charger l\'image',
          buttons: ['OK']
        });
        await alert.present();
      }
    };
    
    input.click();
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Erreur de lecture du fichier'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  addIngredient() {
    if (!this.editedRecipe) return;
    this.editedRecipe.ingredients.push({ name: '', quantity: '' });
  }

  removeIngredient(index: number) {
    if (!this.editedRecipe) return;
    this.editedRecipe.ingredients.splice(index, 1);
  }

  addStep() {
    if (!this.editedRecipe) return;
    const order = this.editedRecipe.steps.length + 1;
    this.editedRecipe.steps.push({ order, description: '' });
  }

  removeStep(index: number) {
    if (!this.editedRecipe) return;
    this.editedRecipe.steps.splice(index, 1);
    this.editedRecipe.steps.forEach((step, i) => {
      step.order = i + 1;
    });
  }

  async deleteRecipe() {
    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: 'Voulez-vous vraiment supprimer cette recette ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.recipeService.deleteRecipe(this.recipeId);
              console.log(' Recette supprimée');
              this.router.navigate(['/home']);
            } catch (error) {
              console.error(' Erreur suppression:', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  getDifficultyLabel(difficulty: string): string {
    const labels: any = {
      'easy': 'Facile',
      'medium': 'Moyen',
      'hard': 'Difficile'
    };
    return labels[difficulty] || difficulty;
  }

  getDifficultyColor(difficulty: string): string {
    const colors: any = {
      'easy': 'success',
      'medium': 'warning',
      'hard': 'danger'
    };
    return colors[difficulty] || 'medium';
  }
  printRecipe() {
  if (!this.recipe) return;

  // Créer une nouvelle fenêtre pour l'impression
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Veuillez autoriser les pop-ups pour imprimer');
    return;
  }

  // Générer le HTML d'impression
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${this.recipe.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #3880ff;
          border-bottom: 2px solid #3880ff;
          padding-bottom: 10px;
        }
        h2 {
          color: #333;
          margin-top: 30px;
        }
        .meta {
          display: flex;
          gap: 20px;
          margin: 20px 0;
          padding: 15px;
          background: #f0f0f0;
          border-radius: 8px;
        }
        .meta-item {
          font-weight: bold;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        .ingredient {
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        .step {
          margin: 15px 0;
          padding: 15px;
          background: #f9f9f9;
          border-left: 4px solid #3880ff;
        }
        .step-number {
          font-weight: bold;
          color: #3880ff;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <h1>${this.recipe.title}</h1>
      <img src="${this.recipe.imageUrl}" alt="${this.recipe.title}" />
      
      <div class="meta">
        <div class="meta-item">⏱️ ${this.recipe.prepTime + this.recipe.cookTime} min</div>
        <div class="meta-item">👥 ${this.recipe.servings} personnes</div>
        <div class="meta-item">📊 ${this.getDifficultyLabel(this.recipe.difficulty)}</div>
      </div>

      <p>${this.recipe.description}</p>

      <h2>🛒 Ingrédients</h2>
      ${this.recipe.ingredients.map(ing => `
        <div class="ingredient">
          <strong>${ing.name}</strong> - ${ing.quantity}
        </div>
      `).join('')}

      <h2>👨‍🍳 Préparation</h2>
      ${this.recipe.steps.map(step => `
        <div class="step">
          <span class="step-number">Étape ${step.order}:</span>
          <p>${step.description}</p>
        </div>
      `).join('')}

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
}
}