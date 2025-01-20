import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { SHARED } from '../../shared';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-drug-interaction-details',
  standalone: true,
  imports: [CommonModule, SHARED, MatProgressSpinnerModule, MatToolbarModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DrugInteractionDetailsComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  id = this.route.snapshot.params['id'];
  query = injectQuery(() => ({
    queryKey: ['drugInteractionsDetails', this.id],
    queryFn: () =>
      lastValueFrom(
        this.http.get<{ interactionHtml: string }>(
          `/api/drug-interactions/interactions/details/${this.id}`,
        ),
      ),
  }));
}
