import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectorComponent } from './selector/selector.component';
import { ResultComponent } from './result/result.component';
import { SHARED } from '../shared';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-drug-interactions',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    SelectorComponent,
    ResultComponent,
    MatSidenavModule,
  ],
  templateUrl: './drug-interactions.component.html',
  styleUrl: './drug-interactions.component.scss',
})
export class DrugInteractionsComponent {}
