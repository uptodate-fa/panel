import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatListModule} from '@angular/material/list';

@Component({
  selector: 'app-res-table',
  standalone: true,
  imports: [CommonModule, MatListModule],
  templateUrl: './res-table.component.html',
  styleUrl: './res-table.component.scss',
})
export class ResTableComponent {
  items = [
    {
      title: "X",
      strong: "Avoid combination",
      desc: "Data demonstrate that the specified agents may interact with each other in a clinically significant manner. The risks associated with concomitant use of these agents usually outweigh the benefits. Concurrent use of these agents should generally be avoided."
    },
    {
      title: "D",
      strong: "Consider therapy modification",
      desc: "Data demonstrate that the two medications may interact with each other in a clinically significant manner. A patient-specific assessment must be conducted to determine whether the benefits of concomitant therapy outweigh the risks. Specific actions must be taken in order to realize the benefits and/or minimize the risks resulting from concomitant use of the agents. These actions may include aggressive monitoring, empiric dosage changes, or choosing alternative agents."
    }, 
    {
      title: "C",
      strong: "Monitor therapy",
      desc: "Data demonstrate that the specified agents may interact with each other in a clinically significant manner. The benefits of concomitant use of these two medications often outweigh the risks. An appropriate monitoring plan should be implemented to identify potential negative effects. Dosage adjustments of one or both agents may be needed in some patients."
    },
    {
      title: "B",
      strong: "No action needed",
      desc: "Data demonstrate that the specified agents may interact with each other in a clinically significant manner. The benefits of concomitant use of these two medications often outweigh the risks. An appropriate monitoring plan should be implemented to identify potential negative effects. Dosage adjustments of one or both agents may be needed in some patients."
    },
    {
      title: "A",
      strong: "No known interaction",
      desc: "Data demonstrate that the specified agents may interact with each other in a clinically significant manner. The benefits of concomitant use of these two medications often outweigh the risks. An appropriate monitoring plan should be implemented to identify potential negative effects. Dosage adjustments of one or both agents may be needed in some patients."
    }
  ];
}
