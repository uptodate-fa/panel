import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card'
import { MatTabsModule } from '@angular/material/tabs'

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTabsModule],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
})
export class ArticleListComponent {}
