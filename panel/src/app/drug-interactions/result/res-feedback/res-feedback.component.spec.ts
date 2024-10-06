import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResFeedbackComponent } from './res-feedback.component';

describe('ResFeedbackComponent', () => {
  let component: ResFeedbackComponent;
  let fixture: ComponentFixture<ResFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResFeedbackComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
