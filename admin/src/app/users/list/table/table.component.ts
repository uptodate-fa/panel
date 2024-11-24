import { Component, inject, Input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '@uptodate/types';
import { MatTableModule } from '@angular/material/table';
import { SHARED } from '../../../shared';
import { MatDialog } from '@angular/material/dialog';
import {
  PromptDialogComponent,
  PromptFields,
} from '../../../shared/dialogs/prompt-dialog/prompt-dialog.component';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, SHARED],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class UserTableComponent {
  private readonly dialog = inject(MatDialog);
  @Input() users: Signal<User[] | undefined>;
  readonly displayedColumns = [
    'name',
    'phone',
    'mail',
    'city',
    'job',
    'maxDevice',
    'expired',
    'activationCode',
    'createdAt',
  ];

  changeMaxDevice(user: User) {
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
    this.dialog.open(PromptDialogComponent, {
      data: {
        title: 'تغییر تعداد دستگاه',
        fields,
      },
    });
  }

  changeExpiration(user: User) {
    const fields: PromptFields = {
      maxDevice: {
        label: 'تاریخ انقضا',
        type: 'date',
        control: new FormControl(
          user.subscription?.expiredAt,
          Validators.required,
        ),
      },
    };
    this.dialog.open(PromptDialogComponent, {
      data: {
        title: 'تغییر تاریخ انقضا',
        fields,
      },
    }).afterClosed().subscribe((dto) => {
      console.log(dto);
    });
  }
}
