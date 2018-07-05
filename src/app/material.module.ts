import { NgModule } from '@angular/core';


import {
  MatButtonModule,
  MatToolbarModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatRadioModule,
  MatCardModule,
  MatMenuModule,
  MatTabsModule,
  MatFormFieldModule,
  MatInputModule,
  MatTableModule,
  MatPaginatorModule,
  MatSelectModule,
  MatStepperModule,
  MatSortModule,
  MatAutocompleteModule,
  MatSnackBarModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTooltipModule,
  MatProgressSpinnerModule
} from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  MatDialogModule,
} from '@angular/material/dialog';
import {MatMomentDateModule} from '@angular/material-moment-adapter';

@NgModule({
  imports: [
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatRadioModule,
    MatCardModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatStepperModule,
    MatSortModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],

  exports: [
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatRadioModule,
    MatCardModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatStepperModule,
    MatSortModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
})
export class MaterialModule { }
