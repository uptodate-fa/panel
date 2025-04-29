import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { SHARED } from '../../../shared';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Subscription, UserDevice } from '@uptodate/types';
import { UAParser } from 'ua-parser-js';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-devices-modal',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatBottomSheetModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './devices-modal.component.html',
  styleUrl: './devices-modal.component.scss',
})
export class UserDevicesModalComponent {
  private readonly http = inject(HttpClient);
  private readonly queryClient = inject(QueryClient);
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

  logoutMutation = injectMutation(() => ({
    mutationFn: (deviceId: string) =>
      lastValueFrom(
        this.http.get(`/api/users/devices/${deviceId}/logout`, {}),
      ),
    onSuccess: () => {
      this.queryClient.invalidateQueries({
        queryKey: ['usersDevices', this.data?.userId],
      });
    },
  }));

  logoutDevice(deviceId: string) {
    this.logoutMutation.mutate(deviceId);
  }
}
