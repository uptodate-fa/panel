import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResTableComponent } from './res-table/res-table.component';
import { ResFeedbackComponent } from './res-feedback/res-feedback.component';
import { SHARED } from '../../shared';



@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, SHARED, ResTableComponent, ResFeedbackComponent],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss',
})
export class ResultComponent {
}
