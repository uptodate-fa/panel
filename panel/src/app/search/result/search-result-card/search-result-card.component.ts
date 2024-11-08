import { Component, computed, inject, Input, signal } from '@angular/core';
import { SHARED } from '../../../shared';
import { MatCardModule } from '@angular/material/card';
import { Content, SearchResult } from '@uptodate/types';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GraphicDialogComponent } from '../../../content/graphic-dialog/graphic-dialog.component';

@Component({
  selector: 'app-search-result-card',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
  ],
  templateUrl: './search-result-card.component.html',
  styleUrl: './search-result-card.component.scss',
})
export class SearchResultCardComponent {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);

  @Input() result: SearchResult;
  isMouseOver = signal(false);

  outlineQuery = injectQuery(() => ({
    queryKey: ['outline', this.result.id],
    queryFn: () =>
      lastValueFrom(
        this.http.get<Content>(`/api/contents/outline/${this.result.id}`),
      ),
    enabled: this.isMouseOver() && !!this.result.id,
    staleTime: Infinity,
  }));

  setGraphicLinks() {
    setTimeout(() => {
      document
        .querySelectorAll<HTMLAnchorElement>('a.graphic')
        .forEach((element) => {
          console.log(element);
          const url = element.href;
          const queryString = url?.split('?')[1];
          const params = new URLSearchParams(queryString);
          // const queryObject = Object.fromEntries(params.entries());
          const imageKey = params.get('imageKey');
          const topicKey = params.get('topicKey');
          element.removeAttribute('href');
          if (imageKey && topicKey) {
            console.log(element);
            element.addEventListener('click', (event) => {
              debugger;
              this.openImageDialog(imageKey, topicKey);
            });
          }
        }, 1000);
    });
  }

  openImageDialog(key: string, topicId: string): void {
    debugger;
    this.dialog.open(GraphicDialogComponent, {
      data: {
        topicId,
        key,
      },
      maxWidth: '95vw',
    });
  }
}
