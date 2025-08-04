import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { Content, ContentAbstract, Graphic } from '@uptodate/types';
import { lastValueFrom } from 'rxjs';
import { AlertDialogComponent } from '../shared/dialogs/alert-dialog/alert-dialog.component';
import { GraphicDialogComponent } from './graphic-dialog/graphic-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly snack = inject(MatSnackBar);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly queryClient = inject(QueryClient);

  getContentQuery = (
    id: Signal<string>,
    topicId?: Signal<string>,
    forceUpdate?: Signal<boolean>,
  ) =>
    injectQuery(() => ({
      queryKey: ['content', id(), topicId?.(), forceUpdate?.()],
      queryFn: () =>
        lastValueFrom(
          this.http.get<Content>(`/api/contents/${id()}`, {
            params: {
              force: forceUpdate?.() ? '1' : '',
              topicId: topicId?.() || '',
            },
          }),
        ),
      enabled: !!id(),
      staleTime: Infinity,
    }));

  getContentPrintQuery = (id: string) =>
    injectQuery(() => ({
      queryKey: ['content/print', id],
      queryFn: () =>
        lastValueFrom(this.http.get<Content>(`/api/contents/print/${id}`)),
      enabled: !!id,
      staleTime: Infinity,
    }));

  getContentGraphicQuery = (imageKey: Signal<string>, topicId: string) =>
    injectQuery(() => ({
      queryKey: ['content/graphic', imageKey(), topicId],
      queryFn: () =>
        lastValueFrom(
          this.http.get<Graphic>(`/api/contents/graphic`, {
            params: { topicId, imageKey: imageKey() },
          }),
        ),
      staleTime: Infinity,
    }));

  getContentAbstractQuery = (topicId: string, range: string) =>
    injectQuery(() => ({
      queryKey: ['content/abstract', topicId, range],
      queryFn: () =>
        lastValueFrom(
          this.http.get<ContentAbstract[]>(
            `/api/contents/abstract/${topicId}/${range}`,
          ),
        ),
      staleTime: Infinity,
    }));

  translateMutation = injectMutation(() => ({
    mutationFn: (content: Content) =>
      lastValueFrom(
        this.http.get<Content>(
          `/api/contents/translate/${content.queryStringId}`,
        ),
      ),
    onSuccess: (data, content: Content) => {
      if (content.translatedAt) {
        this.queryClient.invalidateQueries({
          queryKey: ['content', content.queryStringId],
        });
        this.snack
          .open(
            'Translation complete! Please review the translated article.',
            'View',
            { duration: 5000 },
          )
          .onAction()
          .subscribe(() => {
            this.router.navigateByUrl(`/contents/${content.queryStringId}`);
          });
      }
    },
    onError: (error, content: Content) => {
      this.queryClient.invalidateQueries({
        queryKey: ['content', content.queryStringId],
      });
      this.snack
        .open('Translation failed. Please try again.', 'Retry', {
          duration: 5000,
        })
        .onAction()
        .subscribe(() => {
          this.translateMutation.mutate(content);
        });
    },
    onMutate: (content) => {
      this.dialog
        .open(AlertDialogComponent, {
          data: {
            title: content.translatedAt
              ? 'Translation Ongoing'
              : 'Translation Request Submitted',
            okText: content.translatedAt ? 'Got it' : 'OK',
            description: content.translatedAt
              ? "The translation is still in progress. Please wait a few more minutes until the process is complete. You'll be notified once it's done."
              : 'Your translation request has been successfully submitted. The AI is now translating your article, and this process may take around 10 minutes. Please check back later to review the completed translation.',
            hideCancel: true,
          },
          disableClose: true,
        })
        .afterClosed()
        .subscribe(() => {
          if (!content.translatedAt) {
            this.queryClient.invalidateQueries({
              queryKey: ['content', content.queryStringId],
            });
          }
        });
    },
  }));

  getBodyHtml(htmlString: string, graphics?: Graphic[]) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.replace(
      /\/external-redirect/g,
      'https://www.uptodate.com/external-redirect',
    );

    const allInnerDivs = div.querySelectorAll('div');
    allInnerDivs.forEach((element) => {
      if (element.id) {
        element.classList.add(element.id);
      }
    });

    div.querySelectorAll('.graphic_picture').forEach((elem) => {
      const i = document.createElement('i');
      i.classList.add('fa-light', 'fa-image', 'fa-sm');
      i.style.paddingInlineEnd = '4px';
      elem.prepend(i);
    });

    div.querySelectorAll('.graphic_table').forEach((elem) => {
      const i = document.createElement('i');
      i.classList.add('fa-light', 'fa-table', 'fa-sm');
      i.style.paddingInlineEnd = '4px';
      elem.prepend(i);
    });

    const allExternals = div.querySelectorAll<HTMLAnchorElement>('a.external');
    allExternals.forEach((elem) => {
      const i = document.createElement('i');
      i.classList.add('fa-light', 'fa-arrow-up-right-from-square', 'fa-sm');
      i.style.paddingInlineEnd = '4px';
      elem.prepend(i);
      elem.target = '_blank';
    });

    const allGraphicLinks = div.querySelectorAll<HTMLAnchorElement>(
      'a[href*="graphic_asset/"]',
    );
    allGraphicLinks.forEach((elem) => {
      const href = elem.href;
      const graphicKey = href.split('/').pop();
      if (graphicKey) {
        elem.removeAttribute('href');
        elem.setAttribute('graphic-key', graphicKey);
      }
    });
    // const allPictures = div.querySelectorAll('p:has(a[data-inline-graphics])');
    // allPictures.forEach((element) => {
    //   console.log(element);
    //   const href = element
    //     .querySelector(`a[data-inline-graphics]`)
    //     ?.getAttribute('href');

    //   console.log(href);

    //   if (href) {
    //     const [path, type] = href.split('.');
    //     const name = href.split('/').pop();
    //     console.log(name, type);
    //     const graphicDiv = document.createElement('div');
    //     graphicDiv.innerHTML = `<div class="utd-inline-graphic__container"><a class="utd-thumbnail__container thumbnail-border thumbnail-large utd-inline-graphic__thumbnail" href="https://www.uptodate.com/contents/image?imageKey=${graphic.imageKey}&amp;topicKey=PC%2F5367&amp;source=inline_graphic"><span>${graphic.title}</span></a></div>`;
    //     element.prepend(graphicDiv);
    //   }
    //   // if (assetSrc) {
    //   // const graphic = graphics?.find((g) => g.imageKey.search(assetSrc) > -1);
    //   // if (graphic) {
    //   //   const graphicDiv = document.createElement('div');
    //   //   graphicDiv.innerHTML = `<div class="utd-inline-graphic__container"><a class="utd-thumbnail__container thumbnail-border thumbnail-large utd-inline-graphic__thumbnail" graphic-key="${graphic.imageKey}"><img src="https://www.uptodate.com/services/app/contents/graphic/view/${graphic.imageKey}/largethumbnail.png"/><span>${graphic.title}</span></a></div>`;
    //   //   // graphicDiv.innerHTML = `<div class="utd-inline-graphic__container"><a class="utd-thumbnail__container thumbnail-border thumbnail-large utd-inline-graphic__thumbnail" href="https://www.uptodate.com/contents/image?imageKey=${graphic.imageKey}&amp;topicKey=PC%2F5367&amp;source=inline_graphic"><img src="https://www.uptodate.com/services/app/contents/graphic/view/${graphic.imageKey}/largethumbnail.png"/><span>${graphic.title}</span></a></div>`;
    //   //   element.prepend(graphicDiv);
    //   // }
    //   // }
    // });

    return div;
  }

  getOutlineHtml(htmlString: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;
    const allGraphicLinks = div.querySelectorAll<HTMLAnchorElement>(
      'a[href*="graphic_asset/"]',
    );
    allGraphicLinks.forEach((elem) => {
      const href = elem.href;
      const graphicKey = href.split('/').pop();
      if (graphicKey) {
        elem.removeAttribute('href');
        elem.setAttribute('graphic-key', graphicKey);
      }
    });
    return div;
  }

  getGraphicHtml(htmlString: string) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;

    const allImgs = div.querySelectorAll('img');
    allImgs.forEach((element) => {
      const src = new URL(element.src);
      if (src && src.origin !== 'https://medsmart.shop') {
        element.src = src
          .toString()
          .replace(src.origin, `https://www.uptodate.com`);
      }
    });
    return div;
  }

  async downloadPdf(content: Content) {
    window.print();
  }
}
