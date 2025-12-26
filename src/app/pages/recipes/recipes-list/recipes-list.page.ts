import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../../services/recipe';

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
  ingredients: any[];
  steps: any[];
}

@Component({
  selector: 'app-recipes-list',
  templateUrl: './recipes-list.page.html',
  styleUrls: ['./recipes-list.page.scss'],
  standalone : false
})
export class RecipesListPage implements OnInit {
  allRecipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  loading = true;

  // Recherche
  searchTerm: string = '';

  // Filtres
  selectedCategory: string = 'all';
  selectedDifficulty: string = 'all';
  
  // Tri
  sortBy: string = 'name'; // name/time/ difficulty

  // Options de filtre
  categories = [
    { value: 'all', label: 'Toutes' },
    { value: 'Entrées', label: 'Entrées' },
    { value: 'Plats principaux', label: 'Plats principaux' },
    { value: 'Desserts', label: 'Desserts' },
    { value: 'Boissons', label: 'Boissons' }
  ];

  difficulties = [
    { value: 'all', label: 'Toutes' },
    { value: 'easy', label: 'Facile' },
    { value: 'medium', label: 'Moyen' },
    { value: 'hard', label: 'Difficile' }
  ];

  sortOptions = [
    { value: 'name', label: 'Nom (A-Z)' },
    { value: 'time', label: 'Temps de préparation' },
    { value: 'difficulty', label: 'Difficulté' }
  ];

  // Affichage
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadRecipes();
    this.checkQueryParams();
  }

  checkQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
    });
  }

  loadRecipes() {
    this.recipeService.getAllRecipes().subscribe({
      next: (recipes: any) => {
        this.allRecipes = recipes;
        this.applyFilters();
        this.loading = false;
        console.log(' Recettes chargées:', recipes.length);
      },
      error: (error) => {
        console.error(' Erreur:', error);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let results = [...this.allRecipes];

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      results = results.filter(recipe =>
        recipe.title.toLowerCase().includes(search) ||
        recipe.description.toLowerCase().includes(search) ||
        recipe.category.toLowerCase().includes(search)
      );
    }

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      results = results.filter(recipe => recipe.category === this.selectedCategory);
    }

    // Filtre par difficulté
    if (this.selectedDifficulty !== 'all') {
      results = results.filter(recipe => recipe.difficulty === this.selectedDifficulty);
    }

    // Tri
    results = this.sortRecipes(results);

    this.filteredRecipes = results;
    console.log('🔍 Recettes filtrées:', results.length);
  }

  sortRecipes(recipes: Recipe[]): Recipe[] {
    switch (this.sortBy) {
      case 'name':
        return recipes.sort((a, b) => a.title.localeCompare(b.title));
      
      case 'time':
        return recipes.sort((a, b) => 
          (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime)
        );
      
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return recipes.sort((a, b) => 
          difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
        );
      
      default:
        return recipes;
    }
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.applyFilters();
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.applyFilters();
  }

  onDifficultyChange(event: any) {
    this.selectedDifficulty = event.detail.value;
    this.applyFilters();
  }

  onSortChange(event: any) {
    this.sortBy = event.detail.value;
    this.applyFilters();
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedDifficulty = 'all';
    this.sortBy = 'name';
    this.applyFilters();
  }

  openRecipe(id: string) {
    this.router.navigate(['/recipe-detail', id]);
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
}