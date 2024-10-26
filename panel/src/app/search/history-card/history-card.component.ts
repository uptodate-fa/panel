import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED } from '../../shared';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ContentHistory } from '@uptodate/types';

@Component({
  selector: 'app-history-card',
  standalone: true,
  imports: [CommonModule, SHARED, MatCardModule, MatListModule, MatTabsModule],
  templateUrl: './history-card.component.html',
  styleUrl: './history-card.component.scss',
})
export class HistoryCardComponent {
  private http = inject(HttpClient);

  historyQuery = injectQuery(() => ({
    queryKey: ['history'],
    queryFn: () =>
      lastValueFrom(this.http.get<ContentHistory[]>(`/api/contents/history`)),
  }));
}
