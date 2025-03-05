import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SHARED } from '../../shared';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { debounceTime, lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-searchbar',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    SHARED,
  ],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.scss',
})
export class SearchbarComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  searchControl = new FormControl();
  searchTerm = signal('');
  searchQuery = injectQuery(() => ({
    queryKey: ['presearch', this.searchTerm()],
    queryFn: () =>
      lastValueFrom(
        this.http.get<string[]>(`/api/contents/presearch/${this.searchTerm()}`),
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

  searchControlKeyDown(ev: KeyboardEvent) {
    if (ev.code === 'Enter') {
      this.gotToSearchPage();
    }
  }

  gotToSearchPage() {
    const term = this.searchTerm();
    if (term?.length > 1) {
      this.router.navigateByUrl(`/search/result?query=${term}`);
      this.searchTerm.set('')
    }
  }
}
