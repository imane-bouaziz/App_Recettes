import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecipeEditPageRoutingModule } from './recipe-edit-routing.module';

import { RecipeEditPage } from './recipe-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecipeEditPageRoutingModule
  ],
  declarations: [RecipeEditPage]
})
export class RecipeEditPageModule {}
