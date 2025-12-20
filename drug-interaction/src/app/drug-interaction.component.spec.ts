import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrugInteractionComponent } from './drug-interaction.component';

describe('DrugInteractionComponent', () => {
  let component: DrugInteractionComponent;
  let fixture: ComponentFixture<DrugInteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrugInteractionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DrugInteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

