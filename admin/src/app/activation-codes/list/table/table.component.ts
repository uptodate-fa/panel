import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivationCode, HALF_YEAR_DAYS, YEARLY_DAYS } from '@uptodate/types';
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
  selector: 'app-activation-code-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, SHARED],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class ActivationCodeTableComponent {
  YEARLY_DAYS = YEARLY_DAYS;
  HALF_YEAR_DAYS = HALF_YEAR_DAYS;
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly queryClient = inject(QueryClient);
  codes = input<ActivationCode[] | undefined>([]);
  readonly displayedColumns = [
    'title',
    'period',
    'maxDevices',
    'expiredAt',
    'codes',
    'createdAt',
    'actions',
  ];

  addCodeMutation = injectMutation(() => ({
    mutationFn: (dto: { code: ActivationCode; count: number }) =>
      lastValueFrom(
        this.http.get<string[]>(
          `/api/activationCodes/addCode/${dto.code._id}/${dto.count}`,
        ),
      ),
    onSuccess: async (data, dto) => {
      await this.queryClient.cancelQueries({ queryKey: ['activationCodes'] });

      const previousData = this.queryClient.getQueryData<ActivationCode[]>([
        'activationCodes',
      ]);

      if (previousData) {
        const exist = previousData?.find((x) => x._id === dto.code._id);
        if (exist) {
          exist.codes.push(...data);
          this.queryClient.setQueryData<ActivationCode[]>(['activationCodes'], (old) =>
            old ? [...old] : [],
          );
        }
      }
      this.download(data);
    },
  }));

  download(codes: string[], fileName = 'activation-codes.txt') {
    const content = codes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  addNewCodes(code: ActivationCode) {
    const fields: PromptFields = {
      count: {
        label: 'تعداد',
        control: new FormControl(100, Validators.required),
        type: 'number',
      },
    };

    this.dialog
      .open(PromptDialogComponent, {
        data: {
          title: 'اضافه کردن کد به آیتم',
          fields,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.addCodeMutation.mutate({ code, count: data['count'] });
        }
      });
  }
}
