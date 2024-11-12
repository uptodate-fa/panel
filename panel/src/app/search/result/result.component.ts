import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { SearchResult } from '@uptodate/types';
import { ActivatedRoute } from '@angular/router';
import { SHARED } from '../../shared';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SearchResultCardComponent } from './search-result-card/search-result-card.component';
import { DrugPanelComponent } from "./drug-panel/drug-panel.component";
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatProgressSpinner,
    SHARED,
    SearchResultCardComponent,
    DrugPanelComponent,
    MatSidenavModule,
],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss',
})
export class ResultComponent {
  query = signal<string>('');
  selectedTab = signal<number>(0);

  resultQuery = injectQuery(() => ({
    queryKey: ['search', this.query(), this.selectedTab()],
    queryFn: () =>
      lastValueFrom(
        this.http.get<SearchResult>(`/api/contents/search/${this.query()}`, {
          params: { sp: this.selectedTab() },
        }),
      ),
    enabled: !!this.query(),
    staleTime: Infinity,
  }));

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe((params) => {
      this.query.set(params['query']);
    });
  }
}
