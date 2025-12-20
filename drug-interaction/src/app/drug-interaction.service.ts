import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface DrugItem {
  item_id: number;
  name: string;
  generic_id: number;
  brand_id: number;
}

export interface InteractionPair {
  monograph_id: number;
  risk: number;
  object_id: number;
  precipitant_id: number;
  text1: string;
  generic1: number;
  brand1: number;
  text2: string;
  generic2: number;
  brand2: number;
  filter: string;
}

@Injectable({
  providedIn: 'root',
})
export class DrugInteractionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  searchDrug(query: string): Observable<DrugItem[]> {
    return this.http.get<DrugItem[]>(
      `${this.apiUrl}/drug-interactions/search-sqlite/${encodeURIComponent(query)}`
    );
  }

  analyze(items: DrugItem[]): Observable<InteractionPair[]> {
    return this.http.post<InteractionPair[]>(
      `${this.apiUrl}/drug-interactions/analyze-sqlite`,
      { items }
    );
  }
}

