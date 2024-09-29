import { Injectable, signal } from '@angular/core';
import { Drug } from '@uptodate/types';

@Injectable({
  providedIn: 'root',
})
export class DrugInteractionsService {
  result = signal<string | undefined>(undefined);
  items = signal<Drug[]>([]);

  constructor() {}

  addItem(item: Drug) {
    if (this.items().find((x) => x.id === item.id)) return;
    this.items.update((prev) => [...prev, item]);
  }

  removeItem(item: Drug) {
    const index = this.items().findIndex((x) => x.id === item.id);
    if (index > -1) {
      const copy = [...this.items()];
      copy.splice(index, 1);
      this.items.set(copy);
    }
  }
}
