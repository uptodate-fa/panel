import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient } from '@angular/common/http';
import { SearchResult } from '@uptodate/types';
import { ActivatedRoute } from '@angular/router';
import { SHARED } from '../../shared';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTabsModule, SHARED],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss',
})
export class ResultComponent {
  query = signal<string>('');
  results = computed(() => {
    return this.search(this.query());
  });
  constructor(private http: HttpClient, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      this.query.set(params['query']);
    });

    // effect(() => {
    //   this.search(this.query());
    // });
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      const contents = await this.http
        .get<SearchResult[]>(`/api/contents/search/${query}`)
        .toPromise();
      return contents || [];
    } catch (error) {
      return [];
    }
  }
}
