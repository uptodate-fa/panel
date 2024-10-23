import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatListModule} from '@angular/material/list';

@Component({
  selector: 'app-res-table',
  standalone: true,
  imports: [CommonModule, MatListModule],
  templateUrl: './res-table.component.html',
  styleUrl: './res-table.component.scss',
})
export class ResTableComponent {}
