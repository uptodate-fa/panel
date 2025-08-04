export class TableOfContent {
  name: string;
  items?: {
    name: string;
    url: string;
    type: string;
    topicId?: string;
  }[];
  type?: string;
  sections?: TableOfContent[];
}
