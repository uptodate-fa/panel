import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import { Content, Graphic } from '@uptodate/types';
import { lastValueFrom } from 'rxjs';
import { AlertDialogComponent } from '../shared/dialogs/alert-dialog/alert-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly snack = inject(MatSnackBar);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  getContentQuery = (id: Signal<string>) =>
    injectQuery(() => ({
      queryKey: ['content', id()],
      queryFn: () =>
        lastValueFrom(this.http.get<Content>(`/api/contents/${id()}`)),
      enabled: !!id(),
      staleTime: Infinity,
    }));

  translateMutation = injectMutation((client) => ({
    mutationFn: (content: Content) =>
      lastValueFrom(
        this.http.get<Content>(
          `/api/contents/translate/${content.queryStringId}`,
        ),
      ),
    onSuccess: (data, content: Content) => {
      client.invalidateQueries({
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
    },
    onError: (error, content: Content) => {
      client.invalidateQueries({
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
            client.invalidateQueries({
              queryKey: ['content', content.queryStringId],
            });
          }
        });
    },
  }));

  getBodyHtml(htmlString: string, graphics?: Graphic[]) {
    const div = document.createElement('div');
    div.innerHTML = htmlString;

    const allInnerDivs = div.querySelectorAll('div');
    div.querySelector('#topicTitle')?.remove();
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

    const allPictures = div.querySelectorAll('p:has(a[data-inline-graphics])');
    allPictures.forEach((element) => {
      const imageRef = element
        .querySelector(`a[data-inline-graphics]`)
        ?.getAttribute('data-inline-graphics');
      if (imageRef) {
        const graphic = graphics?.find((g) => g.imageKey.search(imageRef) > -1);
        if (graphic) {
          const graphicDiv = document.createElement('div');
          graphicDiv.innerHTML = `<div class="utd-inline-graphic__container"><a class="utd-thumbnail__container thumbnail-border thumbnail-large utd-inline-graphic__thumbnail" href="https://www.uptodate.com/contents/image?imageKey=${graphic.imageKey}&amp;topicKey=PC%2F5367&amp;source=inline_graphic"><img src="https://www.uptodate.com/services/app/contents/graphic/view/${graphic.imageKey}/largethumbnail.png"/><span>${graphic.title}</span></a></div>`;
          element.prepend(graphicDiv);
        }
      }
    });

    return div;
  }
}
