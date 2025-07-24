export class TableOfContent {
  name: string;
  items?: {
    name: string;
    url: string;
    type: string;
  }[];
  type?: string;
  sections?: TableOfContent[];
}
