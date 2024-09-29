import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Drug } from '@uptodate/types';

@Injectable({
  providedIn: 'root',
})
export class DrugInteractionsService {
  private readonly http = inject(HttpClient);
  result = signal<string | undefined>(undefined);
  items = signal<Drug[]>([]);

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

  analyze() {
    if (!this.items().length) return;
    const ids = this.items()
      .map((d) => d.id)
      .join(',');
    this.http.get(`/api/drug-interactions/interactions/${ids}`).toPromise();
  }
}
