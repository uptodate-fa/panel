import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SHARED_MODULES } from './shared/modules';
import { ThemeService } from './core/services/theme.service';

@Component({
  standalone: true,
  imports: [RouterModule, SHARED_MODULES],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(private theme: ThemeService) {}
}
