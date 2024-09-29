import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrugInteractionsComponent } from './drug-interactions.component';

describe('DrugInteractionsComponent', () => {
  let component: DrugInteractionsComponent;
  let fixture: ComponentFixture<DrugInteractionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrugInteractionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DrugInteractionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
