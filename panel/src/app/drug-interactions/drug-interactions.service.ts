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

  removeItem(item: string) {
    const index = this.items().indexOf(item);
    if (index > -1) {
      const copy = [...this.items()];
      copy.splice(index, 1);
      this.items.set(copy);
    }
  }
}
