import { Component, inject, Input, signal } from '@angular/core';
import { SHARED } from '../../../shared';
import { MatCardModule } from '@angular/material/card';
import { Content, SearchResult } from '@uptodate/types';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-search-result-card',
  standalone: true,
  imports: [CommonModule, SHARED, MatCardModule, MatMenuModule],
  templateUrl: './search-result-card.component.html',
  styleUrl: './search-result-card.component.scss',
})
export class SearchResultCardComponent {
  private http = inject(HttpClient);

  @Input() result: SearchResult;
  isMouseOver = signal(false);
  
  outlineQuery = injectQuery(() => ({
    queryKey: ['outline', this.result.id],
    queryFn: () =>
      lastValueFrom(
        this.http.get<Content>(
          `/api/contents/outline/${this.result.id}`
        )
      ),
    enabled: this.isMouseOver(),
    staleTime: Infinity,
  }));
}
