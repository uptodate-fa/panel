import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  HALF_YEAR_DAYS,
  UptodateAccount,
  YEARLY_DAYS,
  UptodateAccountStatus,
} from '@uptodate/types';
import { MatTableModule } from '@angular/material/table';
import { SHARED } from '../../../shared';
import {
  PromptDialogComponent,
  PromptFields,
} from '../../../shared/dialogs/prompt-dialog/prompt-dialog.component';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  injectMutation,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-uptodate-account-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, SHARED],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class UptodateAccountTableComponent {
  YEARLY_DAYS = YEARLY_DAYS;
  HALF_YEAR_DAYS = HALF_YEAR_DAYS;
  UptodateAccountStatus = UptodateAccountStatus;
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly queryClient = inject(QueryClient);
  data = input<UptodateAccount[] | undefined>([]);
  readonly displayedColumns = [
    'username',
    'password',
    'status',
    'loginAt',
    'createdAt',
    'actions',
  ];

  addMutation = injectMutation(() => ({
    mutationFn: (dto: UptodateAccount) =>
      lastValueFrom(
        this.http.post<UptodateAccount>(`/api/uptodateAccounts`, dto),
      ),
    onSuccess: async (data, dto) => {
      await this.queryClient.cancelQueries({ queryKey: ['uptodateAccounts'] });
      await this.queryClient.invalidateQueries({
        queryKey: ['uptodateAccounts'],
      });
    },
  }));

  edit(account: UptodateAccount) {
    const fields: PromptFields = {
      username: {
        label: 'نام کاربری',
        control: new FormControl(account.username, Validators.required),
        eng: true,
      },
      password: {
        label: 'رمز عبور',
        control: new FormControl(account.password, Validators.required),
        eng: true,
      },
    };

    this.dialog
      .open(PromptDialogComponent, {
        data: {
          title: 'اضافه کردن اکانت جدید',
          fields,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          data._id = account._id;
          this.addMutation.mutate(data);
        }
      });
  }
}
