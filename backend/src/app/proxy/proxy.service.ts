import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpService } from '@nestjs/axios';
import {
  Content,
  ContentAbstract,
  Drug,
  DrugInteraction,
  Graphic,
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
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/contents/search/autocomplete/json?term=${query}&limit=${limit}`,
      },
      { skipLogin: true },
    );

    return response?.data?.data?.searchTerms;
  }

  async search(query: string, sp = 0, limit = 20): Promise<SearchResult[]> {
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/contents/search/2/json?search=${query}&max=${limit}&sp=${sp}`,
      },
      { skipLogin: true },
    );
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

  async contentAbstract(
    topic: string,
    range: string,
  ): Promise<ContentAbstract[]> {
    const response = await this.request({
      url: `https://www.uptodate.com/services/app/contents/topic/${topic}/citation/${range}/json`,
    });

    const data = response?.data?.data;
    return data.citations.map(
      (item) =>
        ({
          citationNumber: item.citationInfo.citationNumber,
          title: item.abstractInfo.title,
          affiliation: item.abstractInfo.affiliation,
          authors: item.abstractInfo.authors,
          pmid: item.abstractInfo.pmid,
          source: item.abstractInfo.source,
          texts: item.abstractTexts.map((x) => `${x.name}: ${x.text}`),
          links: item.links.map((x) => ({
            ...x,
            url: `https://uptodate.com${x.url}`,
          })),
          content: {
            title: data.topicInfo.title,
          },
        }) as ContentAbstract,
    );
  }

  async graphic(imageKey: string, topicKey?: string) {
    const id = imageKey.split('/')[1];
    const response = await this.request({
      url: `https://www.uptodate.com/services/app/contents/graphic/detailed/${id}/en_us/json?imageKey=${imageKey}&id=${id}${topicKey ? '&topicKey=' + topicKey : ''}`,
    });

    const data = response?.data?.data;
    return {
      imageHtml: data?.imageHtml,
      title: data?.graphicInfo?.title,
      imageKey: data?.graphicInfo?.imageKey,
      relatedGraphics: data?.relatedGraphics,
    } as Graphic;
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

  private async request(
    config: AxiosRequestConfig,
    props?: { skipRetry?: boolean; skipLogin?: boolean },
  ) {
    try {
      const response = await this.auth.client.request(config);
      const needLogin = await this.auth.needLogin(response?.data);
      if (!props?.skipRetry && !props?.skipLogin && needLogin) {
        await this.auth.login();
        console.warn('no user', config.url);
        return this.request(config, { skipRetry: true });
      }
      return response;
    } catch (error) {
      if (!props?.skipRetry && error.response?.status === 403) {
        await this.auth.login();
        console.warn('403', config.url);
        return this.request(config, { skipRetry: true });
      }
      throw error;
    }
  }
}
