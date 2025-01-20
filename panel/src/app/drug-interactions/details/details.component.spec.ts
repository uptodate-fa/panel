import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrugInteractionDetailsComponent } from './details.component';

describe('DrugInteractionDetailsComponent', () => {
  let component: DrugInteractionDetailsComponent;
  let fixture: ComponentFixture<DrugInteractionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrugInteractionDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DrugInteractionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
