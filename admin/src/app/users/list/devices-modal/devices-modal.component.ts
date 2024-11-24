import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { SHARED } from '../../../shared';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserDevice } from '@uptodate/types';
import { UAParser } from 'ua-parser-js';

@Component({
  selector: 'app-user-devices-modal',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatBottomSheetModule,
    MatListModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './devices-modal.component.html',
  styleUrl: './devices-modal.component.scss',
})
export class UserDevicesModalComponent {
  private readonly http = inject(HttpClient);
  readonly data = inject<{
    userId: string;
  }>(MAT_BOTTOM_SHEET_DATA);

  query = injectQuery(() => ({
    queryKey: ['usersDevices', this.data?.userId],
    queryFn: () =>
      lastValueFrom(
        this.http
          .get<UserDevice[]>(`/api/users/devices/${this.data?.userId}`)
          .pipe(
            map((items) =>
              items.map((item) => ({
                ...item,
                _uap: new UAParser(item.userAgent),
              })),
            ),
          ),
      ),
    enabled: !!this.data?.userId,
  }));

  constructor() {
    effect(() => {
      console.log(this.query.data());
    });
  }
}
