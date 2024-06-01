import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SHARED_MODULES } from './shared/modules';

@Component({
  standalone: true,
  imports: [RouterModule, SHARED_MODULES],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'panel';
}
