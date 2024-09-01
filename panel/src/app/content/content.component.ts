import { AfterViewInit, Component, computed, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Content } from '@uptodate/types';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SHARED } from '../shared';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, SHARED, MatProgressSpinnerModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  @ViewChild('contentHTML') contentHTML : any;
  content = signal<Content | null>(null);
  bodyHTML = computed (() => {
    const body = this.content()?.bodyHtml;
    if (body){
      const div = document.createElement('div');
      div.innerHTML = body;

      const allInnerDivs = div.querySelectorAll('div');
      console.log(allInnerDivs);

      allInnerDivs.forEach(element => {
        if( element.id) {
          element.classList.add(element.id)
        }
      });

      return (div.innerHTML)
      
    }

  
    return body;
    
  })
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
