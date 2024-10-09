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
}
