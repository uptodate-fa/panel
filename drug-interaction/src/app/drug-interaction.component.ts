import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrugInteractionService, DrugItem, InteractionPair } from './drug-interaction.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-drug-interaction',
  templateUrl: './drug-interaction.component.html',
  styleUrl: './drug-interaction.component.scss',
})
export class DrugInteractionComponent implements OnDestroy {
  private drugService = inject(DrugInteractionService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  searchQuery = signal('');
  searchResults = signal<DrugItem[]>([]);
  selectedItems = signal<DrugItem[]>([]);
  interactions = signal<InteractionPair[]>([]);
  isLoading = signal(false);
  isAnalyzing = signal(false);
  showResults = signal(false);
  hasSearched = signal(false);

  constructor() {
    // Set up debounced search
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          const trimmedQuery = query.trim();
          if (!trimmedQuery) {
            this.isLoading.set(false);
            this.searchResults.set([]);
            this.hasSearched.set(false);
            return of([]);
          }
          // Clear previous results and show loading
          this.searchResults.set([]);
          this.isLoading.set(true);
          this.hasSearched.set(false);
          return this.drugService.searchDrug(trimmedQuery);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.isLoading.set(false);
          this.hasSearched.set(true);
        },
        error: (error) => {
          console.error('Search error:', error);
          this.searchResults.set([]);
          this.isLoading.set(false);
          this.hasSearched.set(true);
        },
      });
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  onSearch() {
    // Trigger immediate search on button click or Enter
    const query = this.searchQuery().trim();
    if (!query) {
      this.searchResults.set([]);
      return;
    }
    this.searchSubject.next(query);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectItem(item: DrugItem) {
    // Check if item is already selected
    if (!this.selectedItems().some((i) => i.item_id === item.item_id)) {
      this.selectedItems.set([...this.selectedItems(), item]);
    }
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.hasSearched.set(false);
  }

  removeItem(itemId: number) {
    this.selectedItems.set(
      this.selectedItems().filter((item) => item.item_id !== itemId)
    );
  }

  clearAll() {
    this.selectedItems.set([]);
    this.interactions.set([]);
    this.showResults.set(false);
  }

  analyze() {
    const items = this.selectedItems();
    if (items.length === 0) {
      return;
    }

    this.isAnalyzing.set(true);
    this.showResults.set(false);
    this.drugService.analyze(items).subscribe({
      next: (results) => {
        this.interactions.set(results);
        this.showResults.set(true);
        this.isAnalyzing.set(false);
      },
      error: (error) => {
        console.error('Analyze error:', error);
        this.isAnalyzing.set(false);
      },
    });
  }

  getRiskLetter(risk: number): string {
    return risk === 5 ? 'X' : risk === 4 ? 'D' : risk === 3 ? 'C' : risk === 2 ? 'B' : 'A';
  }

  getRiskColor(risk: number): string {
    if (risk === 5) return '#d32f2f'; // Red
    if (risk === 4) return '#f57c00'; // Orange
    if (risk === 3) return '#fbc02d'; // Yellow
    if (risk === 2) return '#388e3c'; // Green
    return '#1976d2'; // Blue
  }
}

