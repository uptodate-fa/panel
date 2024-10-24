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
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  constructor(
    private auth: AuthService,
    private http: HttpService,
  ) {}

  async preSearch(query: string, limit = 10): Promise<string[]> {
    const response = await this.request({
      url: `https://www.uptodate.com/services/app/contents/search/autocomplete/json?term=${query}&limit=${limit}`,
    });

    return response?.data?.data?.searchTerms;
  }

  async search(query: string, sp = 0, limit = 20): Promise<SearchResult[]> {
    const response = await this.request({
      url: `https://www.uptodate.com/services/app/contents/search/2/json?search=${query}&max=${limit}&sp=${sp}`,
    });
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
    const response = await this.request({
      url: `https://www.uptodate.com/services/app/contents/topic/${id}/json`,
    });

    const data = response?.data?.data;
    return {
      bodyHtml: data?.bodyHtml,
      uptodateId: data?.topicInfo?.id,
      outlineHtml: data?.outlineHtml,
      title: data?.topicInfo?.title,
      relatedGraphics: data?.topicInfo?.relatedGraphics,
    } as Content;
  }

  async outline(id: string) {
    const response = await this.request({
      url: `https://www.uptodate.com/services/app/outline/topic/${id}/en-US/json`,
    });

    const data = response?.data?.data;
    return {
      id: data?.topicId,
      outlineHtml: data?.outlineHtml,
      title: data?.topicTitle,
    } as Content;
  }

  async searchDrug(query: string) {
    const response = await this.request({
      url: `https://www.uptodate.com/services/app/drug/interaction/search/autocomplete/json?term=${query}&page=1&pageSize=10`,
    });

    const data = response?.data?.data;
    return data.drugs as Drug[];
  }

  async drugInteractions(ids: string[]) {
    const drugsQueryParam = ids.map((id) => `drug=${id}`).join('&');
    const response = await this.request({
      url: `https://www.uptodate.com/services/app/drug/interaction/search/json?${drugsQueryParam}`,
    });

    const data = response?.data?.data;
    return {
      result: data.searchResults,
      message: data.message,
    } as DrugInteraction;
  }

  async tableOfContent(topic: string, sub?: string) {
    const response = await this.request({
      url: `https://www.uptodate.com/services/app/contents/table-of-contents/${sub ? `${topic}/${sub}` : topic}/json`,
    });

    const data = response?.data?.data;
    return {
      name: data.name,
      items: data.items?.map((d) => ({
        name: d.name,
        url: d.url,
      })),
      sections: data.sections?.map((section) => ({
        name: section.name,
        items: section.items?.map((d) => ({
          name: d.name,
          url: d.url,
        })),
      })),
    } as TableOfContent;
  }

  private async request(config: AxiosRequestConfig, skipRetry?: boolean) {
    try {
      const response = await this.auth.client.request(config);
      const needLogin = await this.auth.needLogin(response?.data);
      if (!skipRetry && config.headers && needLogin) {
        await this.auth.login();
        console.warn('no user', config.url);
        return this.request(config, true);
      }
      return response;
    } catch (error) {
      if (!skipRetry && error.response?.status === 403) {
        await this.auth.login();
        console.warn('403', config.url);
        return this.request(config, true);
      }
      throw error;
    }
  }
}
