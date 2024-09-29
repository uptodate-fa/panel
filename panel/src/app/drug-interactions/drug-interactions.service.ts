import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DrugInteractionsService {
  result = signal<string | undefined>(undefined);
  items = signal<string[]>([]);

  constructor() {}

  addItem(item: string) {
    if (this.items().includes(item)) return;
    this.items.update((prev) => [...prev, item]);
  }
}
