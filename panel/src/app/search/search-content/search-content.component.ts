import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-search-content',
  imports: [
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './search-content.component.html',
  styleUrl: './search-content.component.scss'
})
export class SearchContentComponent {

}

