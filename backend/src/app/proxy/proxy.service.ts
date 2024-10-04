import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpService } from '@nestjs/axios';
import {
  Content,
  Drug,
  DrugInteraction,
  SearchResult,
  TableOfContent,
} from '@uptodate/types';

@Injectable()
export class ProxyService {
  constructor(
    private auth: AuthService,
    private http: HttpService,
  ) {}

  async preSearch(query: string, limit = 10): Promise<string[]> {
    const response = await this.http
      .get<any>(
        `https://www.uptodate.com/services/app/contents/search/autocomplete/json?term=${query}&limit=${limit}`,
        // {
        //   headers: await this.auth.headers(),
        // },
      )
      .toPromise();
    // await this.auth.checkLogin('presearch', response?.data);

    return response?.data?.data?.searchTerms;
  }

  async search(query: string, limit = 10): Promise<SearchResult[]> {
    const response = await this.http
      .get<any>(
        `https://www.uptodate.com/services/app/contents/search/2/json?search=${query}&max=${limit}`,
        {
          headers: await this.auth.headers(),
        },
      )
      .toPromise();
    await this.auth.checkLogin('search', response?.data);
    const data = response?.data?.data;

    if (data) {
      return data.searchResults.map(
        (item) =>
          ({
            id: item.id,
            title: item.title,
            url: item.url,
            description: item.snippet,
            results: item.searchResults?.map(
              (sub) =>
                ({
                  title: sub.title,
                  url: sub.url,
                }) as SearchResult,
            ),
          }) as SearchResult,
      );
    }
    return [];
  }

  async content(id: string) {
    const response = await this.http
      .get<any>(
        `https://www.uptodate.com/services/app/contents/topic/${id}/json`,
        {
          headers: await this.auth.headers(),
        },
      )
      .toPromise();
    await this.auth.checkLogin('content', response?.data);

    const data = response?.data?.data;
    return {
      bodyHtml: data?.bodyHtml,
      uptodateId: data?.topicInfo?.id,
      outlineHtml: data?.outlineHtml,
      title: data?.topicInfo?.title,
    } as Content;
  }

  async outline(id: string) {
    const response = await this.http
      .get<any>(
        `https://www.uptodate.com/services/app/outline/topic/${id}/en-US/json`,
        {
          headers: await this.auth.headers(),
        },
      )
      .toPromise();
    await this.auth.checkLogin('content', response?.data);

    const data = response?.data?.data;
    return {
      id: data?.topicId,
      outlineHtml: data?.outlineHtml,
      title: data?.topicTitle,
    } as Content;
  }

  async searchDrug(query: string) {
    const response = await this.http
      .get<any>(
        `https://www.uptodate.com/services/app/drug/interaction/search/autocomplete/json?term=${query}&page=1&pageSize=10`,
        {
          headers: await this.auth.headers(),
        },
      )
      .toPromise();
    await this.auth.checkLogin('content', response?.data);

    const data = response?.data?.data;
    return data.drugs as Drug[];
  }

  async drugInteractions(ids: string[]) {
    const drugsQueryParam = ids.map((id) => `drug=${id}`).join('&');
    const response = await this.http
      .get<any>(
        `https://www.uptodate.com/services/app/drug/interaction/search/json?${drugsQueryParam}`,
        {
          headers: await this.auth.headers(),
        },
      )
      .toPromise();
    await this.auth.checkLogin('content', response?.data);

    const data = response?.data?.data;
    return {
      result: data.searchResults,
      message: data.message,
    } as DrugInteraction;
  }

  async tableOfContent(topic: string) {
    const response = await this.http
      .get<any>(
        `https://www.uptodate.com/services/app/contents/table-of-contents/${topic}/json`,
      )
      .toPromise();

    const data = response?.data?.data;
    return {
      name: data.name,
      items: data.map((d) => ({
        name: d.name,
        url: d.url,
      })),
    } as TableOfContent;
  }
}
