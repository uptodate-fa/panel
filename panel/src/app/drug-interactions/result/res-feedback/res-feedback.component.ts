import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrugInteractionsService } from '../../drug-interactions.service';
import { MatListModule } from '@angular/material/list';
import { DrugInteraction } from '@uptodate/types';



@Component({
  selector: 'app-res-feedback',
  standalone: true,
  imports: [CommonModule, MatListModule],
  templateUrl: './res-feedback.component.html',
  styleUrl: './res-feedback.component.scss',
})
export class ResFeedbackComponent {
  readonly interactionsService = inject(DrugInteractionsService);

  interaction?: DrugInteraction

  constructor(){
    effect(()=>{
      this.interaction= this.interactionsService.interaction()
      console.log(this.interaction);
      
    })
  }
  

}
