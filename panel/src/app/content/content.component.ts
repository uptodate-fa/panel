import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SHARED } from '../shared';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentService } from './content.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  id = signal('');
  showTranslation = signal(false);
  contentQuery = this.contentService.getContentQuery(this.id);
  downloadingPdf = signal(false);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public contentService: ContentService,
  ) {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) this.id.set(id);
    });
  }

  title = computed(() => {
    return this.contentQuery.data()?.title;
  });

  bodyHTML = computed(() => {
    const data = this.contentQuery.data();
    const body = this.showTranslation()
      ? data?.translatedBodyHtml
      : data?.bodyHtml;
    if (body) {
      const div = this.contentService.getBodyHtml(body, data?.relatedGraphics);
      return div.innerHTML;
    }

    return body;
  });

  outlineHtml = computed(() => {
    const body = this.showTranslation()
      ? this.contentQuery.data()?.translatedOutlineHtml
      : this.contentQuery.data()?.outlineHtml;
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

  translate() {
    const data = this.contentQuery.data();
    if (data) {
      if (data.translatedBodyHtml) this.showTranslation.set(true);
      else this.contentService.translateMutation.mutate(data);
    }
  }

  async downloadPdf() {
    const data = this.contentQuery.data();
    if (data) {
      this.downloadingPdf.set(true);
      await this.contentService.downloadPdf(data);
      this.downloadingPdf.set(false);
    }
  }
}
