import {
  AfterViewInit,
  Component,
  computed,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Content } from '@uptodate/types';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SHARED } from '../shared';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, SHARED, MatProgressSpinnerModule, MatToolbarModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  title: string;
  id = signal('');
  contentQuery = injectQuery(() => ({
    queryKey: ['content', this.id()],
    queryFn: () =>
      lastValueFrom(this.http.get<Content>(`/api/contents/${this.id()}`)),
    enabled: !!this.id(),
    staleTime: Infinity,
  }));

  bodyHTML = computed(() => {
    const body = this.contentQuery.data()?.bodyHtml;
    if (body) {
      const div = document.createElement('div');
      div.innerHTML = body;

      const allInnerDivs = div.querySelectorAll('div');
      allInnerDivs.forEach((element) => {
        if (element.id === 'topicTitle') {
          element.remove();
          this.title = element.innerText;
        }
        if (element.id) {
          element.classList.add(element.id);
        }
      });

      return div.innerHTML;
    }

    return body;
  });

  outlineHtml = computed(() => {
    const body = this.contentQuery.data()?.outlineHtml;
    if (body) {
      const div = document.createElement('div');
      div.innerHTML = body;

      const allInnerDivs = div.querySelectorAll('div');
      allInnerDivs.forEach((element) => {
        if (element.id === 'topicTitle') {
          element.remove();
        }
        if (element.id) {
          element.classList.add(element.id);
        }
      });

      return div.innerHTML;
    }

    return body;
  });

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) this.id.set(id);
    });
  }
}
