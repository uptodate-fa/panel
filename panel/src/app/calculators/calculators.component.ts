import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SHARED } from '../shared';

@Component({
  selector: 'app-calculators',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, SHARED],
  templateUrl: './calculators.component.html',
  styleUrl: './calculators.component.scss',
})
export class CalculatorsComponent {}
