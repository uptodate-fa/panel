import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../shared/dialogs/alert-dialog/alert-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly dialog = inject(MatDialog);

  async alert(
    title: string,
    description: string,
    extra?: { config?: MatDialogConfig },
  ) {
    return this.dialog
      .open(AlertDialogComponent, {
        ...extra?.config,
        data: { title, description, ...extra?.config?.data },
      })
      .afterClosed()
      .toPromise();
  }
}
