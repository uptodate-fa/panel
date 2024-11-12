import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { DrugPanel } from '@uptodate/types';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SHARED } from '../../../shared';

@Component({
  selector: 'app-drug-panel',
  standalone: true,
  imports: [CommonModule, SHARED, MatCardModule, MatTabsModule, MatExpansionModule, MatToolbarModule],
  templateUrl: './drug-panel.component.html',
  styleUrl: './drug-panel.component.scss',
})
export class DrugPanelComponent {
  @Input() drugPanel: DrugPanel;
}
