import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED } from '../../shared';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import {
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
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
  private queryClient = inject(QueryClient);
  private http = inject(HttpClient);

  historyQuery = injectQuery(() => ({
    queryKey: ['history'],
    queryFn: () =>
      lastValueFrom(this.http.get<ContentHistory[]>(`/api/contents/history`)),
    refetchOnWindowFocus: false,
  }));

  removeMutation = injectMutation(() => ({
    mutationFn: (contentId: string) =>
      lastValueFrom(
        this.http.delete<void>(`/api/contents/history/${contentId}`),
      ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({
        queryKey: ['history'],
      });
    },
  }));

  categorizeByDate(data?: ContentHistory[]) {
    return (data ?? []).reduce((acc: Record<string, ContentHistory[]> , item) => {
      const date = new Date(item.updatedAt).toISOString().split('T')[0]; // "2025-06-02"

      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
  }

  formatedDate(inDate: string) {
    const date = new Date(inDate);
    const year = date.getFullYear();
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'long' }); // "June"

    return `${month} ${day},${year}`;
  }

  protected readonly Object = Object;
}
