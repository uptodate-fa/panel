import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrugInteractionsService } from '../../drug-interactions.service';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-res-feedback',
  standalone: true,
  imports: [CommonModule, MatListModule],
  templateUrl: './res-feedback.component.html',
  styleUrl: './res-feedback.component.scss',
})
export class ResFeedbackComponent {
  readonly interactionsService = inject(DrugInteractionsService);

  drugs = this.interactionsService.items.length;
  drugTitle = this.interactionsService.result.length
}
