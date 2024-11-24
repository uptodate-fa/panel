import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pdate',
  standalone: true,
})
export class PdatePipe implements PipeTransform {
  transform(value?: Date | string): string {
    if (value) {
      const date = new Date(value);
      const formatter = new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      return formatter.format(date);
    }
    return '';
  }
}
