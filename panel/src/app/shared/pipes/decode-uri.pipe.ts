import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decodeUri'
})
export class DecodeUriPipe implements PipeTransform {
  transform(value: string): string {
    return value ? decodeURIComponent(value) : value;
  }
}