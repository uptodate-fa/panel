import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpService } from '@nestjs/axios';
import { SearchResult } from '@uptodate/types';

@Injectable()
export class ProxyService {
  constructor(private auth: AuthService, private http: HttpService) {}

  async preSearch(query: string, limit = 10): Promise<string[]> {
    const response = await this.http
      .get<any>(
        `https://www.uptodate.com/services/app/contents/search/autocomplete/json?term=${query}&limit=${limit}`,
        {}
      )
      .toPromise();

    return response?.data?.data?.searchTerms;
  }

  async search(query: string, limit = 10): Promise<SearchResult[]> {
    const response = await this.http
      .get<any>(
        `https://www.uptodate.com/services/app/contents/search/2/json?search=${query}&max=${limit}`,
        {}
      )
      .toPromise();

    const data = response?.data?.data;

    if (data) {
      return data.searchResults.map(
        (item) =>
          ({
            title: item.title,
            url: item.url,
            description: item.snippet,
            results: item.searchResults?.map(
              (sub) =>
                ({
                  title: sub.title,
                  url: sub.url,
                } as SearchResult)
            ),
          } as SearchResult)
      );
    }
    return [];
  }
}
