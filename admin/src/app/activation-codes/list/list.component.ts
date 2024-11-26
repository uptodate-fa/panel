import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ActivationCode } from '@uptodate/types';
import { ActivationCodeTableComponent } from './table/table.component';
import { SHARED } from '../../shared';
import { MatDialog } from '@angular/material/dialog';
import {
  PromptDialogComponent,
  PromptFields,
} from '../../shared/dialogs/prompt-dialog/prompt-dialog.component';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-activation-codes-list',
  standalone: true,
  imports: [CommonModule, ActivationCodeTableComponent, SHARED],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ActivationCodesListComponent {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private readonly queryClient = inject(QueryClient);

  query = injectQuery(() => ({
    queryKey: ['activationCodes'],
    queryFn: () =>
      lastValueFrom(this.http.get<ActivationCode[]>(`/api/activationCodes`)),
  }));

  addMutation = injectMutation(() => ({
    mutationFn: (dto: ActivationCode) =>
      lastValueFrom(
        this.http.post<ActivationCode>(`/api/activationCodes`, dto),
      ),
    onSuccess: async (data) => {
      await this.queryClient.cancelQueries({ queryKey: ['activationCodes'] });

      const previousData = this.queryClient.getQueryData<ActivationCode[]>([
        'activationCodes',
      ]);

      if (previousData) {
        if (data) {
          this.queryClient.setQueryData<ActivationCode[]>(['activationCodes'], (old) => [
            ...(old || []),
            data,
          ]);
        }
      }
    },
  }));

  addNew() {
    const fields: PromptFields = {
      title: {
        label: 'عنوان',
        control: new FormControl('', Validators.required),
        hint: 'مثلا:‌ اسم سایت یا شخصی که کدها را در اختیارش قرار میدهید',
      },
      maxActiveDevices: {
        label: 'تعداد مجاز دستگاه',
        control: new FormControl('', Validators.required),
        type: 'number',
      },
      period: {
        label: 'تعداد روز',
        control: new FormControl('', Validators.required),
        hint: 'سالیانه ماهیانه',
        placeholder: 'برای سالیانه ۳۶۶ و ۶ ماهه ۱۸۳',
        type: 'number',
      },
      expiredAt: {
        label: 'تاریخ انقضا',
        control: new FormControl('', Validators.required),
        type: 'date',
      },
    };

    this.dialog
      .open(PromptDialogComponent, {
        data: {
          title: 'ایجاد کدفعالسازی جدید',
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
