import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Content } from '@uptodate/types';
import { HttpClient } from '@angular/common/http';
import { SHARED } from '../shared';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, SHARED],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  content = signal<Content | null>(null);
  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) this.load(id);
    });
  }

  async load(id: string) {
    this.content.set(null);
    try {
      const content = await this.http
        .get<Content>(`/api/contents/${id}`)
        .toPromise();
      if (content) this.content.set(content);
    } catch (error) {
      //
    }
  }
}
