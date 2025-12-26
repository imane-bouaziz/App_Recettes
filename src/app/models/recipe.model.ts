export interface Recipe {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number; // en minutes
  cookTime: number; // en minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  ingredients: Ingredient[];
  steps: Step[];
  createdAt?: Date;
  userId?: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Step {
  order: number;
  description: string;
  imageUrl?: string;
}

export interface Category {
  id?: string;
  name: string;
  imageUrl: string;
  order: number;
}