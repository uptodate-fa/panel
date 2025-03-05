import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'baseUrl',
})
export class BaseUrlPipe implements PipeTransform {
  transform(url: string): string {
    if (!url) return '';
    return url.split('?')[0]; // Extracts everything before '?'
  }
}
