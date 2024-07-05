import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED } from '../shared';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, SHARED, MatFormFieldModule, MatInputModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {}
