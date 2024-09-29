export class Drug {
  id: string;
  name: string;
  globalId?: string;
  duplicateDrugPresent?: boolean;
}

export class DrugInteraction {
  message?: string;
  result: {
    items: Drug[];
    riskRating: string;
    url: string;
  }[];
}
