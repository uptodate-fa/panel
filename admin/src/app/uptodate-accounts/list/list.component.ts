import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { UptodateAccount } from '@uptodate/types';
import { UptodateAccountTableComponent } from './table/table.component';
import { SHARED } from '../../shared';
import { MatDialog } from '@angular/material/dialog';
import {
  PromptDialogComponent,
  PromptFields,
} from '../../shared/dialogs/prompt-dialog/prompt-dialog.component';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-uptodate-accounts-list',
  standalone: true,
  imports: [CommonModule, UptodateAccountTableComponent, SHARED],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class UptodateAccountsListComponent {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private readonly queryClient = inject(QueryClient);

  query = injectQuery(() => ({
    queryKey: ['uptodateAccounts'],
    queryFn: () =>
      lastValueFrom(this.http.get<UptodateAccount[]>(`/api/uptodateAccounts`)),
  }));

  addMutation = injectMutation(() => ({
    mutationFn: (dto: UptodateAccount) =>
      lastValueFrom(
        this.http.post<UptodateAccount>(`/api/uptodateAccounts`, dto),
      ),
    onSuccess: async (data) => {
      await this.queryClient.cancelQueries({ queryKey: ['uptodateAccounts'] });

      const previousData = this.queryClient.getQueryData<UptodateAccount[]>([
        'uptodateAccounts',
      ]);

      if (previousData) {
        if (data) {
          this.queryClient.setQueryData<UptodateAccount[]>(
            ['uptodateAccounts'],
            (old) => [data, ...(old || [])],
          );
        }
      }
    },
  }));

  addNew() {
    const fields: PromptFields = {
      username: {
        label: 'نام کاربری',
        control: new FormControl(undefined, Validators.required),
        eng: true,
        ltr: true,
      },
      password: {
        label: 'رمز عبور',
        control: new FormControl(undefined, Validators.required),
        eng: true,
        ltr: true,
      },
    };

    this.dialog
      .open(PromptDialogComponent, {
        data: {
          title: 'ایجاد اکانت جدید',
          fields,
        },
        width: '450px',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.addMutation.mutate(data);
        }
      });
  }
}
