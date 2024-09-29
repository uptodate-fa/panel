import { TestBed } from '@angular/core/testing';

import { DrugInteractionsService } from './drug-interactions.service';

describe('DrugInteractionsService', () => {
  let service: DrugInteractionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrugInteractionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
