import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SHARED } from '../shared';

@Component({
  selector: 'app-lab-interpretation',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, SHARED],
  templateUrl: './lab-interpretation.component.html',
  styleUrl: './lab-interpretation.component.scss',
})
export class LabInterpretationComponent {}
