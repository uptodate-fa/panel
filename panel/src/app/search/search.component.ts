import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED } from '../shared';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { injectQuery } from '@tanstack/angular-query-experimental';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  searchControl = new FormControl();
  searchTerm = signal('');
  searchQuery = injectQuery(() => ({
    queryKey: ['presearch', this.searchTerm()],
    queryFn: () =>
      lastValueFrom(
        this.http.get<string[]>(`/api/contents/presearch/${this.searchTerm()}`)
      ),
    enabled: !!this.searchTerm(),
    staleTime: Infinity,
  }));

  constructor(private http: HttpClient) {
    this.searchControl.valueChanges
      .pipe(debounceTime(400))
      .subscribe(async (query) => {
        this.searchTerm.set(query);
      });
  }
}
