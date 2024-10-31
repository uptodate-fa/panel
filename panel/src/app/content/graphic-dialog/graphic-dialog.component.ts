import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED } from '../../shared';
import { DialogModule } from '@angular/cdk/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-graphic-dialog',
  standalone: true,
  imports: [CommonModule, SHARED, DialogModule],
  templateUrl: './graphic-dialog.component.html',
  styleUrl: './graphic-dialog.component.scss',
})
export class GraphicDialogComponent {
  private readonly data = inject<{ key: string; topicId: string }>(
    MAT_DIALOG_DATA,
  );
  private readonly contentService = inject(ContentService);
  contentQuery = this.contentService.getContentGraphicQuery(
    this.data.key,
    this.data.topicId,
  );
}
