import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { MaterialModule } from './material/material.module';
import { ConfigPanelComponent } from './config-panel/config-panel.component';
import { ArrayDisplayComponent } from './array-display/array-display.component';
import { ReferenceBarComponent } from './reference-bar/reference-bar.component';
import { QsModalComponent } from './qs-modal/qs-modal.component';
import { CodeModalComponent } from './code-modal/code-modal.component';
import { ClipboardModule } from 'ngx-clipboard';
import { SnackBarCodeCopiedComponent } from './snack-bar-code-copied/snack-bar-code-copied.component';
import { UserModeWarningComponent } from './user-mode-warning/user-mode-warning.component';
import { BubbleSModalComponent } from './bubble-s-modal/bubble-s-modal.component';
import { HeapsModalComponent } from './heaps-modal/heaps-modal.component';
import { MergesModalComponent } from './merges-modal/merges-modal.component';
import { SelectionSModalComponent } from './selection-s-modal/selection-s-modal.component';
import { InsertionSModalComponent } from './insertion-s-modal/insertion-s-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    ConfigPanelComponent,
    ArrayDisplayComponent,
    ReferenceBarComponent,
    QsModalComponent,
    CodeModalComponent,
    SnackBarCodeCopiedComponent,
    UserModeWarningComponent,
    BubbleSModalComponent,
    HeapsModalComponent,
    MergesModalComponent,
    SelectionSModalComponent,
    InsertionSModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    FontAwesomeModule,
    HttpClientModule,
    ClipboardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
