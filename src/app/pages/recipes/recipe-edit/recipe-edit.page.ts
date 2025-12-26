import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../../services/recipe';
import { AlertController, LoadingController } from '@ionic/angular';

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
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.page.html',
  styleUrls: ['./recipe-edit.page.scss'],
  standalone: false,
})
export class RecipeEditPage implements OnInit {
  recipe: Recipe = {
    title: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'easy',
    category: 'Plats principaux',
    ingredients: [{ name: '', quantity: '' }],
    steps: [{ order: 1, description: '' }]
  };

  isEditMode = false;
  recipeId: string | null = null;
  loading = false;

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
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.recipeId = this.route.snapshot.paramMap.get('id');
    
    if (this.recipeId) {
      this.isEditMode = true;
      this.loadRecipe();
    }
  }

  loadRecipe() {
    if (!this.recipeId) return;
    
    this.recipeService.getRecipeById(this.recipeId).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        console.log(' Recette chargée pour édition:', recipe);
      },
      error: (error) => {
        console.error(' Erreur chargement:', error);
      }
    });
  }

  // ========== UPLOAD D'IMAGE ==========
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

        // Convertir en Base64
        const base64 = await this.fileToBase64(file);
        
        // Mettre à jour l'image
        this.recipe.imageUrl = base64;

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

  // ========== GESTION DES INGRÉDIENTS ==========
  addIngredient() {
    this.recipe.ingredients.push({ name: '', quantity: '' });
  }

  removeIngredient(index: number) {
    if (this.recipe.ingredients.length > 1) {
      this.recipe.ingredients.splice(index, 1);
    }
  }

  // ========== GESTION DES ÉTAPES ==========
  addStep() {
    const newOrder = this.recipe.steps.length + 1;
    this.recipe.steps.push({ order: newOrder, description: '' });
  }

  removeStep(index: number) {
    if (this.recipe.steps.length > 1) {
      this.recipe.steps.splice(index, 1);
      this.recipe.steps.forEach((step, i) => {
        step.order = i + 1;
      });
    }
  }

  // ========== VALIDATION ==========
  isFormValid(): boolean {
    if (!this.recipe.title || !this.recipe.description) {
      return false;
    }

    const hasValidIngredient = this.recipe.ingredients.some(
      ing => ing.name && ing.quantity
    );

    const hasValidStep = this.recipe.steps.some(
      step => step.description
    );

    return hasValidIngredient && hasValidStep;
  }

  // ========== SAUVEGARDE ==========
  async saveRecipe() {
    if (!this.isFormValid()) {
      const alert = await this.alertController.create({
        header: 'Formulaire incomplet',
        message: 'Veuillez remplir au minimum le titre, la description, un ingrédient et une étape.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.loading = true;

    const cleanRecipe = {
      ...this.recipe,
      ingredients: this.recipe.ingredients.filter(ing => ing.name && ing.quantity),
      steps: this.recipe.steps.filter(step => step.description)
    };

    try {
      if (this.isEditMode && this.recipeId) {
        await this.recipeService.updateRecipe(this.recipeId, cleanRecipe);
        console.log(' Recette mise à jour');
      } else {
        await this.recipeService.addRecipe(cleanRecipe);
        console.log(' Recette créée');
      }

      const alert = await this.alertController.create({
        header: 'Succès',
        message: this.isEditMode ? 'Recette mise à jour !' : 'Recette créée !',
        buttons: ['OK']
      });
      await alert.present();

      this.router.navigate(['/home']);
    } catch (error) {
      console.error(' Erreur sauvegarde:', error);
      
      const alert = await this.alertController.create({
        header: 'Erreur',
        message: 'Impossible de sauvegarder la recette.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.loading = false;
    }
  }

  cancel() {
    this.router.navigate(['/home']);
  }
}