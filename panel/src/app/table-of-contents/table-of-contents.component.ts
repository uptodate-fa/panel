import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { SHARED } from '../shared';
import { TableOfContent } from '@uptodate/types';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [CommonModule, SHARED, MatToolbarModule],
  templateUrl: './table-of-contents.component.html',
  styleUrl: './table-of-contents.component.scss',
})
export class TableOfContentsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  topic = signal('');
  contentsQuery = injectQuery(() => ({
    queryKey: ['tableOfContents', this.topic()],
    queryFn: () =>
      lastValueFrom(
        this.http.get<TableOfContent>(
          `/api/contents/tableOfContent/${this.topic()}`,
        ),
      ),
    enabled: true,
  }));

  items = computed(() => {
    const items = this.contentsQuery.data()?.items;
    if (items) {
      for (const item of items) {
        item.name = item.name.replace(`What's new in `, '');
      }
    }
    return items;
  });

  constructor() {
    this.route.params.subscribe((params) => {
      const topic = params['topic'];
      if (topic) this.topic.set(topic);
    });

    console.log(12);
  }
}
