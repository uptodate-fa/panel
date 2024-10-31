import { Component, computed, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED } from '../../shared';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { ContentService } from '../content.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Graphic } from '@uptodate/types';

@Component({
  selector: 'app-graphic-dialog',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatDialogModule,
    MatSidenavModule,
    MatGridListModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './graphic-dialog.component.html',
  styleUrl: './graphic-dialog.component.scss',
})
export class GraphicDialogComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private readonly contentService = inject(ContentService);
  private readonly data = inject<{ key: string; topicId: string }>(
    MAT_DIALOG_DATA,
  );

  key = signal(this.data.key);

  private mdScreenSignal = signal(false);
  isMdScreen = computed(() => this.mdScreenSignal());

  contentQuery = this.contentService.getContentGraphicQuery(
    this.key,
    this.data.topicId,
  );

  innerHtml = computed(() => {
    const htmlString = this.contentQuery.data()?.imageHtml;
    if (htmlString)
      return this.contentService.getGraphicHtml(htmlString).innerHTML;
    return
  });

  graphics = computed(() => {
    const data = this.contentQuery.data();
    return data?.relatedGraphics;
  });

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
      .subscribe((result) => {
        this.mdScreenSignal.set(result.matches); // true if screen is md or larger
      });
  }

  relatedGraphicClick(graphic: Graphic) {
    this.key.set(graphic.imageKey);
  }
}
