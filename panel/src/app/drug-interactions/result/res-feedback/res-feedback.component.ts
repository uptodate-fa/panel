import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrugInteractionsService } from '../../drug-interactions.service';
import { MatListModule } from '@angular/material/list';
import { DrugInteraction } from '@uptodate/types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-res-feedback',
  standalone: true,
  imports: [CommonModule, MatListModule],
  templateUrl: './res-feedback.component.html',
  styleUrl: './res-feedback.component.scss',
})
export class ResFeedbackComponent {
  readonly interactionsService = inject(DrugInteractionsService);
  readonly router = inject(Router);

  interaction?: DrugInteraction;

  constructor() {
    effect(() => {
      this.interaction = this.interactionsService.interaction();
    });
  }

  itemClick(item: DrugInteraction['result'][0]) {
    if (item.url) {
      const id = item.url.split('/')[5];
      if (id) this.router.navigateByUrl(`/interactions/${id}`);
    }
  }
}
