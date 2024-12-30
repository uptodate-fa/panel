import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../content.service';

@Component({
  selector: 'app-print-graphic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graphic.component.html',
  styleUrl: './graphic.component.scss',
})
export class PrintGraphicComponent {
  key = input.required<string>()
  topicId = input<string>('')
  readonly contentService = inject(ContentService);
  contentQuery = this.contentService.getContentGraphicQuery(
    this.key,
    this.topicId(),
  );

  innerHtml = computed(() => {
    const htmlString = this.contentQuery.data()?.imageHtml;
    if (htmlString)
      return this.contentService.getGraphicHtml(htmlString).innerHTML;
    return;
  });
}
