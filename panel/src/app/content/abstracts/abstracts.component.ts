import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContentService } from '../content.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SHARED } from '../../shared';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-abstracts',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatListModule, SHARED],
  templateUrl: './abstracts.component.html',
  styleUrl: './abstracts.component.scss',
})
export class AbstractsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly contentsService = inject(ContentService);
  private readonly topicQuery = this.route.snapshot.params['topic'];
  readonly rangeQuery = this.route.snapshot.params['range'];

  query = this.contentsService.getContentAbstractQuery(
    this.topicQuery,
    this.rangeQuery,
  );
}
