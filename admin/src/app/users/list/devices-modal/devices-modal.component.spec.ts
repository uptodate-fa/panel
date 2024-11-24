import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDevicesModalComponent } from './devices-modal.component';

describe('UserDevicesModalComponent', () => {
  let component: UserDevicesModalComponent;
  let fixture: ComponentFixture<UserDevicesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDevicesModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDevicesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
