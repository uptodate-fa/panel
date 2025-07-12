import {
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SHARED } from '../shared';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentService } from './content.service';
import { MatDialog } from '@angular/material/dialog';
import { GraphicDialogComponent } from './graphic-dialog/graphic-dialog.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Title } from '@angular/platform-browser';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { PrintGraphicComponent } from './print/graphic/graphic.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSidenavModule,
    MatTabsModule,
    PrintGraphicComponent,
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  private readonly dialog = inject(MatDialog);
  private readonly breakpointObserver = inject(BreakpointObserver);
  isSmallScreen = this.breakpointObserver.isMatched('(max-width: 959px)');
  id = signal('');
  forceUpdate = signal(false);

  showTranslation = signal(false);
  contentQuery = this.contentService.getContentQuery(this.id, this.forceUpdate);
  downloadingPdf = signal(false);
  tabs = viewChild(MatTabGroup);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public contentService: ContentService,
    private titleService: Title,
  ) {
    const anchor = this.route.snapshot.queryParams['anchor'];
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) this.id.set(id);
    });
    this.route.queryParams.subscribe((query) => {
      const force = query['force'];
      if (force) this.forceUpdate.set(true);
    });

    effect(() => {
      if (this.bodyHTML()) {
        setTimeout(() => {
          document.querySelectorAll('[graphic-key]').forEach((element) => {
            const graphicKey = element.getAttribute('graphic-key');
            if (graphicKey) {
              element.addEventListener('click', (event) =>
                this.openImageDialog(graphicKey),
              );
            }
          });

          document
            .querySelectorAll<HTMLAnchorElement>('a.graphic:not([graphic-key])')
            .forEach((element) => {
              const url = element.href;
              const queryString = url?.split('?')[1];
              const params = new URLSearchParams(queryString);
              // const queryObject = Object.fromEntries(params.entries());
              const imageKey = params.get('imageKey')?.split('~')[0];
              element.removeAttribute('href');
              if (imageKey) { 
                element.addEventListener('click', (event) =>
                  this.openImageDialog(imageKey),
                );
              }
            });

          document
            .querySelectorAll<HTMLAnchorElement>('article a[href].local')
            .forEach((element) => {
              element.addEventListener('click', (event) => {
                const href = element.getAttribute('anchor')?.split?.('#')?.[1];
                if (href)
                  document
                    .getElementById(href)
                    ?.scrollIntoView({ behavior: 'smooth' });
              });
              element.setAttribute('anchor', element.href);
              element.removeAttribute('href');
            });
        }, 2000);
        if (anchor) {
          console.log(anchor)
          setTimeout(() => {
            document
              .querySelector(`#${anchor}`)
              ?.scrollIntoView({ behavior: 'smooth' });
          }, 1500);
        }
      }

      if (this.outlineHtml()) {
        setTimeout(() => {
          document
            .querySelectorAll<HTMLAnchorElement>('#outlineSections a[href]')
            .forEach((element) => {
              element.addEventListener('click', (event) => {
                const href = element.getAttribute('anchor')?.split?.('#')?.[1];
                if (href)
                  document
                    .getElementById(href)
                    ?.scrollIntoView({ behavior: 'smooth' });
              });
              element.setAttribute('anchor', element.href);
              element.removeAttribute('href');
            });

          const viewAll = document.querySelector<HTMLAnchorElement>(
            'a#viewAllGraphicsLink',
          );
          const tabs = this.tabs();
          if (viewAll && tabs) {
            viewAll.addEventListener('click', (event) => {
              tabs.selectedIndex = 1;
            });
            viewAll.removeAttribute('href');
          }
        }, 2000);
      }
    });

    effect(() => {
      const title = this.title();
      if (title) this.titleService.setTitle(title);
    });
  }

  openImageDialog(key: string): void {
    this.dialog.open(GraphicDialogComponent, {
      data: {
        topicId: this.contentQuery.data()?.uptodateId,
        key,
      },
      maxWidth: '95vw',
    });
  }

  title = computed(() => {
    return this.contentQuery.data()?.title;
  });

  bodyHTML = computed(() => {
    const data = this.contentQuery.data();
    const body = this.showTranslation()
      ? data?.translatedBodyHtml
      : data?.bodyHtml;
    if (body) {
      const div = this.contentService.getBodyHtml(body, data?.relatedGraphics);
      return div.innerHTML;
    }

    return body;
  });

  outlineHtml = computed(() => {
    const data = this.contentQuery.data();
    const body = this.showTranslation()
      ? data?.translatedOutlineHtml
      : data?.outlineHtml;
    if (body) {
      const div = this.contentService.getOutlineHtml(body);
      return div.innerHTML;
    }

    return body;
  });

  translate() {
    const data = this.contentQuery.data();
    if (data) {
      if (data.translatedBodyHtml && data.translatedBodyHtml.length / data.bodyHtml.length > 0.4) this.showTranslation.set(true);
      else this.contentService.translateMutation.mutate(data);
    }
  }
}
