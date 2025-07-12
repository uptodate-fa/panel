import { Component, inject, input, Input, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, User } from '@uptodate/types';
import { MatTableModule } from '@angular/material/table';
import { SHARED } from '../../../shared';
import { MatDialog } from '@angular/material/dialog';
import {
  PromptDialogComponent,
  PromptFields,
} from '../../../shared/dialogs/prompt-dialog/prompt-dialog.component';
import { FormControl, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { UserDevicesModalComponent } from '../devices-modal/devices-modal.component';
import {
  injectMutation,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, SHARED],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class UserTableComponent {
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly queryClient = inject(QueryClient);
  users = input<User[] | undefined>([]);
  readonly displayedColumns = [
    'name',
    'phone',
    'mail',
    'city',
    'job',
    'password',
    'maxDevice',
    'expired',
    'activationCode',
    'createdAt',
    'actions',
  ];

  subscriptionMutation = injectMutation(() => ({
    mutationFn: (dto: Subscription) =>
      lastValueFrom(
        this.http.put<Subscription>(`/api/subscription/${dto._id}`, dto),
      ),
    onSuccess: async (data) => {
      await this.queryClient.cancelQueries({ queryKey: ['users'] });

      const previousUsers = this.queryClient.getQueryData<User[]>(['users']);

      if (previousUsers) {
        this.queryClient.setQueryData<User[]>(['users'], (old) => {
          if (old) {
            const user = old.find((u) => u.subscription?._id === data._id);
            if (user) {
              user.subscription = data;
              return [...previousUsers];
            }
          }
          return [];
        });
      }
    },
  }));

  passwordMutation = injectMutation(() => ({
    mutationFn: (dto: { id: string; password: string }) =>
      lastValueFrom(this.http.post<void>(`/api/users/changePassword`, dto)),
    onSuccess: async (data, dto) => {
      await this.queryClient.cancelQueries({ queryKey: ['users'] });

      const previousUsers = this.queryClient.getQueryData<User[]>(['users']);

      if (previousUsers) {
        this.queryClient.setQueryData<User[]>(['users'], (old) => {
          if (old) {
            const user = old.find((u) => u._id === dto.id);
            if (user) {
              user.password = dto.password;
              return [...previousUsers];
            }
          }
          return [];
        });
      }
    },
  }));

  changeMaxDevice(user: User) {
    if (user.subscription) {
      const fields: PromptFields = {
        maxDevice: {
          label: 'تعداد دستگاه',
          type: 'number',
          control: new FormControl(
            user.subscription?.maxActiveDevices,
            Validators.required,
          ),
        },
      };
      this.dialog
        .open(PromptDialogComponent, {
          data: {
            title: 'تغییر تعداد دستگاه',
            fields,
          },
        })
        .afterClosed()
        .subscribe((dto) => {
          this.subscriptionMutation.mutate({
            _id: user.subscription!._id,
            maxActiveDevices: dto.maxDevice,
          } as Subscription);
        });
    }
  }

  changeExpiration(user: User) {
    if (user.subscription) {
      const fields: PromptFields = {
        expiredAt: {
          label: 'تاریخ انقضا',
          type: 'date',
          control: new FormControl(
            user.subscription?.expiredAt,
            Validators.required,
          ),
        },
      };
      this.dialog
        .open(PromptDialogComponent, {
          data: {
            title: 'تغییر تاریخ انقضا',
            fields,
          },
        })
        .afterClosed()
        .subscribe((dto) => {
          this.subscriptionMutation.mutate({
            _id: user.subscription!._id,
            expiredAt: dto.expiredAt,
          } as Subscription);
        });
    }
  }

  resetPassword(user: User) {
    const fields: PromptFields = {
      password: {
        label: 'رمز جدید',
        type: 'text',
        control: new FormControl(user.password, Validators.required),
        eng: true,
        ltr: true,
      },
    };
    this.dialog
      .open(PromptDialogComponent, {
        data: {
          title: 'تغییر رمز ' + user.firstName,
          fields,
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        this.passwordMutation.mutate({
          id: user._id,
          password: dto.password,
        });
      });
  }

  viewDevices(user: User) {
    this.bottomSheet.open(UserDevicesModalComponent, {
      data: { userId: user._id },
    });
  }
}
