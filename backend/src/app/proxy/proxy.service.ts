import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpService } from '@nestjs/axios';
import {
  Content,
  ContentAbstract,
  ContentSearchResult,
  Drug,
  DrugInteraction,
  DrugPanelTab,
  Graphic,
  SearchResult,
  TableOfContent,
} from '@uptodate/types';
import { AxiosRequestConfig } from 'axios';
import { captureEvent } from '@sentry/node';
import { UPTODATE_GRAPHICS } from './uptodate-graphics-2018.consts';

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
      { skipLogin: true, key: 'pre-search' },
    );

    return response?.data?.data?.searchTerms;
  }

  async search(query: string, sp = 0, limit = 20): Promise<SearchResult> {
    const url = `https://www.uptodate.com/services/app/contents/search/2/json?search=${query}&max=${limit}&sp=${sp}`;
    console.log('search url', url);
    const response = await this.request(
      {
        url,
      },
      { key: 'search', skipLogin: true },
    );
    const data = response?.data?.data;

    if (data) {
      console.log('search result success');
      const contents = data.searchResults
        .filter((item) => item.type === 'medical')
        .map(
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
                  }) as ContentSearchResult,
              ),
            }) as ContentSearchResult,
        );

      const result: SearchResult = {
        contents,
      };

      const drugPanel = data.searchResults.find(
        (item) => item.type === 'drug_info_panel',
      );
      const qap = data.searchResults.find((item) => item.type === 'QAP');
      if (drugPanel) {
        result.drugPanel = {
          title: drugPanel.searchResults?.[0]?.title?.split(':')?.[0],
          tabs: drugPanel.searchResults?.map(
            (tab) =>
              ({
                contentTitle: tab.title,
                contentUrl: tab.url,
                label: tab.subtype?.split('_')?.[1],
                accordions: tab.drugPanel?.accordion,
                alerts: tab.drugPanel?.alerts,
                dosing: tab.drugPanel?.dosing,
              }) as DrugPanelTab,
          ),
        };
      } else if (qap) {
        result.drugPanel = {
          title: qap.qapContents?.[0]?.title?.split(':')?.[0],
          tabs: qap.qapContents?.map((tab) => {
            const links = tab.sections?.find((x) => x.type === 'links');
            const dips = tab.sections?.find((x) => x.type === 'dip');
            return {
              label: tab.contentLabel,
              links: links,
              alerts: dips?.items,
            } as DrugPanelTab;
          }),
        };
      }

      return result;
    }
    return {
      contents: [],
    };
  }

  async content(id: string) {
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/contents/topic/${id}/json`,
      },
      { key: 'content' },
    );

    const data = response?.data?.data;
    return {
      bodyHtml: data?.bodyHtml,
      uptodateId: data?.topicInfo?.id,
      outlineHtml: data?.outlineHtml,
      title: data?.topicInfo?.title,
      relatedGraphics: data?.topicInfo?.relatedGraphics,
    } as Content;
  }

  async printContent(id: string) {
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/contents/topic/${id}/print/json`,
      },
      { key: 'print-content' },
    );

    const data = response?.data?.data;
    return {
      bodyHtml: data?.printHtml,
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
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/contents/topic/${topic}/citation/${range}/json`,
      },
      { key: 'content-abstract' },
    );

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
          texts: item.abstractTexts?.map((x) => `${x.name}: ${x.text}`),
          links: item.links?.map((x) => ({
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
    const exist = UPTODATE_GRAPHICS[id];
    if (exist) {
      captureEvent({
        message: 'get graphic',
        level: 'log',
        transaction: imageKey,
        tags: {
          source: 'db',
        },
      });
      return {
        imageKey,
        title: exist.title,
        imageHtml: exist.html,
      } as Graphic;
    }
    captureEvent({
      message: 'get graphic',
      level: 'log',
      transaction: imageKey,
      tags: {
        source: 'uptodate',
      },
    });
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/contents/graphic/detailed/${id}/en_us/json?imageKey=${imageKey}&id=${id}${topicKey ? '&topicKey=' + topicKey : ''}`,
      },
      { key: 'graphic' },
    );

    const data = response?.data?.data;
    return {
      imageHtml: data?.imageHtml,
      title: data?.graphicInfo?.title,
      imageKey: data?.graphicInfo?.imageKey,
      relatedGraphics: data?.relatedGraphics,
    } as Graphic;
  }

  async outline(id: string) {
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/outline/topic/${id}/en-US/json`,
      },
      { key: 'outline' },
    );

    const data = response?.data?.data;
    return {
      id: data?.topicId,
      outlineHtml: data?.outlineHtml,
      title: data?.topicTitle,
    } as Content;
  }

  async searchDrug(query: string) {
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/drug/interaction/search/autocomplete/json?term=${query}&page=1&pageSize=10`,
      },
      { key: 'search-drug' },
    );

    const data = response?.data?.data;
    return data.drugs as Drug[];
  }

  async drugInteractions(ids: string[]) {
    const drugsQueryParam = ids.map((id) => `drug=${id}`).join('&');
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/drug/interaction/search/json?${drugsQueryParam}`,
      },
      { key: 'drug-interactions' },
    );

    const data = response?.data?.data;
    return {
      result: data.searchResults,
      message: data.message,
    } as DrugInteraction;
  }

  async drugInteractionsDetails(id: string) {
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/drug/interaction/${id}/json`,
      },
      { key: 'drug-interactions-details' },
    );

    return response?.data?.data;
  }

  async tableOfContent(topic?: string, sub?: string) {
    let category = '';
    if (topic) category += `/${topic}`;
    if (sub) category = `/${sub}`;
    const response = await this.request(
      {
        url: `https://www.uptodate.com/services/app/contents/table-of-contents${category}/json`,
      },
      { key: 'table-of-content' },
    );

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
    props?: { skipRetry?: boolean; skipLogin?: boolean; key?: string },
  ) {
    const client = this.auth.client;
    if (!client || props?.skipLogin)
      return this.http.request(config).toPromise();

    try {
      captureEvent({
        message: 'uptodate request',
        level: 'debug',
        transaction: props?.key || config.url,
        tags: {
          username: client.account.username,
        },
      });
    } catch (error) {
      // do nothing
    }

    try {
      const response = await client.instance.request(config);
      const needLogin = await this.auth.needLogin(response?.data);
      if (!props?.skipRetry && !props?.skipLogin && needLogin) {
        await this.auth.login(client, config.url);
        return this.request(config, { skipRetry: true });
      }
      return response;
    } catch (error) {
      if (!props?.skipRetry && error.response?.status === 403) {
        await this.auth.login(client, config.url);
        return this.request(config, { skipRetry: true });
      }
      throw error;
    }
  }
}
