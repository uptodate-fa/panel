import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SHARED } from '../../../shared';
import { DrugInformationDialogComponent } from '../drug-information-dialog/drug-information-dialog.component';
import { DrugInformationResult } from './drug-information.types';

@Component({
  selector: 'app-drug-information-panel',
  standalone: true,
  imports: [CommonModule, SHARED, MatCardModule, MatToolbarModule],
  templateUrl: './drug-information-panel.component.html',
  styleUrl: './drug-information-panel.component.scss',
})
export class DrugInformationPanelComponent {
  private readonly dialog = inject(MatDialog);

  @Input() drugs: DrugInformationResult[] | null = [];

  openDrug(item: DrugInformationResult) {
    this.dialog.open(DrugInformationDialogComponent, {
      data: { drug: item },
      maxWidth: '98vw',
      width: '1280px',
      autoFocus: false,
    });
  }
}
