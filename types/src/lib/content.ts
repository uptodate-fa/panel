export class Content {
  id: string;
  uptodateId: string;
  queryStringId: string;
  url: string;
  title: string;
  outlineHtml: string;
  bodyHtml: string;
  translatedAt?: Date;
  translatedOutlineHtml?: string;
  translatedBodyHtml?: string;
  relatedGraphics?: Graphic[];
}

export class Graphic {
  imageKey: string;
  title: string;
  type: string;
  imageHtml?: string;
  relatedGraphics?: Graphic[];
}

export class ContentAbstract {
  citationNumber: number;
  title: string;
  affiliation?: string;
  authors?: string;
  pmid?: string;
  source?: string;
  links?: {label: string, url: string}[];
  texts?: string[];
  content?: Content;
}
