import { Test, TestingModule } from '@nestjs/testing';
import { DrugInteractionsController } from './drug-interactions.controller';

describe('DrugInteractionsController', () => {
  let controller: DrugInteractionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrugInteractionsController],
    }).compile();

    controller = module.get<DrugInteractionsController>(
      DrugInteractionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
