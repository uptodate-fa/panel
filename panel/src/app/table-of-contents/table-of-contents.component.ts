import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { SHARED } from '../shared';
import { TableOfContent } from '@uptodate/types';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';

const SPECIALITIES = [
  'Allergy and Immunology',
  'Anesthesiology',
  'Cardiovascular Medicine',
  'Dermatology',
  'Emergency Medicine (Adult and Pediatric)',
  'Endocrinology and Diabetes',
  'Family Medicine and General Practice',
  'Gastroenterology and Hepatology',
  'General Surgery',
  'Geriatrics',
  'Hematology',
  'Hospital Medicine',
  'Infectious Diseases',
  'Nephrology and Hypertension',
  'Neurology',
  "Obstetrics, Gynecology and Women's Health",
  'Oncology',
  'Palliative Care',
  'Pathways',
  'Pediatrics',
  'Primary Care (Adult)',
  'Primary Care Sports Medicine (Adolescents and Adults)',
  'Psychiatry',
  'Pulmonary and Critical Care Medicine',
  'Rheumatology',
  'Sleep Medicine',
];

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [CommonModule, SHARED, MatToolbarModule, MatExpansionModule],
  templateUrl: './table-of-contents.component.html',
  styleUrl: './table-of-contents.component.scss',
})
export class TableOfContentsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  topic = signal('');
  sub = signal('');
  specialty = computed(() => !this.topic() && !this.sub());
  contentsQuery = injectQuery(() => ({
    queryKey: ['tableOfContents', this.topic(), this.sub()],
    queryFn: () =>
      lastValueFrom(
        this.http.get<TableOfContent>(
          `/api/contents/tableOfContent${this.topic() ? `/${this.topic()}` : ''}${this.sub() ? `/${this.sub()}` : ''}`,
        ),
      ),
    enabled: true,
  }));

  items = computed(() => {
    const items = this.contentsQuery.data()?.items;
    if (items && this.topic() == 'whats-new') {
      for (const item of items) {
        item.name = item.name.replace(`What's new in `, '');
      }
    }

    if (this.specialty()) {
      return items?.filter((item) => SPECIALITIES.includes(item.name));
    }
    return items;
  });

  constructor() {
    this.route.params.subscribe((params) => {
      const topic = params['topic'];
      if (topic) this.topic.set(topic);
      const sub = params['sub'];
      if (sub) this.sub.set(sub);
    });
  }
}
