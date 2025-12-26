import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() {}

  // Convertir une URL d'image en Base64
   
  async urlToBase64(imageUrl: string): Promise<string> {
    try {
      // Fetch l'image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Convertir le blob en Base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erreur conversion URL → Base64:', error);
      throw error;
    }
  }

  // Convertir un fichier local en Base64
   
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Valider si c'est une URL d'image valide
   
  isValidImageUrl(url: string): boolean {
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
    return imageExtensions.test(url) || url.includes('unsplash') || url.includes('images');
  }
}