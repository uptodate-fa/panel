import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED } from '../../shared';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { lastValueFrom } from 'rxjs';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-graphic-dialog',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatDialogModule,
    MatSidenavModule,
    MatGridListModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './graphic-dialog.component.html',
  styleUrl: './graphic-dialog.component.scss',
})
export class GraphicDialogComponent {
  private readonly http = inject(HttpClient);
  private readonly data = inject<{ key: string; topicId: string }>(
    MAT_DIALOG_DATA,
  );

  key = signal(this.data.key);

  private mdScreenSignal = signal(false);
  isMdScreen = computed(() => this.mdScreenSignal());

  contentQuery = injectQuery(() => ({
    queryKey: ['graphic', this.key()],
    queryFn: () =>
      lastValueFrom(
        this.http.get(
          `https://uptodate-io.darkube.app/graphics/${this.key()}`,
          {
            responseType: 'text',
          },
        ),
      ),
    enabled: !!this.key(),
    staleTime: Infinity,
    select: (data: string) => {
      return data.replace(
        /src="/g,
        'src="https://uptodate-io.darkube.app/graphics/',
      );
    },
  }));
}
