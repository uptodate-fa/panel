import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../content.service';
import { ActivatedRoute } from '@angular/router';
import { PrintGraphicComponent } from './graphic/graphic.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SHARED } from '../../shared';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-print-content',
  standalone: true,
  imports: [
    CommonModule,
    PrintGraphicComponent,
    MatToolbarModule,
    MatCheckboxModule,
    MatCardModule,
    FormsModule,
    SHARED,
  ],
  templateUrl: './print-content.component.html',
  styleUrl: './print-content.component.scss',
})
export class PrintContentComponent {
  readonly contentService = inject(ContentService);
  readonly route = inject(ActivatedRoute);

  textsVisibility = signal(true);
  referencesVisibility = signal(true);
  graphicsVisibility = signal(true);
  contributorVisibility = signal(true);

  contentQuery = this.contentService.getContentPrintQuery(
    this.route.snapshot.params['id'],
  );

  bodyHtml = computed(() => {
    const data = this.contentQuery.data();
    let body = data?.bodyHtml;
    if (body) {
      body = body.replace(
        '/images/logos/utd-wheel-icon.svg',
        'icons/wheel-icon.svg',
      );
      body = body.replace('/images/logos/utd-logo.svg', 'icons/typo-logo.svg');
      const div = this.contentService.getBodyHtml(body, data?.relatedGraphics);
      return div.innerHTML;
    }

    return body;
  });

  print() {
    window.print();
  }
}
