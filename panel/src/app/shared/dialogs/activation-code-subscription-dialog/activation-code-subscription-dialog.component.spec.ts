import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivationCodeSubscriptionDialogComponent } from './activation-code-subscription-dialog.component';

describe('ActivationCodeSubscriptionDialogComponent', () => {
  let component: ActivationCodeSubscriptionDialogComponent;
  let fixture: ComponentFixture<ActivationCodeSubscriptionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivationCodeSubscriptionDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ActivationCodeSubscriptionDialogComponent,
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
