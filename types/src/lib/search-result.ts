export class SearchResult {
  id: string;
  title: string;
  description?: string;
  url: string;
  results?: SearchResult[];
}