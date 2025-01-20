import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { Drug, DrugInteraction } from '@uptodate/types';

const SESSION_STORAGE_KEY = 'drugInteractionItems';

@Injectable({
  providedIn: 'root',
})
export class DrugInteractionsService {
  private readonly http = inject(HttpClient);
  interaction = signal<DrugInteraction | undefined>(undefined);
  items = signal<Drug[]>([]);

  constructor() {
    effect(() => {
      const items = this.items();
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(items));
    });

    const localItemsString = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (localItemsString) {
      const localItems: Drug[] = JSON.parse(localItemsString);
      if (localItems.length && !this.interaction()) {
        this.items.set(localItems);
        this.analyze();
      }
    }
  }

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

  async analyze() {
    if (!this.items().length) return;
    const ids = this.items()
      .map((d) => d.id)
      .join(',');
    const result = await this.http
      .get<DrugInteraction>(`/api/drug-interactions/interactions/${ids}`)
      .toPromise();
    this.interaction.set(result);
  }

  clear() {
    this.items.set([]);
    this.interaction.set(undefined);
  }
}
