import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectorComponent } from './selector/selector.component';
import { ResultComponent } from './result/result.component';
import { SHARED } from '../shared';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { DrugInteractionsService } from './drug-interactions.service';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-drug-interactions',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    SelectorComponent,
    ResultComponent,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
  ],
  templateUrl: './drug-interactions.component.html',
  styleUrl: './drug-interactions.component.scss',
})
export class DrugInteractionsComponent {
  readonly interactionsService = inject(DrugInteractionsService);
  isDrugSelected = computed(() => {
    return this.interactionsService.items()?.length > 0;
  });
}
