import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'queryParams',
})
export class QueryParamsPipe implements PipeTransform {
  transform(url: string): { [key: string]: string } {
    if (!url || !url.includes('?')) return {};

    const queryParamsString = url.split('?')[1]; // Get the query string
    const queryParams: { [key: string]: string } = {};

    new URLSearchParams(queryParamsString).forEach((value, key) => {
      queryParams[key] = decodeURIComponent(value);
    });

    return queryParams;
  }
}
