import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Content } from '@uptodate/types';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SHARED } from '../shared';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../shared/dialogs/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, SHARED, MatProgressSpinnerModule, MatToolbarModule],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss',
})
export class ContentComponent {
  title: string;
  id = signal('');
  showTranslation = signal(false);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) this.id.set(id);
    });
  }

  contentQuery = injectQuery(() => ({
    queryKey: ['content', this.id()],
    queryFn: () =>
      lastValueFrom(this.http.get<Content>(`/api/contents/${this.id()}`)),
    enabled: !!this.id(),
    staleTime: Infinity,
  }));

  translateMutation = injectMutation((client) => ({
    mutationFn: () =>
      lastValueFrom(this.http.get(`/api/contents/translate/${this.id()}`)),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['content', this.id()] });
      this.snack
        .open(
          'Translation complete! Please review the translated article.',
          'View',
          { duration: 5000 },
        )
        .onAction()
        .subscribe(() => {
          this.router.navigateByUrl(`/contents/${this.id()}`);
        });
    },
    onError: () => {
      client.invalidateQueries({ queryKey: ['content', this.id()] });
      this.snack
        .open('Translation failed. Please try again.', 'Retry', {
          duration: 5000,
        })
        .onAction()
        .subscribe(() => {
          this.translateMutation.mutate();
        });
    },
    onMutate: () => {
      this.dialog
        .open(AlertDialogComponent, {
          data: {
            title: this.contentQuery.data()?.translatedAt
              ? 'Translation Ongoing'
              : 'Translation Request Submitted',
            okText: this.contentQuery.data()?.translatedAt ? 'Got it' : 'OK',
            description: this.contentQuery.data()?.translatedAt
              ? "The translation is still in progress. Please wait a few more minutes until the process is complete. You'll be notified once it's done."
              : 'Your translation request has been successfully submitted. The AI is now translating your article, and this process may take around 10 minutes. Please check back later to review the completed translation.',
            hideCancel: true,
          },
          disableClose: true,
        })
        .afterClosed()
        .subscribe(() => {
          if (!this.contentQuery.data()?.translatedAt) {
            client.invalidateQueries({ queryKey: ['content', this.id()] });
          }
        });
    },
  }));

  bodyHTML = computed(() => {
    const body = this.showTranslation()
      ? this.contentQuery.data()?.translatedBodyHtml
      : this.contentQuery.data()?.bodyHtml;
    if (body) {
      const div = Content.getBodyHtml(body);

      const titleElement = div.querySelector<HTMLDivElement>('#topicTitle');
      if (titleElement) this.title = titleElement.innerText;
      return div.innerHTML;
    }

    return body;
  });

  outlineHtml = computed(() => {
    const body = this.showTranslation()
      ? this.contentQuery.data()?.translatedOutlineHtml
      : this.contentQuery.data()?.outlineHtml;
    if (body) {
      const div = document.createElement('div');
      div.innerHTML = body;

      const allInnerDivs = div.querySelectorAll('div');
      allInnerDivs.forEach((element) => {
        if (element.id === 'topicTitle') {
          element.remove();
        }
        if (element.id) {
          element.classList.add(element.id);
        }
      });

      return div.innerHTML;
    }

    return body;
  });

  translate() {
    if (this.contentQuery.data()?.translatedBodyHtml)
      this.showTranslation.set(true);
    else this.translateMutation.mutate();
  }
}
