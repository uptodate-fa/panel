import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ActivationCode } from '@uptodate/types';
import { ActivationCodeTableComponent } from './table/table.component';

@Component({
  selector: 'app-activation-codes-list',
  standalone: true,
  imports: [CommonModule, ActivationCodeTableComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ActivationCodesListComponent {
  private http = inject(HttpClient);

  query = injectQuery(() => ({
    queryKey: ['activationCodes'],
    queryFn: () =>
      lastValueFrom(this.http.get<ActivationCode[]>(`/api/activationCodes`)),
  }));
}
