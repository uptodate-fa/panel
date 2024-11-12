export class SearchResult {
  contents: ContentSearchResult[];
  drugPanel?: DrugPanel;
}

export class ContentSearchResult {
  id: string;
  title: string;
  description?: string;
  url: string;
  results?: ContentSearchResult[];
}

export class DrugPanel {
  title: string;
  tabs: DrugPanelTab[];
}

export class DrugPanelTab {
  label: string;
  contentTitle: string;
  contentUrl: string;
  accordions?: Accordion[];
  alerts?: Alert[];
  dosing?: Dosing[];
}

class Accordion {
  name: string;
  value: string;
}

class Alert {
  label: string;
  url: string;
}

class Dosing {
  label: string;
  url: string;
  childDrugContent?: Dosing[];
}
