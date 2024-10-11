import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResTableComponent } from './res-table/res-table.component';
import { ResFeedbackComponent } from './res-feedback/res-feedback.component';
import { DrugInteraction } from '@uptodate/types';



@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, ResTableComponent, ResFeedbackComponent],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss',
})
export class ResultComponent {
}
