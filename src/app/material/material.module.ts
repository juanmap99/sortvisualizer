import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatSliderModule} from '@angular/material/slider';
import {MatCardModule} from '@angular/material/card';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatMenuModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSliderModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule
  ],
  exports:[
    MatToolbarModule,
    MatMenuModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSliderModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class MaterialModule { }
