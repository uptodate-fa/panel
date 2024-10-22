import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED } from '../../shared';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { debounceTime, lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { DrugInteractionsService } from '../drug-interactions.service';
import { Drug } from '@uptodate/types';

@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.scss',
})
export class SelectorComponent {
  private readonly http = inject(HttpClient);
  private readonly interactionsService = inject(DrugInteractionsService);

  searchControl = new FormControl();
  searchTerm = signal('');

  searchQuery = injectQuery(() => ({
    queryKey: ['presearch', this.searchTerm()],
    queryFn: () =>
      lastValueFrom(
        this.http.get<Drug[]>(
          `/api/drug-interactions/search/${this.searchTerm()}`,
        ),
      ),
    enabled: !!this.searchTerm(),
    staleTime: Infinity,
  }));

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(400))
      .subscribe(async (query) => {
        this.searchTerm.set(query);
      });
  }

  onSelectItem(item: Drug) {
    this.interactionsService.addItem(item);
    this.searchControl.setValue('');
  }
}
